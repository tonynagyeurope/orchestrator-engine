import { z } from "zod";

/**
 * Request schema for pipeline.listProfiles.
 * No params are required for this method.
 */
export const PipelineListProfilesRequestSchema = z.object({}).optional();

/**
 * Each profile info entry.
 */
export const ProfileSummarySchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional()
});

/**
 * Successful response for pipeline.listProfiles.
 */
export const PipelineListProfilesResponseSchema = z.object({
  ok: z.literal(true),
  profiles: z.array(ProfileSummarySchema)
});

/**
 * Error envelope for MCP-compatible error handling.
 */
export const PipelineListProfilesErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
