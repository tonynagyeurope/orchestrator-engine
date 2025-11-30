// FILE: infra/oeHandler.ts
// AWS Lambda handler for the Orchestrator Engine (OE)
// This function receives an HTTP request (API Gateway), validates input,
// loads the correct orchestrator profile, runs the OE pipeline,
// and returns a clean JSON response.

import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { runOrchestration } from "../src/index.js";
import { z } from "zod";

// Input validation schema
const requestSchema = z.object({
  input: z.string(),
  profileId: z.string().default("default")
});

// Helper to create HTTP responses
const jsonResponse = (
  statusCode: number,
  body: unknown
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body, null, 2)
  };
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // Parse incoming request body
    const rawBody = event.body ? JSON.parse(event.body) : {};
    const parsed = requestSchema.parse(rawBody);

    // Run the Orchestrator Engine
    const result = await runOrchestration(parsed.input, parsed.profileId);

    return jsonResponse(200, {
      ok: true,
      profileId: parsed.profileId,
      input: parsed.input,
      result
    });
  } catch (err: unknown) {
    // Zod validation error
    if (err instanceof z.ZodError) {
      return jsonResponse(400, {
        ok: false,
        error: "Invalid request",
        details: err.issues
      });
    }

    // Unexpected error
    return jsonResponse(500, {
      ok: false,
      error: "Internal server error",
      message: err instanceof Error ? err.message : "Unknown error"
    });
  }
};
