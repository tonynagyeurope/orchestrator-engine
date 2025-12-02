// FILE: src/reasoning/providerFactory.ts

import type { ReasoningProvider } from "./types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
// import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import { testReasoningProvider } from "./testReasoningProvider.js";
import { bedrockFastProvider } from "./bedrockFastProvider.js";

export function getProvider(providerName: string): ReasoningProvider {
  switch (providerName) {
    case "openai": {
      const key = process.env.OE_OPENAI_API_KEY;
      if (!key) throw new Error("[OE] Missing OE_OPENAI_API_KEY");
      return openaiReasoningProvider(key);
    }

/* -- Removed due to throttling

    case "bedrock": {
      // In Lambda we rely on the execution role, NOT env credentials.
      // The provider must only ensure region + model are set.
      if (!process.env.OE_AWS_REGION || !process.env.OE_BEDROCK_MODEL) {
        throw new Error("[OE] Missing required Bedrock config (region/model)");
      }
      return bedrockReasoningProvider();
    }
*/

    case "bedrock": {
      if (!process.env.OE_AWS_REGION || !process.env.OE_BEDROCK_MODEL) {
        throw new Error("[OE] Missing required Bedrock config");
      }
      return bedrockFastProvider();
    }
    
    case "test":
      return testReasoningProvider();

    default:
      throw new Error(`[OE] Unknown provider: ${providerName}`);
  }
}

export function getAvailableProviders(): string[] {
  return ["openai", "bedrock", "test"];
}
