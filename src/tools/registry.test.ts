import { describe, it, expect } from "vitest";
import { McpToolRegistry } from "./registry.js";
import type { McpTool } from "../types/mcp.js";

const echoTool: McpTool = {
  name: "echo",
  description: "Echoes the input back.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  outputSchema: {
    type: "object",
    properties: {}
  },
  async handler(input: unknown): Promise<unknown> {
    return { input };
  }
};

describe("McpToolRegistry", () => {
  it("registers and retrieves tools", async () => {
    const registry = new McpToolRegistry();
    registry.register(echoTool);

    const tool = registry.get("echo");
    expect(tool).toBe(echoTool);

    const result = await registry.execute("echo", { foo: "bar" });
    expect(result).toEqual({ input: { foo: "bar" } });
  });

  it("throws on duplicate registration", () => {
    const registry = new McpToolRegistry();
    registry.register(echoTool);

    expect(() => registry.register(echoTool)).toThrowError(
      /Tool already registered/
    );
  });

  it("throws when tool is not found", async () => {
    const registry = new McpToolRegistry();

    await expect(registry.execute("missing", {})).rejects.toThrowError(
      /Tool not found/
    );
  });

  it("lists registered tools", () => {
    const registry = new McpToolRegistry();
    registry.register(echoTool);

    expect(registry.list()).toEqual(["echo"]);
  });
});
