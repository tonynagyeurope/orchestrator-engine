// FILE: src/reasoning/providerFactory.ts

import type { ReasoningProvider } from "./types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

export function getProvider(providerName: string): ReasoningProvider {
  switch (providerName) {
    case "openai": {
      const key = process.env.OE_OPENAI_API_KEY;
      if (!key) throw new Error("[OE] Missing OE_OPENAI_API_KEY");
      return openaiReasoningProvider(key);
    }

    case "bedrock": {
      if (!process.env.OE_AWS_ACCESS_KEY_ID ||
          !process.env.OE_AWS_SECRET_ACCESS_KEY) {
        throw new Error("[OE] Missing AWS credentials for Bedrock provider");
      }
      return bedrockReasoningProvider();
    }

    default:
      throw new Error(`[OE] Unknown provider: ${providerName}`);
  }
}

export function getAvailableProviders(): string[] {
  return ["openai", "bedrock"];
}
