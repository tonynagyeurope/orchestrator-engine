import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getDefaultProvider } from "./providerDiscovery.js";
import { mockReasoningProvider } from "./mockReasoningProvider.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";

describe("Reasoning Provider Fallback", () => {
  const baseEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...baseEnv };
  });

  afterEach(() => {
    process.env = { ...baseEnv };
  });

  it("returns OpenAI provider when OPENAI_API_KEY is defined", () => {
    process.env.OPENAI_API_KEY = "test-key";

    const provider = getDefaultProvider();
    expect(provider.id).toBe(openaiReasoningProvider.id);
  });

  it("falls back to mock provider when no real providers are available", () => {
    // Remove OpenAI
    delete process.env.OPENAI_API_KEY;

    // Remove Bedrock
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;

    const provider = getDefaultProvider();
    expect(provider.id).toBe(mockReasoningProvider.id);
  });
});
