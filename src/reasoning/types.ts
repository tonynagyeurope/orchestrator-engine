// FILE: src/reasoning/types.ts

/**
 * One atomic reasoning step inside the OE trace.
 * Providers append steps to give transparency on how the reasoning evolved.
 */
export interface TraceStep {
  index: number;                // global trace index
  timestamp: string;            // ISO timestamp
  message: string;              // human-readable description

  // Stage-2 additions:
  step?: number;                // multi-step iteration index
  source?: "provider" | "pipeline" | "stop-rule";
  event?: string;               // stop:stabilized, stop:timeout, etc.

  // Optional metadata payload for advanced cases.
  meta?: Record<string, unknown>;  
}

/**
 * The unified result returned by **every** reasoning provider.
 *
 * - final  → The final output string produced by the model.
 * - trace  → The complete chain of reasoning steps.
 * - meta   → Provider-specific metadata (model, token usage, etc.)
 */
export interface ReasoningResult {
  final: string;
  trace: TraceStep[];
  meta?: Record<string, unknown>;
}

/**
 * All reasoning providers must implement this unified interface.
 * This makes the OE fully provider-agnostic.
 */
export interface ReasoningProvider {
  /** Unique provider ID (e.g. "openai", "bedrock") */
  id: string;

  /**
   * Execute a single reasoning cycle.
   * The Orchestrator Engine may call this 1..N times
   * depending on the multi-step loop configuration.
   */
  run(
    prompt: string,
    profile: import("../config/baseConfig.js").OrchestratorProfile
  ): Promise<ReasoningResult>;
}
