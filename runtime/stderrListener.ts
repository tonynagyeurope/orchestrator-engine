// runtime/stderrListener.ts
// Attaches to the child process stderr stream and pipes all JSON log lines
// into the in-memory buffer. Non-JSON lines are ignored silently.

import type { ChildProcessWithoutNullStreams } from "child_process";
import { addLog } from "./logBuffer.js";

export function attachStderrListener(proc: ChildProcessWithoutNullStreams): void {
  proc.stderr.on("data", (chunk: Buffer) => {
    const lines = chunk.toString().split("\n");

    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;

      try {
        const parsed = JSON.parse(line);
        addLog(parsed);
      } catch {
        // Ignore non-JSON lines (safe for noisy processes)
      }
    }
  });
}
