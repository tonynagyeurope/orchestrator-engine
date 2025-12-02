// FILE: src/reasoning/testReasoningProvider.ts

import type { ReasoningProvider, TraceStep } from "./types.js";

/**
 * Stage-3 deterministic test provider for CI/local testing.
 * No network calls, no credentials required.
 */
export function testReasoningProvider(): ReasoningProvider {
  return {
    id: "test",

    async run(input: string): Promise<{
      final: string;
      trace: TraceStep[];
    }> {
      const now = new Date().toISOString();

      const trace: TraceStep[] = [
        {
          index: 0,                   // required number
          timestamp: now,             // required ISO string
          message: `Processed: ${input}`,
          source: "provider"          // optional but useful
        }
      ];

      return {
        final: `TEST_FINAL(${input})`,
        trace
      };
    }
  };
}
