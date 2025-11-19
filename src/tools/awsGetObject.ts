// src/tools/awsGetObject.ts
import type { McpTool } from "../types/mcp.js";
import {
  S3Client,
  GetObjectCommand
} from "@aws-sdk/client-s3";

/**
 * Fetches and parses an S3 object.
 * Automatically tries to parse JSON; falls back to text.
 */
export const awsGetObjectTool: McpTool = {
  name: "awsGetObject",
  description: "Retrieve an S3 object and return its parsed data.",

  inputSchema: {
    type: "object",
    properties: {
      bucket: { type: "string" },
      key: { type: "string" }
    },
    required: ["bucket", "key"]
  },

  outputSchema: {
    type: "object",
    properties: {
      data: { type: "object" }
    }
  },

  async handler(input: unknown) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("bucket" in input) ||
      !("key" in input) ||
      typeof (input as { bucket: unknown }).bucket !== "string" ||
      typeof (input as { key: unknown }).key !== "string"
    ) {
      throw new Error("Invalid input for awsGetObject.");
    }

    const { bucket, key } = input as { bucket: string; key: string };

    const client = new S3Client({});
    const obj = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    const text = await obj.Body?.transformToString() ?? "";

    // Try JSON parse
    let parsed: unknown = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text; // fallback to plain text
    }

    return {
      data: parsed
    };
  }
};
