// FILE: src/utils/traceFormatter.ts

import { TraceStep } from "../reasoning/types.js";

/**
 * Convert an array of reasoning step strings into structured trace objects.
 */
export function formatTrace(
  steps: string[],
  meta?: Record<string, unknown>
): TraceStep[] {
  const now = new Date();
  return steps.map((text, i) => ({
    index: i + 1,
    timestamp: new Date(now.getTime() + i * 100).toISOString(),
    source: "provider",              // <-- MUST be one of: provider | pipeline | stop-rule
    message: text.trim(),
    meta
  }));
}

export function formatTraceLog(entry: Record<string, unknown>): string {
  return `[TRACE] ${JSON.stringify(entry)}\n`;
}
