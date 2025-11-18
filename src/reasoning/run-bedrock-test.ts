// Simple local Bedrock invocation test
// Run with:  npm run bedrock:test
// Requires: AWS credentials + AWS_REGION

import { bedrockReasoningProvider } from "../reasoning/bedrockReasoningProvider.js";

async function main() {
  console.log("[Bedrock Test] Starting test run...\n");

  try {
    const result = await bedrockReasoningProvider.analyze(
      "Explain how Bedrock integrates multiple foundation models under one API.",
      "ai" // profileId (or any arbitrary string)
    );

    console.log("\n Bedrock response:");
    console.dir(result, { depth: null });
  } catch (err) {
    console.error("\n Bedrock invocation failed:");
    console.error(err);
  }
}

main();
