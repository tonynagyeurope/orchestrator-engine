// src/utils/traceFormatter.ts

/**
 * traceFormatter.ts
 * -----------------
 * Utility for formatting reasoning traces into structured, timestamped steps.
 */

export interface TraceStep {
  index: number;
  text: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

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
    text: text.trim(),
    timestamp: new Date(now.getTime() + i * 100).toISOString(),
    meta
  }));
}
