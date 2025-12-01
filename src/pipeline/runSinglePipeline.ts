// FILE: src/pipeline/runSinglePipeline.ts

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type { ReasoningProvider, ReasoningResult } from "../reasoning/types.js";
import { runReasoningPipeline } from "./runReasoningPipeline.js";

/**
 * Executes a SINGLE pipeline profile.
 * This means no orchestration, only reasoning logic.
 *
 * Used when:
 *   - profile.orchestration?.mode === "single"
 *   - summary pipelines
 *   - leaf nodes of sequential/parallel orchestrations
 */
export async function runSinglePipeline(
  profile: OrchestratorProfile,
  input: string,
  provider: ReasoningProvider
): Promise<ReasoningResult> {
  return runReasoningPipeline(profile, input, provider);
}
