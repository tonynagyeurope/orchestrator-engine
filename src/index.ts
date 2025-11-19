import { loadProfile } from "./config/profileLoader.js";
import { normalizeInput } from "./pipeline/normalizeInput.js";
import { analyzeAi } from "./pipeline/analyzeAi.js";
import { synthesizeOutput } from "./pipeline/synthesizeOutput.js";
import { renderTrace } from "./utils/traceRenderer.js";
import kleur from "kleur";
import { getDefaultProvider } from "./reasoning/providerDiscovery.js";
import { defaultProfiles } from "./config/baseConfig.js";
import { ReasoningResult } from "./reasoning/types.js";

/**
 * Orchestrator Engine (OE)
 * ------------------------
 * Entry point of the orchestration core.
 * Executes a full AI-based orchestration pipeline.
 */

const provider = getDefaultProvider();
const profile = defaultProfiles["ai"];
console.log(`[OE] Selected provider: ${provider.id}`);

const result = await provider.analyze(
  "Summarize the key benefits of AWS Bedrock.",
  profile
);
console.log(result);

export async function runOrchestration(input: string, profileId: string) {
  console.log(`[OE] Starting orchestration for profile: ${profileId}`);

  // 1. Load orchestration profile (public or private)
  const profile = await loadProfile(profileId);
  console.log(`[OE] Loaded profile: ${profile.displayName}`);

  // 2. Normalize input
  const normalized = await normalizeInput(input);

  // 3. Run AI analysis
  const analysis = (await analyzeAi(normalized, profile)) as ReasoningResult;

  // 4. Synthesize final output
  const result = await synthesizeOutput(analysis, profile);

  // CLI trace visualization
  renderTrace(result.trace);

  console.log(kleur.green(`[OE] Orchestration completed for "${profile.displayName}".`));
  return result;
}

// Example local run
if (import.meta.url === `file://${process.argv[1]}`) {
  const input = "Analyze a multi-cloud AI pipeline for efficiency.";
  runOrchestration(input, "ai").then((res) => {
    console.log("Result:", JSON.stringify(res, null, 2));
  });
}
