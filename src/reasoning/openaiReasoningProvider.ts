// FILE: src/reasoning/openaiReasoningProvider.ts

import type {
  ReasoningProvider,
  ReasoningResult,
  TraceStep
} from "./types.js";

export function openaiReasoningProvider(apiKey: string): ReasoningProvider {
  return {
    id: "openai",

    async run(prompt: string, profile) {
      const trace: TraceStep[] = [];

      // --- 1) ANALYZE STEP ------------------------------
      const analyzePrompt = `
You are an AI pipeline analyzer.
Explain briefly (1-2 sentences) what the user wants to achieve.
User input:
"${prompt}"
      `.trim();

      const analyzeText = await callOpenAI(apiKey, analyzePrompt);
      trace.push(makeStep(0, "analyze", analyzeText));

      // --- 2) SUMMARIZE STEP ----------------------------
      const summarizePrompt = `
Summarize what CLI command or action is needed in a concise technical form.
User input:
"${prompt}"
      `.trim();

      const summarizeText = await callOpenAI(apiKey, summarizePrompt);
      trace.push(makeStep(1, "summarize", summarizeText));

      // --- 3) FINALIZE STEP ------------------------------
      const finalizePrompt = `
Convert the user's request into the exact AWS CLI command.

Rules:
- Produce ONLY the CLI command, no explanation.
- Keep it valid AWS CLI syntax.

User input:
"${prompt}"
      `.trim();

      const finalText = await callOpenAI(apiKey, finalizePrompt);
      trace.push(makeStep(2, "finalize", finalText));

      const result: ReasoningResult = {
        final: finalText,
        trace,
        meta: {
          model: "gpt-4o-mini",
          provider: "openai"
        }
      };

      return result;
    }
  };
}

/** Helper to perform an OpenAI call */
async function callOpenAI(apiKey: string, prompt: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!res.ok) {
    throw new Error(
      `OpenAI provider error: ${res.status} ${res.statusText}`
    );
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/** Helper to generate a TraceStep */
function makeStep(index: number, event: string, message: string): TraceStep {
  return {
    index,
    event,
    message,
    timestamp: new Date().toISOString(),
    source: "provider"
  };
}
