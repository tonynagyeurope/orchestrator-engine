// src/types/mcp.ts

/**
 * JSON-serializable schema for MCP tools.
 */
export interface McpSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
}

/**
 * Base interface for every MCP-compatible tool.
 */
export interface McpTool {
  name: string;
  description: string;
  inputSchema: McpSchema;
  outputSchema: McpSchema;

  /**
   * Handler for executing the tool’s logic.
   * Always returns a fully JSON-safe object.
   */
  handler(input: unknown): Promise<unknown>;
}
