import { openaiReasoningProvider } from "../src/reasoning/openaiReasoningProvider.js";
import { bedrockReasoningProvider } from "../src/reasoning/bedrockReasoningProvider.js";
import { toOrchestratorProfile } from "../src/config/profileAdapter.js";
import type { TraceStep } from "../src/utils/traceFormatter.js";
import type { OrchestratorProfile } from "../src/config/baseConfig.js";

function normalizeSteps(steps: unknown): string[] {
  if (!steps) return [];

  if (Array.isArray(steps)) {
    return steps.map((entry) => {
      if (typeof entry === "string") return entry;
      if (typeof entry === "object" && entry && "text" in entry) {
        return String((entry as any).text);
      }
      return String(entry);
    });
  }

  return [];
}

export async function runReasoningPipeline(
  provider: string,
  input: string,
  profile: string | Record<string, unknown>
): Promise<{ trace: TraceStep[]; decision: unknown }> {

  // Convert to OrchestratorProfile or keep string
  const orkProfile: string | OrchestratorProfile =
    typeof profile === "string"
      ? profile
      : toOrchestratorProfile(profile);

  let result: {
    summary: string;
    steps: unknown;
    meta?: Record<string, unknown>;
  } | null = null;

  // Run provider
  if (provider === "openai") {
    result = await openaiReasoningProvider.analyze(input, orkProfile);
  } else if (provider === "bedrock") {
    result = await bedrockReasoningProvider.analyze(input, orkProfile);
  }

  // Safety check: unknown provider
  if (!result) {
    throw new Error(`Unknown provider '${provider}' in runReasoningPipeline()`);
  }

  // Normalize steps into string[]
  const stepTexts = normalizeSteps(result.steps);

  // Convert to full TraceStep[]
  const trace: TraceStep[] = stepTexts.map((text, idx) => ({
    index: idx,
    text,
    timestamp: new Date().toISOString(),
     meta: {}
  }));

  // Convert summary → decision
  const decision = {
    final: result.summary,
    meta: result.meta ?? {}
  };

  return { trace, decision };
}
