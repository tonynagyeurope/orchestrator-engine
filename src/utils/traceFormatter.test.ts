import { describe, it, expect } from "vitest";
import { formatTrace } from "./traceFormatter.js";

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
});
