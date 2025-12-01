import {
  PipelineGetProfileRequestSchema,
  PipelineGetProfileResponseSchema,
  PipelineGetProfileErrorSchema
} from "../schemas/pipelineGetProfile.js";

import { loadProfile } from "../../config/profileLoader.js";

/**
 * Load a single profile JSON definition by ID.
 * Used for the UI preview and validation panels.
 */
export async function handleGetProfile(params: unknown) {
  const parsed = PipelineGetProfileRequestSchema.safeParse(params);
  if (!parsed.success) {
    return PipelineGetProfileErrorSchema.parse({
      ok: false,
      error: {
        message: "Invalid payload for pipeline.getProfile",
        code: "INVALID_PAYLOAD",
        details: parsed.error.flatten()
      }
    });
  }

  const { profileId } = parsed.data;

  try {
    const profile = await loadProfile(profileId);

    return PipelineGetProfileResponseSchema.parse({
      ok: true,
      profile
    });
  } catch (err) {
    return PipelineGetProfileErrorSchema.parse({
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "GET_PROFILE_FAILURE"
      }
    });
  }
}
