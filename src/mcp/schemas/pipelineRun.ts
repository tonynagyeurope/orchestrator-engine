import { z } from "zod";

/**
 * Schema for the pipeline.run MCP method.
 * This schema validates incoming requests from the MCP client.
 */
export const PipelineRunRequestSchema = z.object({
  profileId: z.string().min(1, "profileId is required"),
  input: z.string().min(1, "input is required"),
  provider: z.string().min(1, "provider is required"),
  mode: z.enum(["single", "multi"]).optional(),
});

/**
 * Successful response from pipeline.run.
 * `trace` is the full execution trace produced by the OE engine.
 * `final` is the OE final result.
 */
export const PipelineRunResponseSchema = z.object({
  ok: z.literal(true),
  profile: z.string(),
  final: z.string(),
  trace: z.array(
    z.object({
      index: z.number(),
      timestamp: z.string(),
      message: z.string(),
      source: z.string(),
      meta: z.record(z.string(), z.unknown()).optional()
    })
  )
});

/**
 * Error envelope for MCP-compatible error reporting.
 */
export const PipelineRunErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
