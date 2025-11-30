// FILE: src/pipeline/analyzeAi.ts
import type { OrchestratorProfile } from "../config/baseConfig.js";
import type { ReasoningProvider, ReasoningResult } from "../reasoning/types.js";

/**
 * Executes a single AI reasoning step.
 */
export async function analyzeAi(
  input: string,
  profile: OrchestratorProfile,
  provider: ReasoningProvider
): Promise<ReasoningResult> {
  return provider.run(input, profile);
}
