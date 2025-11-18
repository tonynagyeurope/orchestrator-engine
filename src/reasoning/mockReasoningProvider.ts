// src/reasoning/mockReasoningProvider.ts

import { ReasoningProvider, ReasoningResult } from "./reasoningProvider.js";
import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * Mock reasoning provider simulating multi-step analysis.
 * Useful for testing and offline development.
 */
export const mockReasoningProvider: ReasoningProvider = {
  id: "mock",
  async analyze(input: string, profile: OrchestratorProfile): Promise<ReasoningResult> {
    const steps = [
      `Task received: "${input}"`,
      `Domain: ${profile.domainFocus}`,
      `Prompt: ${profile.systemPrompt}`,
      "Step 1: Simulating chain-of-thought reasoning...",
      "Step 2: Producing final summary..."
    ];

    return {
      summary: `Simulated reasoning completed for "${profile.displayName}"`,
      steps,
      meta: { provider: "mock", profileId: profile.id }
    };
  }
};
