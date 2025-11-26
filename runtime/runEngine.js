// runtime/runEngine.ts
// Starts the OE MCP server as a child process and attaches the stderr listener.
// This module is called by the demo runtime to orchestrate a running MCP instance.
import { spawn } from "child_process";
import { attachStderrListener } from "./stderrListener.js";
export function runEngine(profileName) {
    const proc = spawn("node", ["dist/mcp/server.js", "--profile", profileName], {
        stdio: ["pipe", "pipe", "pipe"] // stdin, stdout, stderr
    });
    attachStderrListener(proc);
    return proc;
}
