// FILE: src/pipeline/runOrchestratorPipeline.ts

import { getProvider } from "../reasoning/providerFactory.js";
import { loadProfile } from "../config/profileLoader.js";
import { runPipeline } from "./runPipeline.js";

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type { TraceStep } from "../reasoning/types.js";

/**
 * Stage-3 unified orchestration entrypoint.
 * Resolves provider, loads profile, runs Stage-3 pipelines and returns
 * the standardized orchestration result format expected by UI/Lambda.
 */
export async function runOrchestratorPipeline(args: {
  provider: string;     // "openai" | "bedrock" | "test"
  input: string;
  profileId: string;
}): Promise<{
  profile: string;
  summary: string;
  final: string;
  trace: TraceStep[];
  steps: string[];
  provider: string;
}> {
  const { provider, input, profileId } = args;
  
  console.log("TEST PROVIDER =", provider);

  // 1) Load the OrchestratorProfile JSON
  const profile: OrchestratorProfile = await loadProfile(profileId);

  // 2) Resolve the correct reasoning provider (OpenAI / Bedrock / Mock)
  const providerInstance = getProvider(provider);

  // 3) Required by Stage-3 runPipeline(): resolveProfile function
  const resolveProfile = async (id: string): Promise<OrchestratorProfile> => {
    return loadProfile(id);
  };

  // 4) Run the correct pipeline mode (single / sequential / parallel)
  //
  // Correct Stage-3 signature:
  // runPipeline(profile, input, resolveProfile, providerInstance)
  //
  const { final, trace } = await runPipeline(
    profile,
    input,
    resolveProfile,
    providerInstance
  );

  // 5) Synthesize a summary from trace (Stage-3 responsibility)
  const summary =
    trace.length > 0 ? trace[0].message : "No summary available.";

  // 6) Generate executed step identifiers
  const steps = trace.map((_, index) => `step-${index + 1}`);

  // 7) Stage-3 standardized return format
  return {
    profile: profileId,
    summary,
    final,
    trace,
    steps,
    provider
  };
}
