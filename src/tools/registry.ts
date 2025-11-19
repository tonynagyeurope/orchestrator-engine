// src/tools/registry.ts
import type { McpTool } from "../types/mcp.js";

export class McpToolRegistry {
  private readonly tools: Map<string, McpTool> = new Map();

  /**
   * Registers a new MCP tool in the registry.
   */
  register(tool: McpTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  /**
   * Returns a tool by name.
   * Throws if the tool does not exist.
   */
  get(toolName: string): McpTool {
    const tool = this.tools.get(toolName);
    if (!tool) {
      throw new Error(`Tool not found: ${toolName}`);
    }
    return tool;
  }

  /**
   * Executes a tool by name.
   * This is the main entrypoint for MCP call handlers
   * and future OE integration.
   */
  async execute(toolName: string, input: unknown): Promise<unknown> {
    const tool = this.get(toolName);
    return tool.handler(input);
  }

  /**
   * Returns a list of all registered tools.
   */
  list(): string[] {
    return Array.from(this.tools.keys());
  }
}
