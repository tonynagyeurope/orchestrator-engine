import { describe, it, expect } from "vitest";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import type { OrchestratorProfile } from "../config/baseConfig.js";

const demoProfile: OrchestratorProfile = {
  id: "bedrock-demo",
  displayName: "Amazon Bedrock Demo",
  domainFocus: "general",
  systemPrompt: "You are a concise assistant.",
  uiLabels: { summary: "Summary", steps: "Reasoning steps" }
};

describe("Bedrock Reasoning Provider (E2E)", () => {
  it("should return a valid reasoning result from Amazon Bedrock", async () => {
    const input = "Summarize what Amazon Bedrock is in one sentence.";
    const result = await bedrockReasoningProvider.analyze(input, demoProfile);

    expect(result).toBeDefined();
    expect(result.summary).toMatch(/Bedrock/i);
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.meta?.model).toBe("amazon.titan-text-lite-v1");
  }, 20000);
});
