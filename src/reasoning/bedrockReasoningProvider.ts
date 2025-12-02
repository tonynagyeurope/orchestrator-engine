// FILE: src/reasoning/bedrockReasoningProvider.ts

import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

import type {
  ReasoningProvider,
  ReasoningResult,
  TraceStep
} from "./types.js";

export function bedrockReasoningProvider(): ReasoningProvider {
  const client = new BedrockRuntimeClient({
    region: process.env.OE_AWS_REGION ?? "us-east-1",
    credentials: {
      accessKeyId: process.env.OE_AWS_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.OE_AWS_SECRET_ACCESS_KEY ?? ""
    }
  });

  const modelId = process.env.OE_BEDROCK_MODEL ?? "amazon.titan-text-lite-v1";

  return {
    id: "bedrock",

    async run(prompt: string, profile): Promise<ReasoningResult> {
      const trace: TraceStep[] = [];

      // --- 1) ANALYZE STEP --------------------------------------
      const analyzePrompt = buildAnalyzePrompt(prompt);
      const analyzeText = await callBedrock(client, modelId, analyzePrompt);
      trace.push(makeStep(0, "analyze", analyzeText));

      // --- 2) SUMMARIZE STEP ------------------------------------
      const summarizePrompt = buildSummarizePrompt(prompt);
      const summarizeText = await callBedrock(client, modelId, summarizePrompt);
      trace.push(makeStep(1, "summarize", summarizeText));

      // --- 3) FINALIZE STEP --------------------------------------
      const finalizePrompt = buildFinalizePrompt(prompt);
      const finalText = await callBedrock(client, modelId, finalizePrompt);
      trace.push(makeStep(2, "finalize", finalText));

      return {
        final: finalText,
        trace,
        meta: {
          provider: "bedrock",
          model: modelId
        }
      };
    }
  };
}

/** ----------------------- HELPERS ----------------------------- */

async function callBedrock(
  client: BedrockRuntimeClient,
  modelId: string,
  prompt: string
): Promise<string> {
  const payload = {
    inputText: prompt,
    textGenerationConfig: {
      temperature: 0.2,
      maxTokenCount: 400,
      topP: 0.9
    }
  };

  const command = new InvokeModelCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(payload)
  });

  const res = await client.send(command);

  const jsonString = new TextDecoder().decode(res.body);
  const json = JSON.parse(jsonString);

  return (
    json?.results?.[0]?.outputText ??
    "[bedrock] Empty response"
  );
}

function buildAnalyzePrompt(input: string): string {
  return `
Explain briefly (1-2 sentences) what the user wants to achieve.
User input:
"${input}"
  `.trim();
}

function buildSummarizePrompt(input: string): string {
  return `
Summarize the required CLI command or action in a concise technical form.
User input:
"${input}"
  `.trim();
}

function buildFinalizePrompt(input: string): string {
  return `
Convert the user's request into the exact AWS CLI command.

Rules:
- Produce ONLY the command.
- Do not add explanations.
- Use correct AWS CLI syntax.

User input:
"${input}"
  `.trim();
}

function makeStep(
  index: number,
  event: string,
  message: string
): TraceStep {
  return {
    index,
    event,
    message,
    timestamp: new Date().toISOString(),
    source: "provider"
  };
}
