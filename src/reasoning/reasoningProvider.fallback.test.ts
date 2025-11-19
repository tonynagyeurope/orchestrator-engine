import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDefaultProvider } from "./providerDiscovery.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

describe("Reasoning Provider Fallback (real providers)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.OPENAI_API_KEY;
    delete process.env.AWS_REGION;
    delete process.env.BEDROCK_MODEL_ID;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns OpenAI provider when OPENAI_API_KEY is set", () => {
    process.env.OPENAI_API_KEY = "test-key";

    const provider = getDefaultProvider();
    expect(provider.id).toBe(openaiReasoningProvider.id);
  });

  it("returns Bedrock provider when Bedrock env variables are set", () => {
    process.env.AWS_REGION = "us-east-1";
    process.env.BEDROCK_MODEL_ID = "anthropic.claude-v2";

    const provider = getDefaultProvider();
    expect(provider.id).toBe(bedrockReasoningProvider.id);
  });

  it("prefers OpenAI over Bedrock when both are available", () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.AWS_REGION = "us-east-1";
    process.env.BEDROCK_MODEL_ID = "anthropic.claude-v2";

    const provider = getDefaultProvider();
    expect(provider.id).toBe(openaiReasoningProvider.id);
  });

  it("throws an error when no reasoning provider is available", () => {
    expect(() => getDefaultProvider()).toThrow();
  });
});
