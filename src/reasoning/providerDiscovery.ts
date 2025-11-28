// providerDiscovery.ts

import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import type { ReasoningProvider } from "./types.js";

/**
 * Detects whether Bedrock access is available via environment configuration.
 */
function hasBedrockEnv(): boolean {
  return Boolean(process.env.BEDROCK_MODEL_ID);
}

/**
 * Detects whether OpenAI access is available.
 */
function hasOpenAIEnv(): boolean {
  return typeof process.env.OPENAI_API_KEY === "string" &&
         process.env.OPENAI_API_KEY.length > 0;
}

/**
 * Provider selection logic compatible with all fallback tests
 */
export function getDefaultProvider() {
  const openai = hasOpenAIEnv();
  const bedrock = hasBedrockEnv();

  if (openai && bedrock) return openaiReasoningProvider;
  if (!openai && bedrock) return bedrockReasoningProvider;
  if (openai && !bedrock) return openaiReasoningProvider;

  throw new Error("No reasoning provider available.");
}
