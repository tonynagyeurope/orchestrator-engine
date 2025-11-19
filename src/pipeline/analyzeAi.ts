// src/pipeline/analyzeAi.ts
import type { OrchestratorProfile } from "../config/baseConfig.js";
import { getReasoningProvider } from "../reasoning/reasoningProvider.js";
import { ReasoningResult } from "../reasoning/types.js";
import { formatTrace } from "../utils/traceFormatter.js";

/**
 * Main AI analysis pipeline entry with real AI reasoning.
 * This module should remain pure runtime code — no Vitest imports here.
 */

export async function analyzeAi(normalized: { text: string }, profile: OrchestratorProfile) {
  const provider = await getReasoningProvider();
  if (!provider) throw new Error("No reasoning provider available.");

  const reasoning = (await provider.analyze(normalized.text, profile)) as Partial<ReasoningResult>;

  const trace = Array.isArray(reasoning.steps)
    ? formatTrace(reasoning.steps, { provider: provider.id })
    : [];

  return { ...reasoning, trace };
}