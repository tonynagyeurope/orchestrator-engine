// src/mcp/stdioServer.ts
import readline from "node:readline";
import process from "node:process";

import { McpToolRegistry } from "../tools/registry.js";
import { fetchUrlTool } from "../tools/fetchUrl.js";
import { awsListObjectsTool } from "../tools/awsListObjects.js";
import { awsGetObjectTool } from "../tools/awsGetObject.js";

import type { Capabilities, OEConfig } from "../types/config.js";
import {
  McpCallHandler,
  type McpEventEmitter,
  type McpResultEvent,
  type McpErrorEvent
} from "./callHandler.js";

const MCP_PROTOCOL_VERSION = "2025-03-26";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: number | string | null;
  method: string;
  params?: unknown;
}

interface JsonRpcSuccessResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  result: unknown;
}

interface JsonRpcErrorObject {
  code: number;
  message: string;
  data?: unknown;
}

interface JsonRpcErrorResponse {
  jsonrpc: "2.0";
  id: number | string | null;
  error: JsonRpcErrorObject;
}

type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;

interface ToolsListResult {
  tools: Array<{
    name: string;
    title?: string;
    description: string;
    inputSchema: unknown;
    outputSchema?: unknown;
  }>;
  nextCursor?: string | null;
}

interface ToolsCallParams {
  name: string;
  arguments?: unknown;
}

/**
 * Simple MCP event emitter that logs events to stderr.
 * This keeps stdout clean for JSON-RPC responses only.
 */
class StdioMcpEventEmitter implements McpEventEmitter {
  emit(event: McpResultEvent | McpErrorEvent | Record<string, unknown>): void {
    try {
      const serialized = JSON.stringify(event);
      process.stderr.write(`[MCP_EVENT] ${serialized}\n`);
    } catch {
      // Last-resort fallback: never throw from logging
      process.stderr.write("[MCP_EVENT] Failed to serialize MCP event.\n");
    }
  }
}

/**
 * Built-in registry for the demo MCP server.
 * Registers fetchUrl + S3 read-only tools.
 */
function createBuiltinRegistry(): McpToolRegistry {
  const registry = new McpToolRegistry();

  registry.register(fetchUrlTool);
  registry.register(awsListObjectsTool);
  registry.register(awsGetObjectTool);

  return registry;
}

/**
 * Default OE capabilities for the MCP stdio server.
 * - cliOnly: true       → only read-safe tools are allowed
 * - awsApi: true        → AWS read-only tools are allowed
 * - requiresHumanApproval: true → used by higher-level reasoning later
 */
const defaultCapabilities: Capabilities = {
  awsApi: true,
  cliOnly: true,
  requiresHumanApproval: true
};

/**
 * Minimal OE config wrapper for the MCP layer.
 * For now, the MCP server only needs the capabilities object.
 */
const defaultConfig: OEConfig = {
  provider: "openai",
  capabilities: defaultCapabilities,
  tools: ["fetchUrl", "awsListObjects", "awsGetObject"],
  reasoning: {
    maxSteps: 8,
    safeMode: "guardrail"
  }
};

/**
 * Helper for building JSON-RPC error responses.
 */
function makeErrorResponse(
  id: number | string | null,
  code: number,
  message: string,
  data?: unknown
): JsonRpcErrorResponse {
  return {
    jsonrpc: "2.0",
    id,
    error: {
      code,
      message,
      ...(data === undefined ? {} : { data })
    }
  };
}

/**
 * Core JSON-RPC request handler.
 * This is pure and testable: given a request + handler + registry,
 * it returns a JSON-RPC response (or null for notifications).
 */
export async function handleJsonRpcMessage(
  message: JsonRpcRequest,
  handler: McpCallHandler,
  registry: McpToolRegistry
): Promise<JsonRpcResponse | null> {
  const { id, method } = message;

  // Notifications (no id) → no response required
  if (id === undefined || id === null) {
    // We still might want to handle some notifications later
    // (e.g. notifications/initialized), but they do not need a response.
    return null;
  }

  // Basic validation
  if (message.jsonrpc !== "2.0") {
    return makeErrorResponse(
      id,
      -32600,
      "Invalid request: jsonrpc must be '2.0'."
    );
  }

  if (typeof method !== "string") {
    return makeErrorResponse(
      id,
      -32600,
      "Invalid request: method must be a string."
    );
  }

  // --- initialize ----------------------------------------------------------
  if (method === "initialize") {
    return {
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        serverInfo: {
          name: "orchestrator-engine-mcp",
          version: "0.1.0"
        },
        capabilities: {
          tools: {
            listChanged: false
          }
        }
        // `instructions` can be added later if we want host-facing docs.
      }
    };
  }

  // --- tools/list ----------------------------------------------------------
  if (method === "tools/list") {
    const toolNames = registry.list();

    const tools: ToolsListResult["tools"] = toolNames.map((name) => {
      // This relies on the registry having a `get` method.
      // It is already used from `execute`, so it is safe to rely on it here.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const tool = (registry as any).get(name) as {
        name: string;
        description: string;
        inputSchema: unknown;
        outputSchema?: unknown;
      };

      return {
        name: tool.name,
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema
      };
    });

    const result: ToolsListResult = {
      tools,
      nextCursor: null
    };

    return {
      jsonrpc: "2.0",
      id,
      result
    };
  }

  // --- tools/call ----------------------------------------------------------
  if (method === "tools/call") {
    const rawParams = message.params as ToolsCallParams | undefined;
    const toolName = rawParams?.name;
    const args = rawParams?.arguments ?? {};

    if (!toolName || typeof toolName !== "string") {
      return makeErrorResponse(
        id,
        -32602,
        "Invalid tools/call request: missing or invalid 'name'."
      );
    }

    const event = await handler.handle({
      type: "mcp.call",
      tool: toolName,
      input: args
    });

    if ((event as McpErrorEvent).type === "mcp.error") {
      const err = event as McpErrorEvent;

      return {
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: err.error
            }
          ],
          isError: true
        }
      };
    }

    const ok = event as McpResultEvent;
    const structured = ok.result;
    const text = JSON.stringify(structured, null, 2);

    return {
      jsonrpc: "2.0",
      id,
      result: {
        content: [
          {
            type: "text",
            text
          }
        ],
        structuredContent: structured,
        isError: false
      }
    };
  }

  // Unknown method → JSON-RPC "Method not found"
  return makeErrorResponse(
    id,
    -32601,
    `Method not found: ${method}`
  );
}

/**
 * Run an MCP stdio server that wraps the Orchestrator Engine tools.
 * Reads JSON-RPC 2.0 messages from stdin, writes responses to stdout.
 */
export function runStdioMcpServer(): void {
  const registry = createBuiltinRegistry();
  const emitter = new StdioMcpEventEmitter();
  const handler = new McpCallHandler(registry, defaultConfig, emitter);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  process.stderr.write("[MCP] Orchestrator Engine MCP stdio server started.\n");

  rl.on("line", async (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    let message: JsonRpcRequest;

    try {
      message = JSON.parse(trimmed) as JsonRpcRequest;
    } catch (err) {
      process.stderr.write(
        `[MCP] Failed to parse JSON: ${String(err)}\n`
      );
      const response = makeErrorResponse(
        null,
        -32700,
        "Parse error"
      );
      process.stdout.write(`${JSON.stringify(response)}\n`);
      return;
    }

    try {
      const response = await handleJsonRpcMessage(
        message,
        handler,
        registry
      );

      if (response) {
        process.stdout.write(`${JSON.stringify(response)}\n`);
      }
    } catch (err) {
      // Last-resort guardrail: never crash the server on a single bad message.
      process.stderr.write(
        `[MCP] Unexpected server error: ${String(err)}\n`
      );
      const response = makeErrorResponse(
        message.id ?? null,
        -32000,
        "Internal MCP server error"
      );
      process.stdout.write(`${JSON.stringify(response)}\n`);
    }
  });

  rl.on("close", () => {
    process.stderr.write("[MCP] Stdio server shutting down.\n");
    process.exit(0);
  });
}

// Allow direct execution: `node dist/mcp/stdioServer.js`
if (import.meta.url === `file://${process.argv[1]}`) {
  runStdioMcpServer();
}
