// FILE: src/pipeline/runPipeline.ts

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type {
  TraceStep,
  ReasoningProvider
} from "../reasoning/types.js";

import { runSinglePipeline } from "./runSinglePipeline.js";
import { runSequentialPipeline } from "./runSequentialPipeline.js";
import { runParallelPipeline } from "./runParallelPipeline.js";

/**
 * Stage-2 Pipeline Orchestrator
 *
 * This is the "big engine" that executes:
 *  - single reasoning pipelines
 *  - sequential orchestration
 *  - parallel orchestration
 *
 * Overloads allow calling the orchestrator with either:
 *  (profile, input, resolveProfile)
 * or:
 *  (profile, input, resolveProfile, provider)
 *
 * The provider is required ONLY for single-mode reasoning.
 */

// ---------------------
// Overload definitions
// ---------------------

// Orchestration mode (no provider needed)
export function runPipeline(
  profile: OrchestratorProfile,
  input: string,
  resolveProfile: (id: string) => Promise<OrchestratorProfile>
): Promise<{ final: string; trace: TraceStep[] }>;

// Single reasoning mode (provider required)
export function runPipeline(
  profile: OrchestratorProfile,
  input: string,
  resolveProfile: (id: string) => Promise<OrchestratorProfile>,
  provider: ReasoningProvider
): Promise<{ final: string; trace: TraceStep[] }>;

// ---------------------
// Implementation
// ---------------------
export async function runPipeline(
  profile: OrchestratorProfile,
  input: string,
  resolveProfile: (id: string) => Promise<OrchestratorProfile>,
  provider?: ReasoningProvider
): Promise<{ final: string; trace: TraceStep[] }> {

  const mode = profile.orchestration?.mode ?? "single";

  switch (mode) {
    case "single": {
      if (!provider) {
        throw new Error(
          `runPipeline(single) requires a ReasoningProvider but none was provided.`
        );
      }
      return runSinglePipeline(profile, input, provider);
    }

    case "sequential": {
      return runSequentialPipeline(
        profile,
        input,
        resolveProfile,
        runPipeline // recursive orchestration
      );
    }

    case "parallel": {
      return runParallelPipeline(
        profile,
        input,
        resolveProfile,
        runPipeline // recursive orchestration
      );
    }

    default:
      throw new Error(`Unknown orchestration mode "${mode}"`);
  }
}
