// FILE: src/reasoning/bedrockReasoningProvider.ts
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { ReasoningResult, TraceStep } from "./types.js";
import { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * Amazon Bedrock reasoning provider.
 * Produces standardized ReasoningResult objects for the OE core.
 */
export const bedrockReasoningProvider = {
  id: "bedrock",

  async run(prompt: string, profile: OrchestratorProfile): Promise<ReasoningResult> {
    const modelId = profile.model ?? process.env.BEDROCK_MODEL_ID;
    const region = process.env.BEDROCK_REGION ?? "us-east-1";

    // --- 1) Missing configuration → fallback reasoning -------------------------
    if (!modelId) {
      const trace: TraceStep[] = [
        {
          index: 0,
          text: "Bedrock model missing → simulated reasoning provider used.",
          timestamp: new Date().toISOString(),
          meta: { provider: "bedrock", simulated: true }
        }
      ];

      return {
        final: `[mock-bedrock] No model configured. Profile="${profile.title}".`,
        trace,
        meta: { provider: "bedrock", profileId: profile.id, mock: true }
      };
    }

    // --- 2) Create Bedrock client ------------------------------------------------
    const client = new BedrockRuntimeClient({ region });

    // Bedrock Claude-like / Titan-like models expect this structure
    const bedrockPayload = {
      inputText: profile.prompt.join("\n") + "\n\nUser Input:\n" + prompt,
      textGenerationConfig: {
        temperature: profile.temperature ?? 0.3,
        maxTokenCount: 500
      }
    };

    let rawResponse: string = "";
    let finalText: string = "";

    // --- 3) Invoke the model -----------------------------------------------------
    try {
      const command = new InvokeModelCommand({
        modelId,
        body: JSON.stringify(bedrockPayload),
        contentType: "application/json",
        accept: "application/json"
      });

      const response = await client.send(command);

      rawResponse = Buffer.from(response.body).toString("utf8");

      const parsed = JSON.parse(rawResponse);

      // Titan / Claude / Llama-based models unify under outputText
      finalText =
        parsed.outputText ??
        parsed.completions?.[0]?.data?.text ??
        "[bedrock] No outputText returned by model.";

    } catch (err) {
      return {
        final: `[bedrock:error] ${String(err)}`,
        trace: [
          {
            index: 0,
            text: "Bedrock API error occurred.",
            timestamp: new Date().toISOString(),
            meta: { provider: "bedrock", error: true, message: String(err) }
          }
        ],
        meta: {
          provider: "bedrock",
          profileId: profile.id,
          error: true
        }
      };
    }

    // --- 4) Build trace ----------------------------------------------------------
    const trace: TraceStep[] = [
      {
        index: 0,
        text: "Bedrock reasoning completed successfully.",
        timestamp: new Date().toISOString(),
        meta: {
          provider: "bedrock",
          modelId,
          profileId: profile.id
        }
      }
    ];

    // --- 5) Return standardized ReasoningResult ---------------------------------
    return {
      final: finalText,
      trace,
      meta: {
        provider: "bedrock",
        modelId,
        profileId: profile.id
      }
    };
  }
};
