// FILE: src/index.ts

import { loadProfile } from "./config/profileLoader.js";
import { getProvider } from "./reasoning/providerFactory.js";
import { runSinglePipeline } from "./pipeline/runSinglePipeline.js";

export async function runOrchestration(
  input: string,
  profileId: string,
  providerName?: string
) {
  // Load profile
  const profile = await loadProfile(profileId);

  // Provider selection
  const provider = getProvider(providerName ?? "openai");

  const mode = profile.orchestration?.mode ?? "single";

  switch (mode) {
    case "single":
    case "sequential":
    case "parallel":
      // Top-level API ALWAYS triggers single reasoning mode.
      // Orchestration is only triggered INSIDE profiles, not here.
      return runSinglePipeline(profile, input, provider);

    default:
      throw new Error(`Unknown orchestration mode: ${mode}`);
  }
}
