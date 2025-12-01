import {
  ProviderMetadataRequestSchema,
  ProviderMetadataResponseSchema,
  ProviderMetadataErrorSchema
} from "../schemas/providerMetadata.js";

import { getProvider } from "../../reasoning/providerFactory.js";

/**
 * Return provider-level metadata without assuming unavailable fields.
 * Works with minimal Stage-2 provider objects.
 */
export async function handleProviderMetadata(params: unknown) {
  const parsed = ProviderMetadataRequestSchema.safeParse(params);

  if (!parsed.success) {
    return ProviderMetadataErrorSchema.parse({
      ok: false,
      error: {
        message: "Invalid payload for provider.metadata",
        code: "INVALID_PAYLOAD",
        details: parsed.error.flatten()
      }
    });
  }

  const { providerId } = parsed.data;

  try {
    const provider = getProvider(providerId);

    return ProviderMetadataResponseSchema.parse({
      ok: true,
      provider: {
        id: provider.id,

        // These values are safe defaults (your Stage-2 providers do not define model/name)
        type: "reasoning-provider",
        supports: ["call"],

        // Optional debug information:
        notes: "Minimal provider metadata because Stage-2 providers do not expose name/model fields."
      }
    });
  } catch (err) {
    return ProviderMetadataErrorSchema.parse({
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "PROVIDER_METADATA_FAILURE"
      }
    });
  }
}
