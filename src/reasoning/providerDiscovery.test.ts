import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  detectAvailableProviders,
  getDefaultProvider
} from "./providerDiscovery.js";
import { mockReasoningProvider } from "./mockReasoningProvider.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

describe("providerDiscovery", () => {
  const baseEnv = { ...process.env };

  beforeEach(() => {
    // ensure full isolation before each test
    process.env = { ...baseEnv };
  });

  afterEach(() => {
    // restore environment after each test
    process.env = { ...baseEnv };
  });

  it("returns only mock provider when no env vars are set", () => {
    delete process.env.OPENAI_API_KEY;

    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;
    delete process.env.AWS_REGION;

    const providers = detectAvailableProviders();
    expect(providers.length).toBe(1);
    expect(providers[0].id).toBe(mockReasoningProvider.id);
  });

  it("detects OpenAI provider when OPENAI_API_KEY is set", () => {
    process.env.OPENAI_API_KEY = "test-key";

    const providers = detectAvailableProviders();
    const ids = providers.map(p => p.id);

    expect(ids).toContain(openaiReasoningProvider.id);
  });

  it("detects Bedrock provider when AWS creds are set", () => {
    process.env.AWS_ACCESS_KEY_ID = "AKIA123";
    process.env.AWS_SECRET_ACCESS_KEY = "SECRET123";
    process.env.AWS_REGION = "us-east-1";

    const providers = detectAvailableProviders();
    const ids = providers.map(p => p.id);

    expect(ids).toContain(bedrockReasoningProvider.id);
  });

  it("getDefaultProvider prefers OpenAI > Bedrock > Mock", () => {
    process.env.OPENAI_API_KEY = "openai";
    process.env.AWS_ACCESS_KEY_ID = "aws";
    process.env.AWS_SECRET_ACCESS_KEY = "aws";
    process.env.AWS_REGION = "us-east-1";

    const defaultProvider = getDefaultProvider();
    expect(defaultProvider.id).toBe(openaiReasoningProvider.id);
  });
});
