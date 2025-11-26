// runtime/logBuffer.ts

// Simple in-memory ring buffer for storing structured stderr logs.
// Used by the frontend demo to visualize the engine's internal reasoning steps.

export interface LogRecord {
  ts: number;
  level: string;
  [key: string]: unknown;
}

const MAX_LOG_RECORDS = 500;
const buffer: LogRecord[] = [];

export function addLog(record: LogRecord): void {
  buffer.push(record);
  if (buffer.length > MAX_LOG_RECORDS) {
    buffer.shift(); // remove oldest entry
  }
}

export function getLogs(): LogRecord[] {
  return [...buffer];
}

export function clearLogs(): void {
  buffer.length = 0;
}
