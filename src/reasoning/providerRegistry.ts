// FILE: src/reasoning/providerRegistry.ts
import type { ReasoningProvider } from "../reasoning/types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

const registry: Record<string, ReasoningProvider> = {
  openai: openaiReasoningProvider,
  bedrock: bedrockReasoningProvider
};

export function getProvider(id: string): ReasoningProvider {
  const p = registry[id];
  if (!p) throw new Error(`Unknown provider: ${id}`);
  return p;
}

export function listProviders(): string[] {
  return Object.keys(registry);
}
