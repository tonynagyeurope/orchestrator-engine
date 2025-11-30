// FILE: src/pipeline/runPipeline.ts
import type { OrchestratorProfile } from "../config/baseConfig.js";
import { ReasoningProvider, ReasoningResult, TraceStep } from "../reasoning/types.js";


import { analyzeAi } from "./analyzeAi.js";

/**
 * Minimal reasoning loop (A-option):
 *  - maxSteps (default 1)
 *  - run provider repeatedly
 *  - break if no major evolution in the output
 */
export async function runPipeline(
  input: string,
  profile: OrchestratorProfile,
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

    // break if output didn't change significantly
    if (res.final.trim() === lastOutput.trim()) break;
    lastOutput = res.final;
  }

  return finalResult;
}
