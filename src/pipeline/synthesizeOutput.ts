// src/pipeline/synthesizeOutput.ts

import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * Step 3 - Synthesize Output
 * Generates a structured JSON output for downstream visualization or storage.
 */
export async function synthesizeOutput(
  analysis: { summary: string; steps: string[]; meta?: Record<string, unknown> },
  profile: OrchestratorProfile
): Promise<{
  profile: string;
  summary: string;
  steps: string[];
  meta?: Record<string, unknown>;
}> {
  return {
    profile: profile.displayName,
    summary: analysis.summary,
    steps: analysis.steps,
    meta: analysis.meta
  };
}
