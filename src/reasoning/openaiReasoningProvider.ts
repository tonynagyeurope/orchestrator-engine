// FILE: src/reasoning/openaiReasoningProvider.ts
import { ReasoningResult, TraceStep } from "./types.js";
import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * OpenAI-compatible reasoning provider.
 * Produces a ReasoningResult with full trace chain.
 */
export const openaiReasoningProvider = {
  id: "openai",

  /**
   * Execute reasoning via OpenAI Chat Completion API.
   */
  async run(prompt: string, profile: OrchestratorProfile): Promise<ReasoningResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    // --- 1) Safety: missing API key → return simulated output ----------------
    if (!apiKey) {
      const fallbackTrace: TraceStep[] = [
        {
          index: 0,
          message: "OpenAI API key missing → using mock reasoning provider",
          timestamp: new Date().toISOString(),
          meta: { provider: "openai", simulated: true }
        }
      ];

      return {
        final: `[mock-openai] No API key configured. Profile="${profile.title}".`,
        trace: fallbackTrace,
        meta: {
          provider: "openai",
          profileId: profile.id,
          model: profile.model ?? "gpt-4o-mini",
          mock: true
        }
      };
    }

    // --- 2) Prepare messages --------------------------------------------------
    const systemPrompt = profile.prompt.join("\n");

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt }
    ];

    const model = profile.model ?? "gpt-4o-mini";
    const temperature = profile.temperature ?? 0.3;

    // --- 3) Call OpenAI API ---------------------------------------------------
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature,
        messages,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();

      return {
        final: `OpenAI API error: ${errorText}`,
        trace: [
          {
            index: 0,
            message: "OpenAI API returned non-200 status",
            timestamp: new Date().toISOString(),
            meta: { status: response.status }
          }
        ],
        meta: {
          provider: "openai",
          error: true,
          profileId: profile.id
        }
      };
    }

    const data = await response.json();

    // --- 4) Extract model output (final answer) -------------------------------
    const finalAnswer: string =
      data.choices?.[0]?.message?.content ??
      "[openai] No content returned by the API.";

    // --- 5) Build trace -------------------------------------------------------
    // For single-step reasoning: one trace entry.
    // In multi-step reasoning loop we will append more entries.
    const trace: TraceStep[] = [
      {
        index: 0,
        message: "OpenAI reasoning step completed.",
        timestamp: new Date().toISOString(),
        meta: {
          provider: "openai",
          model,
          profileId: profile.id,
          totalTokens: data.usage?.total_tokens
        }
      }
    ];

    // --- 6) Build standardized ReasoningResult -------------------------------
    return {
      final: finalAnswer,
      trace,
      meta: {
        provider: "openai",
        model,
        profileId: profile.id,
        totalTokens: data.usage?.total_tokens
      }
    };
  }
};
