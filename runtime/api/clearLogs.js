// runtime/api/clearLogs.ts
// Clears the in-memory trace buffer before a new MCP reasoning run.
import { clearLogs } from "../logBuffer.js";
export async function clearLogsHandler() {
    clearLogs();
    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: "ok"
    };
}
