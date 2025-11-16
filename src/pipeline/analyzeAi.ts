// src/pipeline/analyzeAi.ts

import { OrchestratorProfile } from "../config/baseConfig.js";
import { getReasoningProvider } from "../reasoning/reasoningProvider.js";

/**
 * analyzeAi.ts
 * ------------
 * AI-based analysis pipeline stub.
 * Simulates a reasoning engine using mock prompts and profile data.
 * Later, this can be connected to a real LLM API (OpenAI, Anthropic, Bedrock, etc.).
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
