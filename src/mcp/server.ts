// FILE: src/mcp/server.ts
import { handleRpcRequest } from "./rpcHandler.js";

/**
 * Minimal local MCP-style server
 * This is only for local development & testing.
 */
export async function handleMcpCall(body: unknown) {
  return handleRpcRequest(body);
}
