import { describe, it, expect } from "vitest";
import { getDefaultProvider } from "../reasoning/providerDiscovery.js";
import { bedrockReasoningProvider } from "../reasoning/bedrockReasoningProvider.js";
import { openaiReasoningProvider } from "../reasoning/openaiReasoningProvider.js";
import type { OrchestratorProfile } from "../config/baseConfig.js";

const bedrockProfile: OrchestratorProfile = {
  id: "bedrock",
  displayName: "Amazon Bedrock",
  domainFocus: "general",
  systemPrompt: "You are a helpful summarizer.",
  uiLabels: { summary: "Summary", steps: "Reasoning Steps" }
};

const openaiProfile: OrchestratorProfile = {
  id: "openai",
  displayName: "OpenAI",
  domainFocus: "general",
  systemPrompt: "You are a concise AI assistant.",
  uiLabels: { summary: "Summary", steps: "Reasoning Steps" }
};

describe("Multi-provider orchestration (integration)", () => {
  it("should handle both OpenAI and Bedrock providers", async () => {
    const defaultProvider = getDefaultProvider();
    expect(defaultProvider).toBeDefined();

    const input = "Compare OpenAI and Amazon Bedrock in one short paragraph.";

    const [openaiRes, bedrockRes] = await Promise.all([
      openaiReasoningProvider.analyze(input, openaiProfile),
      bedrockReasoningProvider.analyze(input, bedrockProfile)
    ]);

    expect(openaiRes.summary.length).toBeGreaterThan(10);
    expect(bedrockRes.summary.length).toBeGreaterThan(10);
  }, 30000);
});

