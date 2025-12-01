// FILE: src/pipeline/runReasoningPipeline.ts

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type { TraceStep, ReasoningProvider, ReasoningResult } from "../reasoning/types.js";
import { analyzeAi } from "./analyzeAi.js";

/**
 * Low-level reasoning loop.
 *
 * Executes the AI provider multiple times (maxSteps),
 * collecting all trace output and stopping early if the result
 * does not evolve anymore.
 *
 * This module contains NO orchestration logic.
 */
export async function runReasoningPipeline(
  profile: OrchestratorProfile,
  input: string,
  provider: ReasoningProvider
): Promise<ReasoningResult> {

  const steps = profile.maxSteps ?? 1;

  let lastOutput = "";
  let mergedTrace: TraceStep[] = [];
  let finalResult: ReasoningResult = {
    final: "",
    trace: []
  };

  for (let i = 0; i < steps; i++) {
    const res = await analyzeAi(input, profile, provider);

    mergedTrace = [...mergedTrace, ...res.trace];
    finalResult = { ...res, trace: mergedTrace };

    // stop if result stabilized
    if (res.final.trim() === lastOutput.trim()) break;
    lastOutput = res.final;
  }

  return finalResult;
}
