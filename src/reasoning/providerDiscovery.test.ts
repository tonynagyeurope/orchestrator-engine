import { describe, it, expect, beforeEach } from "vitest";
import { getDefaultProvider } from "./providerDiscovery.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";

beforeEach(() => {
  delete process.env.OPENAI_API_KEY;
  delete process.env.BEDROCK_MODEL_ID;
});

describe("providerDiscovery", () => {

  it("should prefer OpenAI when both providers are available", () => {
    process.env.OPENAI_API_KEY = "test-key";
    process.env.BEDROCK_MODEL_ID = "amazon.titan-text-lite-v1";

    const provider = getDefaultProvider();
    expect(provider).toBe(openaiReasoningProvider);
  });

  it("should use Bedrock when OpenAI is not available", () => {
    process.env.BEDROCK_MODEL_ID = "amazon.titan-text-lite-v1";

    const provider = getDefaultProvider();
    expect(provider).toBe(bedrockReasoningProvider);
  });

  it("should throw an error when no providers are available", () => {
    expect(() => getDefaultProvider()).toThrow("No reasoning provider available.");
  });

});
