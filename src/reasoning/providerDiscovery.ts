import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import { mockReasoningProvider } from "./mockReasoningProvider.js";
import type { ReasoningProvider } from "./types.js";

/**
 * providerDiscovery.ts
 * --------------------
 * Automatically detects which reasoning providers are available
 * based on environment variables or AWS credentials.
 */

export function detectAvailableProviders(): ReasoningProvider[] {
  const providers: ReasoningProvider[] = [];

  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    providers.push(openaiReasoningProvider);
  }

  // AWS Bedrock
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    providers.push(bedrockReasoningProvider);
  }

  // Always include mock as fallback
  providers.push(mockReasoningProvider);

  return providers;
}

/**
 * Helper to get the preferred provider.
 * Priority: OpenAI → Bedrock → Mock
 */
export function getDefaultProvider(): ReasoningProvider {
  const available = detectAvailableProviders();
  return (
    available.find(p => p.id.includes("openai")) ||
    available.find(p => p.id.includes("bedrock")) ||
    mockReasoningProvider
  );
}
