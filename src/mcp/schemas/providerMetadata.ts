import { z } from "zod";

export const ProviderMetadataRequestSchema = z.object({
  providerId: z.string().min(1, "providerId is required")
});

export const ProviderMetadataResponseSchema = z.object({
  ok: z.literal(true),
  provider: z.object({
    id: z.string(),

    // Minimal Stage-2 compatible metadata fields
    type: z.string(),
    supports: z.array(z.string()),
    notes: z.string().optional()
  })
});

export const ProviderMetadataErrorSchema = z.object({
  ok: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.string(), z.unknown()).optional()
  })
});
