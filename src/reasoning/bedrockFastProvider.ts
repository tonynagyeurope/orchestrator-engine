// FILE: src/reasoning/bedrockFastProvider.ts

import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

import type {
  ReasoningProvider,
  ReasoningResult,
  TraceStep
} from "./types.js";

export function bedrockFastProvider(): ReasoningProvider {
  const client = new BedrockRuntimeClient({
    region: process.env.OE_AWS_REGION ?? "us-east-1"
    // Execution role -> no explicit credentials needed
  });

  const modelId = process.env.OE_BEDROCK_MODEL ?? "amazon.titan-text-express-v1";

  return {
    id: "bedrock",

    async run(prompt: string): Promise<ReasoningResult> {
      const start = Date.now();

      const trace: TraceStep[] = [];

      // Single-step prompt
      const payload = {
        inputText: prompt,
        textGenerationConfig: {
          temperature: 0.2,
          maxTokenCount: 400,
          topP: 0.95
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
      const output = json?.results?.[0]?.outputText ?? "[bedrock] Empty response";

      trace.push({
        index: 0,
        event: "inference",
        message: output,
        timestamp: new Date().toISOString(),
        source: "provider",
        meta: { latencyMs: Date.now() - start }
      });

      return {
        final: output,
        trace,
        meta: {
          provider: "bedrock-fast",
          model: modelId
        }
      };
    }
  };
}
