// src/utils/traceLogger.test.ts
import { describe, it, expect, vi } from "vitest";
import { traceLog, traceWithTiming } from "./traceLogger.js";

describe("traceLogger", () => {
  it("should log a structured entry with default timestamp", () => {
    const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    traceLog({
      method: "tools.call",
      provider: "OpenAI",
      status: "ok",
      durationMs: 42
    });

    const output = mockWrite.mock.calls[0][0] as string;
    const json = JSON.parse(output.replace(/^\[TRACE\]\s*/, ""));

    expect(json.method).toBe("tools.call");
    expect(json.provider).toBe("OpenAI");
    expect(json.status).toBe("ok");
    expect(json.durationMs).toBeGreaterThanOrEqual(0);
    expect(typeof json.timestamp).toBe("string");

    mockWrite.mockRestore();
  });

  it("should measure execution time and log status ok", async () => {
    const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await traceWithTiming("tools.call", "OpenAI", async () => {
      await new Promise((r) => setTimeout(r, 50));
      return "done";
    });

    const output = mockWrite.mock.calls[0][0] as string;
    const json = JSON.parse(output.replace(/^\[TRACE\]\s*/, ""));

    expect(json.status).toBe("ok");
    expect(json.method).toBe("tools.call");
    expect(json.provider).toBe("OpenAI");
    expect(json.durationMs).toBeGreaterThan(0);

    mockWrite.mockRestore();
  });

  it("should log error if task throws", async () => {
    const mockWrite = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await expect(
      traceWithTiming("tools.call", "OpenAI", async () => {
        throw new Error("Simulated failure");
      })
    ).rejects.toThrow("Simulated failure");

    const output = mockWrite.mock.calls[0][0] as string;
    const json = JSON.parse(output.replace(/^\[TRACE\]\s*/, ""));

    expect(json.status).toBe("error");
    expect(json.message).toContain("Simulated failure");
    expect(json.method).toBe("tools.call");

    mockWrite.mockRestore();
  });
});
