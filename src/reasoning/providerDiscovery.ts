// FILE: src/reasoning/providerDiscovery.ts
import type { ReasoningProvider } from "../reasoning/types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

/**
 * Detects whether we can use Bedrock.
 */
function hasBedrockEnv(): boolean {
  return Boolean(process.env.BEDROCK_MODEL_ID);
}

/**
 * Detects if OpenAI is available.
 */
function hasOpenAIEnv(): boolean {
  return typeof process.env.OPENAI_API_KEY === "string" &&
         process.env.OPENAI_API_KEY.length > 0;
}

/**
 * Select default provider based on env availability.
 */
export function getDefaultProvider(): ReasoningProvider {
  const openai = hasOpenAIEnv();
  const bedrock = hasBedrockEnv();

  if (openai && bedrock) return openaiReasoningProvider;
  if (openai) return openaiReasoningProvider;
  if (bedrock) return bedrockReasoningProvider;

  throw new Error("No reasoning provider available.");
}
