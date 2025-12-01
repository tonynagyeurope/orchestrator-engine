import { z } from "zod";

/**
 * Request schema for pipeline.getProfile.
 */
export const PipelineGetProfileRequestSchema = z.object({
  profileId: z.string().min(1, "profileId is required")
});

/**
 * Successful response containing the full profile JSON.
 */
export const PipelineGetProfileResponseSchema = z.object({
  ok: z.literal(true),
  profile: z.record(z.string(), z.unknown()) // full JSON profile
});

/**
 * Error envelope for pipeline.getProfile.
 */
export const PipelineGetProfileErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
