// src/reasoning/providerRegistry.ts

import type { ReasoningProvider } from "./types.js";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "./bedrockReasoningProvider.js";

const providers: Record<string, ReasoningProvider> = {
  openai: openaiReasoningProvider,
  bedrock: bedrockReasoningProvider
};

export function registerProvider(name: string, provider: ReasoningProvider): void {
  providers[name] = provider;
}

export function getProvider(name: string): ReasoningProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown provider: ${name}`);
  return provider;
}

export function listProviders(): string[] {
  return Object.keys(providers);
}
