#!/usr/bin/env node
import { stdin, stdout } from "node:process";
import { createInterface } from "node:readline";
import { loadProfile } from "../config/profileLoader.js";
import { runReasoningPipeline } from "../../runtime/runPipeline.js";

// Minimal JSON-RPC types
interface JsonRpcRequest {
  jsonrpc: "2.0";
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

// Create readline interface for stdio communication
const rl = createInterface({ input: stdin });

rl.on("line", async (line: string) => {
  let request: JsonRpcRequest;

  try {
    request = JSON.parse(line) as JsonRpcRequest;
  } catch {
    return;
  }

  if (request.method === "mcp.runReasoning") {
    const { provider, input, profile } = request.params as {
      provider: string;
      input: string;
      profile: string;
    };

    const profileConfig = await loadProfile(profile);
    const result = await runReasoningPipeline(provider, input, profileConfig.id);

    const response: JsonRpcResponse = {
      jsonrpc: "2.0",
      id: request.id,
      result
    };

    stdout.write(JSON.stringify(response) + "\n");
    return;
  }

  // Unknown method
  const errorResponse: JsonRpcResponse = {
    jsonrpc: "2.0",
    id: request.id,
    error: { code: -32601, message: "Method not found" }
  };

  stdout.write(JSON.stringify(errorResponse) + "\n");
});
