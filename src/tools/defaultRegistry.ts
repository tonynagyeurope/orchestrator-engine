// src/tools/defaultRegistry.ts
import { McpToolRegistry } from "./registry.js";
import { fetchUrlTool } from "./fetchUrl.js";
import { awsListObjectsTool } from "./awsListObjects.js";
import { awsGetObjectTool } from "./awsGetObject.js";

/**
 * Creates a default MCP tool registry with the built-in tools.
 * This is the main entrypoint for wiring MCP into the OE.
 */
export const createDefaultMcpRegistry = (): McpToolRegistry => {
  const registry = new McpToolRegistry();

  registry.register(fetchUrlTool);
  registry.register(awsListObjectsTool);
  registry.register(awsGetObjectTool);

  return registry;
};
