// src/utils/traceLogger.ts

import { formatTraceLog } from "./traceFormatter.js";

/**
 * Simple structured trace logger for MCP + Orchestrator Engine events.
 * Produces JSON logs with consistent fields for easier analysis.
 */

export interface TraceLogEntry {
  timestamp?: string;
  method: string;
  provider?: string;
  durationMs?: number;
  status: "ok" | "error";
  message?: string;
}

/**
 * Writes a structured JSON log to stdout.
 */
export function traceLog(entry: TraceLogEntry): void {
  const output = {
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  };
  process.stdout.write(formatTraceLog(output)); 
}

/**
 * Utility to measure execution time for a promise and log it automatically.
 */
export async function traceWithTiming<T>(
  method: string,
  provider: string | undefined,
  task: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await task();
    const duration = performance.now() - start;
    traceLog({ method, provider, durationMs: duration, status: "ok" });
    return result;
  } catch (err) {
    const duration = performance.now() - start;
    const message = (err as Error).message;
    traceLog({ method, provider, durationMs: duration, status: "error", message });
    throw err;
  }
}
