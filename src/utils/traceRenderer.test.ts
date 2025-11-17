import kleur from "kleur";
import stripAnsi from "strip-ansi";
import { renderTrace } from "./traceRenderer.js";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TraceStep } from "./traceFormatter.js";

describe("renderTrace (CLI visualization)", () => {
  let logs: string[];
  let spy: ReturnType<typeof vi.spyOn>;
  const flush = async () => new Promise((r) => setTimeout(r, 5));

  // Common reusable steps for all tests
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

  beforeEach(() => {
    kleur.enabled = true;
    Object.defineProperty(process.stdout, "isTTY", { value: true });
    logs = [];
    spy = vi.spyOn(console, "log").mockImplementation((msg?: unknown) => {
      logs.push(String(msg ?? ""));
    });
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it("prints formatted trace with index, timestamp, and meta", async () => {
    renderTrace(steps, { enabled: true });
    await flush();
    const output = logs.join("\n");
    const clean = stripAnsi(output);
    expect(clean).toContain("[Reasoning Trace Visualization]");
    expect(clean).toContain("#01");
    expect(clean).toContain("provider=mock");
  });

  it("renders without timestamps when timestamps=false", async () => {
    renderTrace(steps, { enabled: true, timestamps: false });
    await flush();
    const output = logs.join("\n");
    expect(output).not.toMatch(/\[\d{2}:\d{2}:\d{2}\]/);
  });

  it("skips meta info when verbose=false", async () => {
    renderTrace(steps, { enabled: true, verbose: false });
    await flush();
    const output = logs.join("\n");
    expect(output).not.toContain("provider=mock");
  });
});