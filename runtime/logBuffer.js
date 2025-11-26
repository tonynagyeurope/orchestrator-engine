// runtime/logBuffer.ts
const MAX_LOG_RECORDS = 500;
const buffer = [];
export function addLog(record) {
    buffer.push(record);
    if (buffer.length > MAX_LOG_RECORDS) {
        buffer.shift(); // remove oldest entry
    }
}
export function getLogs() {
    return [...buffer];
}
export function clearLogs() {
    buffer.length = 0;
}
