import {
  PipelineListProfilesRequestSchema,
  PipelineListProfilesResponseSchema,
  PipelineListProfilesErrorSchema
} from "../schemas/pipelineListProfiles.js";

import { loadAllProfiles } from "../../config/profileLoader.js";

/**
 * List all available OE profiles as a compact MCP response.
 */
export async function handleListProfiles(params?: unknown) {
  const parsed = PipelineListProfilesRequestSchema.safeParse(params);

  if (!parsed.success) {
    return PipelineListProfilesErrorSchema.parse({
      ok: false,
      error: {
        message: "Invalid payload for pipeline.listProfiles",
        code: "INVALID_PAYLOAD",
        details: parsed.error.flatten()
      }
    });
  }

  try {
    const profiles = await loadAllProfiles();
    const summary = profiles.map((p) => ({
      id: p.id,
      title: p.title ?? undefined,
      description: p.description ?? undefined
    }));

    return PipelineListProfilesResponseSchema.parse({
      ok: true,
      profiles: summary
    });
  } catch (err) {
    return PipelineListProfilesErrorSchema.parse({
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "LIST_PROFILES_FAILURE"
      }
    });
  }
}
