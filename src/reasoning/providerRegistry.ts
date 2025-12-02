// FILE: src/reasoning/providerRegistry.ts

import type { ReasoningProvider } from "./types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

/**
 * Providers require env vars at creation time.
 * These factory functions inject them directly.
 */
export const providerRegistry: Record<string, () => ReasoningProvider> = {
  openai: () => {
    const apiKey = process.env.OE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("[OE] Missing OE_OPENAI_API_KEY for OpenAI provider");
    }

    return openaiReasoningProvider(apiKey);
  },

  bedrock: () => {
    const region = process.env.OE_AWS_REGION;
    const modelId = process.env.OE_BEDROCK_MODEL;

    if (!region || !modelId) {
      throw new Error("[OE] Missing OE_AWS_REGION or OE_BEDROCK_MODEL for Bedrock provider");
    }

    return bedrockReasoningProvider();
  }
};
