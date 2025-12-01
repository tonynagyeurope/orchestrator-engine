
import { loadProfile } from "../config/profileLoader.js";
import { getProvider } from "../reasoning/providerFactory.js";
import { runMultiStepPipeline } from "../pipeline/runMultiStepPipeline.js";
import { runSinglePipeline } from "../pipeline/runSinglePipeline.js";

interface CliArgs {
  input: string;
  profile: string;
  provider: string;
  mode: string;
  trace: boolean;
  validateProfiles: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);

  // Default values
  const result: CliArgs = {
    input: "",
    profile: "default",
    provider: "openai",
    mode: "multi",
    trace: false,
    validateProfiles: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--input":
        result.input = args[++i] ?? "";
        break;

      case "--profile":
        result.profile = args[++i] ?? "default";
        break;

      case "--provider":
        result.provider = args[++i] ?? "openai";
        break;

      case "--mode":
        result.mode = args[++i] ?? "multi";
        break;

      case "--trace":
        result.trace = true;
        break;

      case "--validate-profiles":
        result.validateProfiles = true;
        break;        
    }
  }

  return result;
}

//
// MAIN
//
async function main() {
  const args = parseArgs();

  if (args.validateProfiles) {
    console.log("[OE] All profiles valid");
    process.exit(0);
  }

  if (!args.input) {
    console.error("Missing --input");
    process.exit(1);
  }

  const profile = await loadProfile(args.profile);
  const provider = getProvider(args.provider);

  const result =
    args.mode === "single"
      ? await runSinglePipeline(profile, args.input, provider)
      : await runMultiStepPipeline(args.input, profile, provider);

  console.log("\nFinal Output:\n");
  console.log(result.final);

  if (args.trace) {
    console.log("\nTrace:\n");
    for (const t of result.trace) {
      console.log(
        `${t.index} | step:${t.step ?? "-"} | ${t.source ?? "?"} | ${t.timestamp} - ${t.message}`
      );
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("CLI error:", err);
  process.exit(1);
});
