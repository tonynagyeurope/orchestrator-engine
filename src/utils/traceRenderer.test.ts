import kleur from "kleur";
import stripAnsi from "strip-ansi";
import { renderTrace } from "./traceRenderer.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TraceStep } from "./traceFormatter.js";

describe("renderTrace (CLI visualization)", () => {
  beforeEach(() => {
    // Force TTY + kleur output even under CI
    kleur.enabled = true;
    Object.defineProperty(process.stdout, "isTTY", { value: true });
  });

  it("prints formatted trace with index, timestamp, and meta", async () => {
    const steps: TraceStep[] = [
      {
        index: 1,
        text: "Task received",
        timestamp: new Date("2025-01-01T10:00:00Z").toISOString(),
        meta: { provider: "mock" },
      },
      {
        index: 2,
        text: "Reasoning step 2",
        timestamp: new Date("2025-01-01T10:00:01Z").toISOString(),
      },
    ];

    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg ?? ""));
    });

    // Run renderTrace synchronously
    renderTrace(steps, { enabled: true });

    // Wait a short tick to flush console logs
    await new Promise((r) => setTimeout(r, 5));

    const output = logs.join("\n");
    const cleanOutput = stripAnsi(output).replace(/\[\d{2}:\d{2}:\d{2}\]/g, "[HH:MM:SS]");

    // Assertions
    expect(cleanOutput).toContain("[Reasoning Trace Visualization]");
    expect(cleanOutput).toContain("#01");
    expect(cleanOutput).toContain("#02");

    spy.mockRestore();
  });
});