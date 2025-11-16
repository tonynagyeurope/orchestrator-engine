import { ReasoningProvider, ReasoningResult } from "./reasoningProvider.js";
import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * OpenAI-based reasoning provider.
 * Executes real LLM calls when OPENAI_API_KEY is set,
 * otherwise falls back to a local simulated reasoning.
 */
export const openaiReasoningProvider: ReasoningProvider = {
  async analyze(input: string, profile: OrchestratorProfile): Promise<ReasoningResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      // fallback for CI / offline mode
      return {
        summary: `[mock] Missing OPENAI_API_KEY → simulated reasoning for "${profile.displayName}"`,
        steps: [
          "Step 1: mock reasoning fallback",
          "Step 2: summary generated locally"
        ],
        meta: { provider: "mock-fallback", profileId: profile.id }
      };
    }

    const prompt = [
      `You are a reasoning engine specialized in orchestration analysis.`,
      `Profile: ${profile.displayName}`,
      `Domain: ${profile.domainFocus}`,
      `System prompt: ${profile.systemPrompt}`,
      `Task: ${input}`,
      `Return a short reasoning trace (3-5 steps) and final summary.`
    ].join("\n");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OE_OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API request failed: ${res.status} ${errText}`);
    }

    const data = await res.json();
    const output = data.choices?.[0]?.message?.content ?? "No reasoning output returned.";

    return {
      summary: output,
      steps: ["Executed via OpenAI reasoning provider"],
      meta: {
        provider: "openai",
        model: process.env.OE_OPENAI_MODEL ?? "gpt-4o-mini",
        profileId: profile.id
      }
    };
  }
};
