import { describe, it, expect } from "vitest";
import { formatTrace, formatTraceLog } from "./traceFormatter.js";

describe("traceFormatter", () => {
  it("formats step strings into structured trace objects", () => {
    const steps = ["First reasoning step", "Second reasoning step"];
    const meta = { provider: "mock" };

    const result = formatTrace(steps, meta);

    expect(result.length).toBe(2);
    expect(result[0]).toHaveProperty("index", 1);
    expect(result[0]).toHaveProperty("text", "First reasoning step");
    expect(result[0].meta?.provider).toBe("mock");
    expect(result[0].timestamp).toMatch(/T\d{2}:\d{2}:\d{2}/); // ISO timestamp
  });

  it("formats log entries into JSON strings with [TRACE] prefix", () => {
    const entry = {
      method: "tools.call",
      provider: "OpenAI",
      status: "ok",
      durationMs: 120,
      timestamp: "2025-11-19T16:55:22.000Z",
    };

    const output = formatTraceLog(entry);

    expect(output.startsWith("[TRACE] ")).toBe(true);
    expect(output.endsWith("\n")).toBe(true);

    // Parse JSON part after prefix
    const json = JSON.parse(output.replace(/^\[TRACE\]\s*/, ""));
    expect(json.method).toBe("tools.call");
    expect(json.provider).toBe("OpenAI");
    expect(json.status).toBe("ok");
    expect(json.durationMs).toBe(120);
    expect(json.timestamp).toBe("2025-11-19T16:55:22.000Z");
  });
});
