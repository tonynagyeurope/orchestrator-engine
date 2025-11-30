// FILE: src/index.ts
import kleur from "kleur";
import { loadProfile } from "./config/profileLoader.js";
import { getDefaultProvider } from "./reasoning/providerDiscovery.js";
import { runPipeline } from "./pipeline/runPipeline.js";
import { renderTrace } from "./utils/traceRenderer.js";

/**
 * Main orchestration entry point.
 */
export async function runOrchestration(
  input: string,
  profileId: string
) {
  console.log(`[OE] Starting orchestration for profile: ${profileId}`);

  const profile = await loadProfile(profileId);

  const provider = getDefaultProvider();
  console.log(`[OE] Selected provider: ${provider.id}`);

  const result = await runPipeline(input, profile, provider);

  renderTrace(result.trace);

  console.log(kleur.green(`[OE] Orchestration completed for "${profile.id}".`));

  return result;
}

// Local test run
if (import.meta.url === `file://${process.argv[1]}`) {
  const input = "Example reasoning test";
  runOrchestration(input, "ai").then((res) => {
    console.log(JSON.stringify(res, null, 2));
  });
}
