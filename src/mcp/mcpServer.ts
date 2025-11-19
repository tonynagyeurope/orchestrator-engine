// src/mcp/mcpServer.ts
import { createInterface } from "readline"; // <- This is the streaming from the stdio
import { handleRpcRequest } from "./rpcHandler.js";

/**
 * Entry point for the MCP stdio server.
 * 
 * This process acts as a lightweight backend that listens
 * for JSON-RPC 2.0 messages on STDIN, processes them, and
 * writes structured responses to STDOUT.
 * 
 * MCP clients such as Claude Desktop or MCP Inspector
 * communicate via standard input/output streams.
 */
export function startMcpServer(): void {
  // Create readline interface to read line-by-line from STDIN
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  console.log("[MCP] Server started and listening on STDIN...");

  // Handle each incoming line as a JSON-RPC message
  rl.on("line", async (line: string) => {
    try {
      if (!line.trim()) return; // ignore empty lines

      const request = JSON.parse(line);
      const response = await handleRpcRequest(request);

      // Send valid response back to STDOUT
      process.stdout.write(JSON.stringify(response) + "\n");
    } catch (err) {
      const error = err as Error;
      const errorResponse = {
        jsonrpc: "2.0",
        error: {
          code: -32000,
          message: error.message
        },
        id: null
      };

      // Always respond with a valid JSON-RPC error object
      process.stdout.write(JSON.stringify(errorResponse) + "\n");
      process.stderr.write(`[MCP ERROR] ${error.message}\n`);
    }
  });

  // Graceful shutdown on SIGINT
  process.on("SIGINT", () => {
    console.log("\n[MCP] Server shutting down gracefully...");
    rl.close();
    process.exit(0);
  });
}

// If executed directly (node dist/mcpServer.js)
if (process.argv[1]?.endsWith("mcpServer.js")) {
  startMcpServer();
}
