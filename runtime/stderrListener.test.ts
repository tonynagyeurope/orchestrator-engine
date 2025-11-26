import { describe, it, expect, beforeEach } from "vitest";
import { EventEmitter } from "events";
import { attachStderrListener } from "./stderrListener.js";
import { getLogs, clearLogs } from "./logBuffer.js";

class MockProcess extends EventEmitter {
  stderr = new EventEmitter();

  emitData(data: string): void {
    this.stderr.emit("data", Buffer.from(data));
  }
}

describe("stderrListener", () => {
  beforeEach(() => {
    clearLogs();
  });

  it("should parse JSON log lines and add them to the buffer", () => {
    const mock = new MockProcess();
    attachStderrListener(mock as any);

    mock.emitData('{"ts":1,"level":"trace","msg":"one"}\n');
    mock.emitData('{"ts":2,"level":"debug","msg":"two"}\n');

    const logs = getLogs();
    expect(logs.length).toBe(2);
    expect(logs[0].msg).toBe("one");
    expect(logs[1].level).toBe("debug");
  });

  it("should ignore non-JSON lines", () => {
    const mock = new MockProcess();
    attachStderrListener(mock as any);

    mock.emitData("not-json-line\n");

    const logs = getLogs();
    expect(logs.length).toBe(0);
  });
});
