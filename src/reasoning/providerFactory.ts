// FILE: src/reasoning/providerFactory.ts
// FILE: src/reasoning/providerFactory.ts
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";
import { ReasoningProvider } from "./reasoningProvider.js";

const providers: Record<string, ReasoningProvider> = {
  openai: openaiReasoningProvider,
  bedrock: bedrockReasoningProvider
};

export function getProvider(name: string): ReasoningProvider {
  return providers[name] ?? openaiReasoningProvider;
}
