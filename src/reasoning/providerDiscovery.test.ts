import { describe, it, expect } from "vitest";
import { getDefaultProvider } from "./providerDiscovery.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

describe("providerDiscovery", () => {
  it("should prefer OpenAI when both providers are available", () => {
    process.env.OPENAI_API_KEY = "test";
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test";

    const provider = getDefaultProvider();
    expect(provider).toBe(openaiReasoningProvider);
  });

  it("should use Bedrock when OpenAI is not available", () => {
    delete process.env.OPENAI_API_KEY;
    process.env.AWS_ACCESS_KEY_ID = "test";
    process.env.AWS_SECRET_ACCESS_KEY = "test";
    process.env.AWS_REGION = "us-east-1"; // REQUIRED for hasBedrockEnv()

    const provider = getDefaultProvider();
    expect(provider).toBe(bedrockReasoningProvider);
  });

  it("should throw an error when no providers are available", () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.AWS_ACCESS_KEY_ID;
    delete process.env.AWS_SECRET_ACCESS_KEY;

    expect(() => getDefaultProvider()).toThrow("No reasoning provider available.");
  });
});
