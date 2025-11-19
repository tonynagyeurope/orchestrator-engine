// src/reasoning/reasoningProvider.ts
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

/**
 * Reasoning provider interface definition.
 * Each provider must implement at least an `id` and an async `analyze()` method.
 */
export interface ReasoningProvider {
  id: string;
  analyze: (text: string, profile: unknown) => Promise<unknown>;
}

/**
 * Returns the best available reasoning provider.
 * 
 * Logic:
 * 1. If USE_BEDROCK env variable is true → use Bedrock.
 * 2. If OPENAI_API_KEY exists → use OpenAI.
 * 3. Otherwise → fallback to null (no provider).
 */
export async function getReasoningProvider(): Promise<ReasoningProvider | null> {
  try {
    // Prefer explicit environment override
    if (process.env.USE_BEDROCK === "true") {
      console.log("[Reasoning] Using Amazon Bedrock provider.");
      return bedrockReasoningProvider as ReasoningProvider;
    }

    // Default: OpenAI provider if API key is configured
    if (process.env.OPENAI_API_KEY) {
      console.log("[Reasoning] Using OpenAI provider.");
      return openaiReasoningProvider as ReasoningProvider;
    }

    // No valid provider detected
    console.warn("[Reasoning] No provider available. Please configure OpenAI or Bedrock.");
    return null;
  } catch (err) {
    console.error("[Reasoning] Failed to resolve provider:", (err as Error).message);
    return null;
  }
}
