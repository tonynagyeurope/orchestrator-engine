// src/mcp/callHandler.ts
import type { McpToolRegistry } from "../tools/registry.js";
import type { OEConfig } from "../types/config.js";

/**
 * Structure of an incoming MCP call request.
 * Example:
 * {
 *   "type": "mcp.call",
 *   "tool": "fetchUrl",
 *   "input": { "url": "https://example.com" }
 * }
 */
export interface McpCallRequest {
  type: "mcp.call";
  tool: string;
  input: unknown;
}

/**
 * Structure of the MCP result event.
 */
export interface McpResultEvent {
  type: "mcp.result";
  tool: string;
  result: unknown;
  timestamp: string;
}

/**
 * Structure of the MCP error event.
 */
export interface McpErrorEvent {
  type: "mcp.error";
  tool: string;
  error: string;
  timestamp: string;
}

/**
 * Optional event hooks used by the UI / observation log.
 */
export interface McpEventEmitter {
  emit(event: McpResultEvent | McpErrorEvent | Record<string, unknown>): void;
}

/**
 * Main MCP call handler.
 * - Enforces guardrails
 * - Dispatches to tool registry
 * - Emits MCP events (call, result, error)
 */
export class McpCallHandler {
  constructor(
    private readonly registry: McpToolRegistry,
    private readonly config: OEConfig,
    private readonly emitter?: McpEventEmitter
  ) {}

  /**
   * Validate whether the requested tool can be executed
   * under guardrail constraints.
   */
  private validateGuardrails(toolName: string): void {
    const { awsApi, cliOnly } = this.config.capabilities;

    // CLI-only strategy: do NOT allow tools that mutate infra
    if (cliOnly) {
      // In CLI-only mode, AWS API calls for mutation should be disallowed.
      // For now, only allow GET-style read-only tools.
      const allowed = ["fetchUrl", "awsListObjects", "awsGetObject"];

      if (!allowed.includes(toolName)) {
        throw new Error(
          `Tool "${toolName}" not permitted in cli-only mode.`
        );
      }
    }

    // If AWS API is disabled entirely
    if (!awsApi) {
      const forbidden = ["awsPutObject", "awsDeleteObject", "awsUpdate*", "awsWrite*", "awsModify*"];

      if (forbidden.some(f => toolName.startsWith(f))) {
        throw new Error(
          `AWS API access disabled, cannot execute tool "${toolName}".`
        );
      }
    }
  }

  /**
   * Core dispatcher for MCP call.
   */
  async handle(req: McpCallRequest): Promise<McpResultEvent | McpErrorEvent> {
    const timestamp = new Date().toISOString();

    // Emit call event for log panel
    this.emitter?.emit({
      type: "mcp.event",
      event: "call",
      tool: req.tool,
      input: req.input,
      timestamp
    });

    try {
      // Enforce guardrails
      this.validateGuardrails(req.tool);

      // Execute tool
      const result = await this.registry.execute(req.tool, req.input);

      const event: McpResultEvent = {
        type: "mcp.result",
        tool: req.tool,
        result,
        timestamp
      };

      this.emitter?.emit(event);
      return event;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown MCP tool error";

      const event: McpErrorEvent = {
        type: "mcp.error",
        tool: req.tool,
        error: errorMessage,
        timestamp
      };

      this.emitter?.emit(event);
      return event;
    }
  }
}
