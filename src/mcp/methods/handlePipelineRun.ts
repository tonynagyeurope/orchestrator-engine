import { PipelineRunRequestSchema, PipelineRunResponseSchema, PipelineRunErrorSchema } from "../schemas/pipelineRun.js";
import { loadProfile } from "../../config/profileLoader.js";
import { getProvider } from "../../reasoning/providerFactory.js";
import { runSinglePipeline } from "../../pipeline/runSinglePipeline.js";
import { runMultiStepPipeline } from "../../pipeline/runMultiStepPipeline.js";

/**
 * Execute a profile-based AI pipeline using the OE engine.
 * This is the canonical MCP entry point for orchestration runs.
 */
export async function handlePipelineRun(params: unknown) {
  const parsed = PipelineRunRequestSchema.safeParse(params);
  if (!parsed.success) {
    return PipelineRunErrorSchema.parse({
      ok: false,
      error: {
        message: "Invalid pipeline.run payload",
        code: "INVALID_PAYLOAD",
        details: parsed.error.flatten()
      }
    });
  }

  const { profileId, input, provider, mode } = parsed.data as {
    profileId: string;
    input: string;
    provider: string;
    mode?: "single" | "multi";
  };

  try {
    const profile = await loadProfile(profileId);
    const selectedProvider = getProvider(provider);

    const result =
      mode === "single"
        ? await runSinglePipeline(profile, input, selectedProvider)
        : await runMultiStepPipeline(input, profile, selectedProvider);

    return PipelineRunResponseSchema.parse({
      ok: true,
      profile: profileId,
      final: result.final,
      trace: result.trace,
      meta: result.meta ?? {}
    });
  } catch (err) {
    return PipelineRunErrorSchema.parse({
      ok: false,
      error: {
        message: err instanceof Error ? err.message : "Unknown error",
        code: "PIPELINE_RUN_FAILURE"
      }
    });
  }
}
