import { describe, it, expect, beforeEach } from "vitest";
import { addLog, getLogs, clearLogs } from "./logBuffer.js";

describe("logBuffer", () => {
  beforeEach(() => {
    clearLogs();
  });

  it("should add log records to the buffer", () => {
    addLog({ ts: Date.now(), level: "trace", msg: "hello" });
    const logs = getLogs();

    expect(logs.length).toBe(1);
    expect(logs[0].msg).toBe("hello");
  });

  it("should return a copy, not the original buffer reference", () => {
    addLog({ ts: Date.now(), level: "trace" });

    const logs = getLogs();
    logs.pop(); // modify returned array

    const logsAfter = getLogs();
    expect(logsAfter.length).toBe(1); // original buffer unaffected
  });

  it("should drop the oldest record when capacity is reached", () => {
    for (let i = 0; i < 510; i++) {
      addLog({ ts: i, level: "trace", index: i });
    }

    const logs = getLogs();

    expect(logs.length).toBe(500);
    expect(logs[0].ts).toBe(10);
  });

  it("should clear the buffer", () => {
    addLog({ ts: Date.now(), level: "trace" });
    clearLogs();

    const logs = getLogs();
    expect(logs.length).toBe(0);
  });
});
