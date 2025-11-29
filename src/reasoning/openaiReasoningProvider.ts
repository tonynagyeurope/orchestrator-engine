import { ReasoningProvider, ReasoningResult } from "./types.js";
import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * OpenAI-based reasoning provider.
 * Executes real LLM calls when OPENAI_API_KEY is set,
 * otherwise falls back to a local simulated reasoning.
 */
export const openaiReasoningProvider: ReasoningProvider = {
  id: "openai",

  async analyze(input: string, profile: OrchestratorProfile): Promise<ReasoningResult> {
    const apiKey = process.env.OPENAI_API_KEY;

    // Resolve profile optional fields safely
    const rules = profile.rules ?? [];
    const examples = profile.examples ?? [];

    if (!apiKey) {
      return {
        summary: `[mock] Missing OPENAI_API_KEY → simulated reasoning for "${profile.displayName}"`,
        steps: [
          "Step 1: mock reasoning fallback",
          "Step 2: summary generated locally"
        ],
        meta: { provider: "mock-fallback", profileId: profile.id }
      };
    }

    const prompt = `
You are a reasoning agent.
Profile: ${profile.displayName}

Description:
${profile.description ?? ""}

Rules:
${rules.length > 0 ? rules.map(r => `- ${r}`).join("\n") : "(no rules provided)"}

Examples:
${examples.length > 0
      ? examples.map(ex => `User: ${ex.input}\nAssistant: ${JSON.stringify(ex.output)}`).join("\n\n")
      : "(no examples provided)"}

User input:
${input}

Generate output based on the rules above.
`.trim();

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: process.env.OE_OPENAI_MODEL ?? "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: profile.temperature ?? 0.3,
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

