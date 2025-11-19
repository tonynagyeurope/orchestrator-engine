// src/tools/awsListObjects.ts
import type { McpTool } from "../types/mcp.js";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

/**
 * Lists all object keys in a given S3 bucket.
 */
export const awsListObjectsTool: McpTool = {
  name: "awsListObjects",
  description: "List all objects in an S3 bucket.",

  inputSchema: {
    type: "object",
    properties: {
      bucket: { type: "string" }
    },
    required: ["bucket"]
  },

  outputSchema: {
    type: "object",
    properties: {
      objects: { type: "array" }
    }
  },

  async handler(input: unknown) {
    if (
      typeof input !== "object" ||
      input === null ||
      !("bucket" in input) ||
      typeof (input as { bucket: unknown }).bucket !== "string"
    ) {
      throw new Error("Invalid input for awsListObjects.");
    }

    const bucket = (input as { bucket: string }).bucket;

    const client = new S3Client({});
    const res = await client.send(
      new ListObjectsV2Command({ Bucket: bucket })
    );

    const keys = (res.Contents ?? []).map(obj => obj.Key ?? "").filter(Boolean);

    return {
      objects: keys
    };
  }
};
