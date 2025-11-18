import { describe, it, expect, beforeEach, vi, afterAll } from "vitest";
import { getDefaultProvider } from "./providerDiscovery.js";
import { mockReasoningProvider } from "./mockReasoningProvider.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";

describe("Reasoning Provider Fallback", () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  it("returns OpenAI provider when OPENAI_API_KEY is defined", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    const provider = getDefaultProvider();
    expect(provider).toBe(openaiReasoningProvider);
  });

  it("falls back to mock provider when OPENAI_API_KEY is missing", async () => {
    delete process.env.OPENAI_API_KEY;
    const provider = getDefaultProvider();
    expect(provider).toBe(mockReasoningProvider);
  });

  // restore environment
  afterAll(() => {
    if (originalEnv) process.env.OPENAI_API_KEY = originalEnv;
  });
});
