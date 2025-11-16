import { describe, it, expect, vi } from "vitest";
import { renderTrace } from "./traceRenderer.js";
import { TraceStep } from "./traceFormatter.js";

function stripAnsi(str: string): string {
  // Removes ANSI color codes from console output
  return str.replace(/\u001b\[.*?m/g, "");
}

describe("renderTrace (CLI visualization)", () => {
  it("prints formatted trace with index, timestamp, and meta", () => {
    const mockTrace: TraceStep[] = [
      { index: 1, text: "Task received", timestamp: "2025-11-15T10:00:00Z", meta: { provider: "mock" } },
      { index: 2, text: "Reasoning step 2", timestamp: "2025-11-15T10:00:01Z" },
    ];

    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((msg) => {
      logs.push(msg);
    });

    renderTrace(mockTrace);
    spy.mockRestore();

    const output = logs.join("\n");
    const cleanOutput = stripAnsi(output).replace(/\[\d{2}:\d{2}:\d{2}\]/g, "[HH:MM:SS]");

    expect(cleanOutput).toMatchInlineSnapshot(`
"
[Reasoning Trace Visualization]
───────────────────────────────────────────────
#01 [HH:MM:SS] Task received
   ↳ provider=mock
#02 [HH:MM:SS] Reasoning step 2
───────────────────────────────────────────────
"
`);
  });
});
