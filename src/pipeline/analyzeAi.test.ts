// src/pipeline/analyzeAi.test.ts
import { describe, it, expect, vi } from "vitest";
import { analyzeAi } from "./analyzeAi.js";
import type { OrchestratorProfile } from "../config/baseConfig.js";

// --- Mock provider globally for this test ---
vi.mock("../reasoning/reasoningProvider.js", () => ({
  getReasoningProvider: () => ({
    id: "fake",
    analyze: async (text: string, profile: OrchestratorProfile) => ({
      summary: "simulated reasoning result",
      steps: ["step 1", "step 2"],
      meta: { text, profileId: profile.id }
    })
  })
}));

describe("analyzeAi", () => {
  it("should return simulated reasoning result", async () => {
    const profile = {
      id: "test",
      displayName: "Test Profile",
      domainFocus: "general",
      systemPrompt: "You are a test model.",
      uiLabels: { summary: "Summary", steps: "Steps" }
    } as OrchestratorProfile;

    const result = await analyzeAi({ text: "demo input" }, profile);
    expect(result.summary).toContain("simulated reasoning result");
  });
});
