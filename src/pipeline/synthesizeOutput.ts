// FILE: src/pipeline/synthesizeOutput.ts
import type { OrchestratorProfile } from "../config/baseConfig.js";
import { ReasoningResult } from "../reasoning/types.js";

/**
 * For A-option simplicity:
 * final = result.final (LLM output)
 * trace = provider-generated reasoning chain
 */
export async function synthesizeOutput(
  result: ReasoningResult,
  profile: OrchestratorProfile
) {
  return {
    final: result.final,
    trace: result.trace,
    profileId: profile.id
  };
}
