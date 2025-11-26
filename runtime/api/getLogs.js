// runtime/api/getLogs.ts
// Returns all structured stderr log records from the runtime buffer.
import { getLogs } from "../logBuffer.js";
export async function getLogsHandler() {
    const logs = getLogs();
    return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logs)
    };
}
