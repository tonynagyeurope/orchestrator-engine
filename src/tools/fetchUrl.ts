// src/tools/fetchUrl.ts
import type { McpTool } from "../types/mcp.js";

/**
 * Simple HTTP GET tool.
 * Useful for demo visibility inside the MCP Observation Log.
 */
export const fetchUrlTool: McpTool = {
  name: "fetchUrl",
  description: "Fetch a URL via HTTP GET and return status + body.",

  inputSchema: {
    type: "object",
    properties: {
      url: { type: "string" }
    },
    required: ["url"]
  },

  outputSchema: {
    type: "object",
    properties: {
      status: { type: "number" },
      body: { type: "string" }
    }
  },

  async handler(input: unknown) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("url" in input) ||
      typeof (input as { url: unknown }).url !== "string"
    ) {
      throw new Error("Invalid input for fetchUrl.");
    }

    const url = (input as { url: string }).url;
    const res = await fetch(url);
    const body = await res.text();

    return {
      status: res.status,
      body
    };
  }
};
