// src/utils/logTrace.ts
// Utility for writing structured trace logs to stderr.
// These logs are consumed by the backend to build a trace buffer for the UI panel.

export interface TraceEvent {
  level?: "trace" | "debug" | "info" | "error";
  [key: string]: unknown;
}

export function logTrace(event: TraceEvent): void {
  const payload = {
    ts: Date.now(),
    level: event.level ?? "trace",
    ...event
  };

  // Write a compact JSON line to stderr
  // MCP clients ignore stderr, so this channel is safe for logs and debug output.
  process.stderr.write(JSON.stringify(payload) + "\n");
}
