// src/pipeline/runOrchestratorPipeline.ts
import { analyzeAi } from "./analyzeAi.js";
import { loadProfile } from "../config/profileLoader.js";
import type { OrchestratorProfile } from "../config/baseConfig.js";

/**
 * Input structure for running an orchestrator pipeline.
 */
export interface OrchestratorPipelineInput {
  text: string;
  profileId?: string;
}

/**
 * Runs the Orchestrator Engine reasoning pipeline.
 * This function acts as a public API layer for MCP or other external modules.
 */
export async function runOrchestratorPipeline(
  input: OrchestratorPipelineInput
): Promise<unknown> {
  try {
    const { text, profileId = "default" } = input;

    if (!text || typeof text !== "string") {
      throw new Error("Invalid or missing text input for Orchestrator pipeline.");
    }

    // Load reasoning profile (model configuration, prompt templates, etc.)
    const profile: OrchestratorProfile = await loadProfile(profileId);

    // Run the reasoning / analysis pipeline
    const result = await analyzeAi({ text }, profile);

    // Return structured output for MCP
    return {
      summary: result.summary ?? "No summary available.",
      steps: result.steps ?? [],
      provider: profile.displayName ?? "Unknown Provider",
      domain: profile.domainFocus ?? "general"
    };
  } catch (err) {
    const error = err as Error;
    return {
      ok: false,
      error: error.message
    };
  }
}
