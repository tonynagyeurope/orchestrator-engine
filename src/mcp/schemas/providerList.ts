import { z } from "zod";

/**
 * A simple provider list (string IDs).
 * Example: ["openai", "bedrock", "test"]
 */
export const ProviderListResponseSchema = z.object({
  ok: z.literal(true),
  providers: z.array(z.string())
});

/**
 * Error envelope for provider.list.
 */
export const ProviderListErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
