// runtime/stderrListener.ts
// Attaches to the child process stderr stream and pipes all JSON log lines
// into the in-memory buffer. Non-JSON lines are ignored silently.
import { addLog } from "./logBuffer.js";
export function attachStderrListener(proc) {
    proc.stderr.on("data", (chunk) => {
        const lines = chunk.toString().split("\n");
        for (const raw of lines) {
            const line = raw.trim();
            if (!line)
                continue;
            try {
                const parsed = JSON.parse(line);
                addLog(parsed);
            }
            catch {
                // Ignore non-JSON lines (safe for noisy processes)
            }
        }
    });
}
