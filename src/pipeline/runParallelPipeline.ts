// FILE: src/pipeline/runParallelPipeline.ts

import type { OrchestratorProfile } from "../config/baseConfig.js";
import type {
  TraceStep,
  ReasoningProvider
} from "../reasoning/types.js";

/**
 * Executes a PARALLEL orchestration step.
 *
 * This version follows the Stage-2 design:
 *   - resolves all children first
 *   - runs all branches in parallel using the "run" function
 *   - fan-in merge based on mergeStrategy
 *   - supports summary pipelines
 *   - supports nested sequential/parallel pipelines
 */
export async function runParallelPipeline(
  parentProfile: OrchestratorProfile,
  input: string,
  resolveProfile: (id: string) => Promise<OrchestratorProfile>,
  run: (
    profile: OrchestratorProfile,
    input: string,
    resolveProfile: (id: string) => Promise<OrchestratorProfile>,
    provider?: ReasoningProvider
  ) => Promise<{ final: string; trace: TraceStep[] }>
): Promise<{ final: string; trace: TraceStep[] }> {

  const trace: TraceStep[] = [];

  const children = parentProfile.orchestration?.children ?? [];
  const mergeStrategy = parentProfile.orchestration?.mergeStrategy ?? "concat";
  const summaryProfileId = parentProfile.orchestration?.summaryProfileId;

  // ---- FAN-OUT: run all children concurrently ----
  const promises = children.map(async (child) => {
    const childProfile = await resolveProfile(child.profileId);

    // Parallel pipelines do not use previous output chaining
    const childInput = input;

    // Important: runPipeline recursion (sequential/parallel/single)
    const res = await run(childProfile, childInput, resolveProfile);

    return {
      profileId: child.profileId,
      final: res.final,
      trace: res.trace
    };
  });

  const results = await Promise.all(promises);

  // ---- FAN-IN: collect output values ----
  const outputs = results.map((r) => r.final);

  // ---- MERGE: apply mergeStrategy ----
  let merged: string;

  switch (mergeStrategy) {
    case "concat":
      merged = outputs.join("\n");
      break;

    case "json-merge": {
      const mergedObj: Record<string, unknown> = {};
      for (const raw of outputs) {
        try {
          const obj = JSON.parse(raw);
          Object.assign(mergedObj, obj);
        } catch {
          throw new Error(
            `json-merge failed: child output is not valid JSON: "${raw}"`
          );
        }
      }
      merged = JSON.stringify(mergedObj);
      break;
    }

    case "summary": {
      if (!summaryProfileId) {
        throw new Error(
          `mergeStrategy "summary" requires summaryProfileId on the parent`
        );
      }

      const summaryProfile = await resolveProfile(summaryProfileId);
      const summaryInput = outputs.join("\n");

      const summaryResult = await run(
        summaryProfile,
        summaryInput,
        resolveProfile
      );

      // Add summary trace
      trace.push(
        ...summaryResult.trace.map((t, i) => ({
          ...t,
          index: trace.length + i
        }))
      );

      merged = summaryResult.final;
      break;
    }

    default:
      throw new Error(
        `Unknown mergeStrategy "${mergeStrategy}" in parallel pipeline`
      );
  }

  // ---- TRACE MERGE ----
  for (const r of results) {
    trace.push(
      ...r.trace.map((t, i) => ({
        ...t,
        index: trace.length + i
      }))
    );
  }

  return {
    final: merged,
    trace
  };
}
