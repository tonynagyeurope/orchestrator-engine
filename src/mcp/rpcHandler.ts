// FILE: src/mcp/rpcHandler.ts

import { loadProfile } from "../config/profileLoader.js";
import { getProvider } from "../reasoning/providerFactory.js";
import { runMultiStepPipeline } from "../pipeline/runMultiStepPipeline.js";
import { runSinglePipeline } from "../pipeline/runSinglePipeline.js";

interface RpcRequest {
  input: string;
  profileId: string;
  provider?: string;
  mode?: "single" | "multi";
}

export interface RpcResponse {
  ok: boolean;
  final?: string;
  trace?: unknown[];
  profileId?: string;
  meta?: Record<string, unknown>;
  error?: string;
}

/**
 * Main MCP RPC handler — now Stage-2 compatible.
 */
export async function handleRpcRequest(payload: unknown): Promise<RpcResponse> {
  // Validate payload shape
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

  const { input, profileId, provider, mode } = payload as RpcRequest;

  try {
    const profile = await loadProfile(profileId);
    const selectedProvider = getProvider(provider ?? "openai");

    const result =
      mode === "single"
        ? await runSinglePipeline(profile, input, selectedProvider)
        : await runMultiStepPipeline(input, profile, selectedProvider);

    return {
      ok: true,
      final: result.final,
      trace: result.trace,
      profileId,
      meta: result.meta ?? {}
    };
  } catch (err) {
    return {
      ok: false,
      error: String(err)
    };
  }
}
