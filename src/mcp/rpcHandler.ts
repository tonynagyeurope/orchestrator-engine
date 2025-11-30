// FILE: src/mcp/rpcHandler.ts
import { runOrchestration } from "../index.js";

/**
 * Minimal RPC handler for OE MCP calls.
 */
export async function handleRpcRequest(payload: unknown) {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("input" in payload) ||
    !("profileId" in payload)
  ) {
    return {
      ok: false,
      error: "Invalid RPC payload. Expected { input, profileId }."
    };
  }

  const { input, profileId } = payload as {
    input: string;
    profileId: string;
  };

  try {
    const result = await runOrchestration(input, profileId);

    return {
      ok: true,
      final: result.final,
      trace: result.trace,
      profileId
    };
  } catch (err) {
    return {
      ok: false,
      error: `Orchestration failed: ${String(err)}`
    };
  }
}
