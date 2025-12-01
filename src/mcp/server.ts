// FILE: src/mcp/server.ts
import { mcpRouter } from "./mcpRouter.js";
import { handleRpcRequest } from "./rpcHandler.js"; // Stage-2 fallback

export async function handleIncomingMessage(payload: any) {
  // Stage-3 MCP calls
  if (payload.method) {
    return await mcpRouter(payload);
  }

  // Stage-2 fallback calls
  return await handleRpcRequest(payload);
}
