// src/reasoning/reasoningProvider.ts

import { ReasoningProvider } from "./types.js";

/**
 * Factory to select reasoning backend dynamically.
 */
export async function getReasoningProvider(): Promise<ReasoningProvider> {
  const { getDefaultProvider } = await import("./providerDiscovery.js");
  return getDefaultProvider();
}
