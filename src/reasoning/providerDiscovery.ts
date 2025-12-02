// FILE: src/reasoning/providerDiscovery.ts

export type ProviderId = "openai" | "bedrock";

/**
 * Check OpenAI availability (Stage-3 env names)
 */
function hasOpenAI(): boolean {
  return (
    typeof process.env.OE_OPENAI_API_KEY === "string" &&
    process.env.OE_OPENAI_API_KEY.trim().length > 0
  );
}

/**
 * Check Bedrock availability (Stage-3 env names)
 */
function hasBedrock(): boolean {
  return (
    process.env.USE_BEDROCK?.toLowerCase() === "true" &&
    typeof process.env.OE_AWS_REGION === "string" &&
    typeof process.env.OE_BEDROCK_MODEL === "string" &&
    process.env.OE_AWS_REGION.trim().length > 0 &&
    process.env.OE_BEDROCK_MODEL.trim().length > 0
  );
}

/**
 * Return provider ID only.
 * (ProviderFactory will instantiate actual provider.)
 */
export function discoverProvider(): ProviderId {
  const forced = process.env.OE_REASONING_MODE;

  // Forced override first
  if (forced === "openai") return "openai";
  if (forced === "bedrock") return "bedrock";

  const openaiAvailable = hasOpenAI();
  const bedrockAvailable = hasBedrock();

  // Priority: OpenAI → Bedrock
  if (openaiAvailable) return "openai";
  if (bedrockAvailable) return "bedrock";

  // Final safe fallback (CI-safe)
  return "openai";
}
