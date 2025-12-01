// FILE: src/pipeline/runSinglePipeline.ts

import { OrchestratorProfile } from "../../config/baseConfig.js";
import { ReasoningProvider } from "../../reasoning/reasoningProvider.js";
import { TraceStep } from "../../reasoning/types.js";
import { runPipeline } from "../runPipeline.js";

/**
 * Wrapper for running a single reasoning profile.
 * Used by CLI, MCP, and top-level API.
 */
export async function runSinglePipeline(
  profile: OrchestratorProfile,
  input: string,
  provider: ReasoningProvider
): Promise<{ final: string; trace: TraceStep[]; meta?: Record<string, unknown> }> {
  return runPipeline(
    profile,
    input,
    async () => profile, // resolveProfile = no-op
    provider
  );
}
