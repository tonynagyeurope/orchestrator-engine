// src/mcp/rpcHandler.ts
import { runOrchestratorPipeline } from "../pipeline/runOrchestratorPipeline.js";

export interface RpcRequest {
  jsonrpc: "2.0";
  method: string;
  params?: Record<string, unknown> | unknown[];
  id: string | number | null;
}

export interface RpcResponse {
  jsonrpc: "2.0";
  result?: unknown;
  error?: {
    code: number;
    message: string;
  };
  id: string | number | null;
}

export async function handleRpcRequest(request: RpcRequest): Promise<RpcResponse> {
  if (request.jsonrpc !== "2.0" || !request.method) {
    return {
      jsonrpc: "2.0",
      error: { code: -32600, message: "Invalid Request" },
      id: request.id ?? null
    };
  }

  try {
    let result: unknown;

    switch (request.method) {
      case "ping":
        result = { ok: true, message: "pong" };
        break;

      case "tools.call":
        result = await handleToolsCall(request.params);
        break;

      default:
        throw new Error(`Unknown method: ${request.method}`);
    }

    return { jsonrpc: "2.0", result, id: request.id ?? null };

  } catch (err) {
    const error = err as Error;
    return {
      jsonrpc: "2.0",
      error: { code: -32001, message: error.message },
      id: request.id ?? null
    };
  }
}

/**
 * Executes an Orchestrator Engine pipeline via the MCP 'tools.call' route.
 */
async function handleToolsCall(params: unknown): Promise<unknown> {
  try {
    const payload = params && typeof params === "object" ? params : {};
    const { input, profile } = payload as { input?: string; profile?: string };

    if (!input) throw new Error("Missing 'input' parameter for tools.call");

    // Run the Orchestrator Engine reasoning pipeline
    const result = await runOrchestratorPipeline({
      text: input,
      profileId: profile ?? "default"
    });

    return {
      ok: true,
      engine: "OrchestratorEngine",
      output: result
    };

  } catch (err) {
    const error = err as Error;
    return { ok: false, error: error.message };
  }
}
