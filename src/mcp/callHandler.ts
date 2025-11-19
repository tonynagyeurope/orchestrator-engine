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
 * This is what gets sent back to the MCP client on success.
 */
export interface McpResultEvent {
  type: "mcp.result";
  tool: string;
  result: unknown;
  timestamp: string;
}

/**
 * Structure of the MCP error event.
 * This is what gets sent back to the MCP client on failure.
 */
export interface McpErrorEvent {
  type: "mcp.error";
  tool: string;
  error: string;
  timestamp: string;
}

/**
 * Optional "call" event for observation logs.
 * This is not part of the official MCP spec, but useful
 * for UI log panels and demos.
 */
export interface McpCallEvent {
  type: "mcp.event";
  event: "call";
  tool: string;
  input: unknown;
  timestamp: string;
}

/**
 * Minimal emitter interface for structured MCP events.
 * The concrete implementation can push to a UI log,
 * stdout, file logging, etc.
 */
export interface McpEventEmitter {
  // Allow well-known MCP events plus generic JSON events.
  emit(
    event:
      | McpResultEvent
      | McpErrorEvent
      | McpCallEvent
      | Record<string, unknown>
  ): void;
}

/**
 * Main MCP call handler.
 * - Validates incoming MCP request shape
 * - Enforces OE guardrails
 * - Dispatches to the tool registry
 * - Emits structured events (call, result, error)
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
   *
   * This uses the "config-as-control" OEConfig capabilities.
   */
  private validateGuardrails(toolName: string): void {
    const { awsApi, cliOnly } = this.config.capabilities;

    // In CLI-only mode, only allow read-only, "safe" tools.
    // This keeps the MCP demo aligned with the OE philosophy:
    // the agent may suggest commands, but not mutate infra directly.
    if (cliOnly) {
      const allowed = ["fetchUrl", "awsListObjects", "awsGetObject"];

      if (!allowed.includes(toolName)) {
        throw new Error(`Tool "${toolName}" not permitted in cli-only mode.`);
      }
    }

    // If AWS API is entirely disabled, block mutating AWS tools.
    if (!awsApi) {
      const forbiddenPrefixes = [
        "awsPutObject",
        "awsDeleteObject",
        "awsUpdate",
        "awsWrite",
        "awsModify"
      ];

      if (forbiddenPrefixes.some(prefix => toolName.startsWith(prefix))) {
        throw new Error(
          `AWS API access disabled, cannot execute tool "${toolName}".`
        );
      }
    }
  }

  /**
   * Handle a single MCP call message.
   * Returns either a result or an error event.
   */
  async handle(
    req: McpCallRequest
  ): Promise<McpResultEvent | McpErrorEvent> {
    if (req.type !== "mcp.call") {
      throw new Error(`Unsupported MCP message type: ${req.type}`);
    }

    const timestamp = new Date().toISOString();

    // Emit a "call" event so the UI / logs can show
    // that a tool invocation was requested.
    const callEvent: McpCallEvent = {
      type: "mcp.event",
      event: "call",
      tool: req.tool,
      input: req.input,
      timestamp
    };
    this.emitter?.emit(callEvent);

    try {
      // Enforce OE guardrails based on config.
      this.validateGuardrails(req.tool);

      // Execute tool via registry.
      const result = await this.registry.execute(req.tool, req.input);

      const event: McpResultEvent = {
        type: "mcp.result",
        tool: req.tool,
        result,
        timestamp
      };

      this.emitter?.emit(event);
      return event;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown MCP tool error";

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
