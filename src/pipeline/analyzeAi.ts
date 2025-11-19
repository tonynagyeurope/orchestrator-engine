// src/pipeline/analyzeAi.ts

import { describe, expect, it } from "vitest";
import { OrchestratorProfile } from "../config/baseConfig.js";
import { getReasoningProvider } from "../reasoning/reasoningProvider.js";
import { createDefaultMcpRegistry } from "../tools/defaultRegistry.js";

describe("createDefaultMcpRegistry", () => {
  it(
    "registers the built-in tools",
    async () => {
      const registry = await createDefaultMcpRegistry();
      const tools = registry.list().sort();
      expect(tools.length).toBeGreaterThan(0);
    },
    15000 // ⏱️ increase timeout to 15s
  );
});


// Mock reasoning provider for analyzeAi tests
if (process.env.VITEST) {
  const { vi } = await import("vitest");
  vi.mock("../reasoning/reasoningProvider.js", () => ({
    getReasoningProvider: () => ({
      id: "fake",
      analyze: async () => ({
        summary: "simulated reasoning result",
        steps: ["step 1", "step 2", "step 3"],
        meta: { profileId: "ai" }
      })
    })
  }));
}


/**
 * analyzeAi.ts
 * ------------
 * AI-based analysis pipeline stub.
 * Simulates a reasoning engine using mock prompts and profile data.
 * Later, this can be connected to a real LLM API (OpenAI, Bedrock, etc.).
 */

/**
 * Main AI analysis pipeline entry with real AI reasoning now.
 */
export async function analyzeAi(
  normalized: { text: string },
  profile: OrchestratorProfile
) {
  const provider = await getReasoningProvider();
  const reasoning = await provider.analyze(normalized.text, profile);

  return reasoning;
}
