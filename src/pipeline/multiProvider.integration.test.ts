import { describe, it, beforeAll, expect, vi } from "vitest";
import { getDefaultProvider } from "../reasoning/providerDiscovery.js";
import { bedrockReasoningProvider } from "../reasoning/bedrockReasoningProvider.js";
import { openaiReasoningProvider } from "../reasoning/openaiReasoningProvider.js";
import type { OrchestratorProfile } from "../config/baseConfig.js";

const bedrockProfile: OrchestratorProfile = {
  id: "bedrock",
  displayName: "Amazon Bedrock",
  domainFocus: "general",
  systemPrompt: "You are a helpful summarizer.",
  uiLabels: { summary: "Summary", steps: "Reasoning Steps" },
};

const openaiProfile: OrchestratorProfile = {
  id: "openai",
  displayName: "OpenAI",
  domainFocus: "general",
  systemPrompt: "You are a concise AI assistant.",
  uiLabels: { summary: "Summary", steps: "Reasoning Steps" },
};

describe("Multi-provider orchestration (integration)", () => {
  beforeAll(() => {
    // Fake both environments so provider detection works
    process.env.OPENAI_API_KEY = "fake-key";
    process.env.AWS_ACCESS_KEY_ID = "fake-access";
    process.env.AWS_SECRET_ACCESS_KEY = "fake-secret";
    process.env.AWS_REGION = "us-east-1";
    process.env.BEDROCK_MODEL_ID = "anthropic.claude-v2";

    // Mock the external API calls
    vi.spyOn(openaiReasoningProvider, "analyze").mockResolvedValue({
      summary: "OpenAI mock summary response.",
      steps: ["step 1", "step 2"],
    });

    vi.spyOn(bedrockReasoningProvider, "analyze").mockResolvedValue({
      summary: "Bedrock mock summary response.",
      steps: ["phase A", "phase B"],
    });
  });

  it("should handle both OpenAI and Bedrock providers", async () => {
    const defaultProvider = getDefaultProvider();
    expect(defaultProvider).toBeDefined();

    const input = "Compare OpenAI and Amazon Bedrock in one short paragraph.";

    const [openaiRes, bedrockRes] = await Promise.all([
      openaiReasoningProvider.analyze(input, openaiProfile),
      bedrockReasoningProvider.analyze(input, bedrockProfile),
    ]);

    // Validate mocked outputs
    expect(openaiRes.summary).toContain("OpenAI");
    expect(bedrockRes.summary).toContain("Bedrock");
    expect(openaiRes.steps.length).toBe(2);
    expect(bedrockRes.steps.length).toBe(2);
  }, 30000);
});
