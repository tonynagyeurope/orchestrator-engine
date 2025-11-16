// src/reasoning/reasoningProvider.ts

import { OrchestratorProfile } from "../config/baseConfig.js";

export interface ReasoningResult {
  summary: string;
  steps: string[];
  meta?: Record<string, unknown>;
}

export interface ReasoningProvider {
  analyze: (input: string, profile: OrchestratorProfile) => Promise<ReasoningResult>;
}

/**
 * Factory to select reasoning backend dynamically.
 * For now, defaults to a mock provider.
 */
export async function getReasoningProvider(): Promise<ReasoningProvider> {
  const mode = process.env.OE_REASONING_MODE || "mock";
  if (mode === "mock") {
    const { mockReasoningProvider } = await import("./mockReasoningProvider.js");
    return mockReasoningProvider;
  }
  throw new Error(`Unsupported reasoning provider: ${mode}`);
}
