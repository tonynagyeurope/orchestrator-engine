// FILE: src/pipeline/runSequentialPipeline.ts
import { OrchestratorProfile } from "../config/baseConfig.js";
import { TraceStep } from "../reasoning/types.js";
import { applyTemplate } from "../utils/templateEngine.js";
import { runPipeline } from "./runPipeline.js";
import { concatMerge, jsonMerge } from "./summary/mergeStrategies.js";

/**
 * Executes a SEQUENTIAL orchestration.
 * Runs children one-by-one, then an optional summary pipeline.
 */
export async function runSequentialPipeline(
  parentProfile: OrchestratorProfile,
  rawInput: string,
  resolveProfile: (id: string) => Promise<OrchestratorProfile>,
  run: typeof runPipeline
): Promise<{ final: string; trace: TraceStep[]; meta?: Record<string, unknown> }> {

  const trace: TraceStep[] = [];
  let lastOutput = rawInput;

  const children = parentProfile.orchestration?.children ?? [];

  // ---- Sequential Children Execution ----
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childProfile = await resolveProfile(child.profileId);

    // Determine input for this child
    let childInput: string;

    switch (child.inputStrategy) {
      case "same":
        childInput = rawInput;
        break;
      case "transform":
        childInput = lastOutput; 
        break;
      case "template":
        if (!child.inputTemplate) {
          throw new Error(
            `Child "${child.profileId}" uses template strategy but has no inputTemplate`
          );
        }
        childInput = applyTemplate(child.inputTemplate, {
          input: rawInput,
          previous: lastOutput
        });
        break;
      default:
        childInput = rawInput;
    }

    // Execute the child
    let result;
    try {
      result = await run(childProfile, childInput, resolveProfile);
    } catch (err) {
      trace.push({
        index: trace.length,
        timestamp: new Date().toISOString(),
        source: "pipeline",
        message: `Sequential pipeline stopped: child #${i + 1} (${child.profileId}) threw an error`,
        meta: { error: String(err) }
      });
      throw err;
    }

    // Log the sequential completion
    trace.push({
      index: trace.length,
      timestamp: new Date().toISOString(),
      source: "pipeline",
      message: `Sequential child #${i + 1} completed`,
      meta: { profileId: child.profileId }
    });

    // Merge child trace
    for (const t of result.trace) {
      trace.push({
        ...t,
        index: trace.length
      });
    }

    // Update output for next child
    lastOutput = result.final;
  }

  // ---- Summary Pipeline Execution (UNIT 8.5 + 8.8) ----
  const summaryId = parentProfile.orchestration?.summaryProfileId;
  if (summaryId) {
    const summaryProfile = await resolveProfile(summaryId);

    const strategy = parentProfile.orchestration?.summaryStrategy ?? "summary";

    trace.push({
      index: trace.length,
      timestamp: new Date().toISOString(),
      source: "pipeline",
      message: `Starting summary pipeline "${summaryId}" with strategy "${strategy}"`
    });

    let mergedInput: string;

    switch (strategy) {
      case "concat": {
        mergedInput = concatMerge([lastOutput]);
        break;
      }

      case "json-merge": {
        mergedInput = jsonMerge([lastOutput]);
        break;
      }

      case "summary": {
        // just pass through lastOutput → summary profile will summarize it via LLM
        mergedInput = lastOutput;
        break;
      }

      case "custom": {
        throw new Error(`Custom summary strategy not implemented yet`);
      }

      default:
        throw new Error(`Unknown summary strategy "${strategy}"`);
    }

    const summaryResult = await run(summaryProfile, mergedInput, resolveProfile);

    // merge summary trace
    for (const t of summaryResult.trace) {
      trace.push({ ...t, index: trace.length });
    }

    return {
      final: summaryResult.final,
      trace
    };
  }

  // ---- No summary → normal sequential final ----
  return {
    final: lastOutput,
    trace
  };
}
