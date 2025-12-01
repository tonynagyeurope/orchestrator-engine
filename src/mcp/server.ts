// FILE: src/mcp/server.ts
import { handleRpcRequest, RpcResponse } from "./rpcHandler.js";

/**
 * Minimal local MCP-style server
 * This is only for local development & testing.
 */
export async function handleMcpCall(body: unknown): Promise<RpcResponse> {
  return handleRpcRequest(body);
}
