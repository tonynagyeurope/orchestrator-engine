import {
  ProviderListResponseSchema,
  ProviderListErrorSchema
} from "../schemas/providerList.js";

import { getAvailableProviders } from "../../reasoning/providerFactory.js";

/**
 * List all reasoning providers (OpenAI, Bedrock, Mock).
 */
export async function handleProviderList() {
  try {
    const providers = getAvailableProviders();

    return ProviderListResponseSchema.parse({
      ok: true,
      providers
    });
  } catch (err) {
    return ProviderListErrorSchema.parse({
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "PROVIDER_LIST_FAILURE"
      }
    });
  }
}
