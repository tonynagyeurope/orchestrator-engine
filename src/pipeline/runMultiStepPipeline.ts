// FILE: src/pipeline/runMultiStepPipeline.ts

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type { ReasoningProvider } from "../reasoning/reasoningProvider.js";
import type { TraceStep, ReasoningResult } from "../reasoning/types.js";

const TIMEOUT_MS = 8000;       // provider run() timeout
const MAX_OUTPUT_LENGTH = 5000; // output length guard

/**
 * Wraps any async call with a timeout.
 * Rejects after N milliseconds with an Error("timeout:xxxms").
 */
function withTimeout<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`timeout:${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(id);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

function detectStopSignal(text: string): { stop: boolean; reason: string } {
  const n = text.trim().toLowerCase();
  if (n.startsWith("final")) {
    return { stop: true, reason: "llm-final" };
  }
  return { stop: false, reason: "" };
}

function enrichTraceItems(
  items: TraceStep[],
  step: number,
  source: "provider" | "pipeline" | "stop-rule",
  startIndex: number
): TraceStep[] {
  return items.map((item, i) => ({
    ...item,
    step,
    source,
    index: startIndex + i,
    timestamp: new Date().toISOString()
  }));
}

export async function runMultiStepPipeline(
  input: string,
  profile: OrchestratorProfile,
  provider: ReasoningProvider
): Promise<ReasoningResult> {

  let currentInput = input;
  let previousOutput = "";

  const combinedTrace: TraceStep[] = [];
  let finalOutput = "";
  let stepsExecuted = 0;

  for (let step = 0; step < profile.maxSteps; step++) {

    //
    // Step start marker
    //
    combinedTrace.push({
        step,
        source: "pipeline",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        message: `Step ${step} started`
    });

    //
    // STEP 1 — Timeout guard on provider.run()
    //
    let partial;
    try {
        partial = await withTimeout(
        TIMEOUT_MS,
        provider.run(currentInput, profile)
        );
    } catch (err) {
        combinedTrace.push({
        step,
        source: "stop-rule",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        event: "stop:timeout",
        message: `Stop: provider step timed out: ${String(err)}`
        });
        finalOutput = previousOutput;
        break;
    }

    //
    // STEP 2 — Malformed output guard
    //
    if (!partial || typeof partial.final !== "string" || !Array.isArray(partial.trace)) {
        combinedTrace.push({
        step,
        source: "stop-rule",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        event: "stop:malformed",
        message: "Stop: Provider returned malformed reasoning result"
        });
        finalOutput = previousOutput;
        break;
    }

    //
    // Enrich provider trace
    //
    const enriched = enrichTraceItems(
        partial.trace,
        step,
        "provider",
        combinedTrace.length
    );
    combinedTrace.push(...enriched);

    const output = partial.final;
    stepsExecuted += 1;

    //
    // STEP 3 — Output overflow guard
    //
    if (output.length > MAX_OUTPUT_LENGTH) {
        combinedTrace.push({
        step,
        source: "stop-rule",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        event: "stop:overflow",
        message: `Stop: Output exceeded max length (${MAX_OUTPUT_LENGTH} chars)`
        });
        finalOutput = output.slice(0, MAX_OUTPUT_LENGTH);
        break;
    }

    //
    // STOP RULE 1: LLM explicit "FINAL"
    //
    const stopCheck = detectStopSignal(output);
    if (stopCheck.stop) {
        combinedTrace.push({
        step,
        source: "stop-rule",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        event: stopCheck.reason,
        message: `Stop: Model indicated completion ("${stopCheck.reason}")`
        });
        finalOutput = output;
        break;
    }

    //
    // STOP RULE 2: Stabilization
    //
    if (previousOutput.trim() === output.trim()) {
        combinedTrace.push({
        step,
        source: "stop-rule",
        index: combinedTrace.length,
        timestamp: new Date().toISOString(),
        event: "stop:stabilized",
        message: `Stop: Output stabilized at step ${step}`
        });
        finalOutput = output;
        break;
    }

    //
    // Continue (auto-chain)
    //
    previousOutput = output;
    currentInput = output;
    finalOutput = output;
  }

  return {
    final: finalOutput,
    trace: combinedTrace,
    meta: {
      mode: "multi-step",
      stepsExecuted
    }
  };
}
