import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import type { ReasoningProvider } from "./types.js";

export const bedrockReasoningProvider: ReasoningProvider = {
  id: "bedrock-titan",
  async analyze(input: string) {
    const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

    const modelId = "amazon.titan-text-lite-v1";

    const payload = {
      inputText: input,
      textGenerationConfig: {
        maxTokenCount: 256,
        temperature: 0.7,
        topP: 0.9
      }
    };

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(payload)
    });

    const response = await client.send(command);
    const json = JSON.parse(new TextDecoder().decode(response.body));

    return {
      summary: json.results?.[0]?.outputText ?? "No output",
      steps: ["Model invoked", "Output parsed"],
      meta: {
        model: modelId,
        tokenCount: json.results?.[0]?.tokenCount ?? 0
      }
    };
  }
};
