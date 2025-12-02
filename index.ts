// FILE: index.ts (root)

// Stage-3 public API
export { runOrchestratorPipeline } from "./src/pipeline/runOrchestratorPipeline.js";
export { runReasoningPipeline } from "./src/pipeline/runReasoningPipeline.js";

// Lower-level primitives (optional but ok to keep)
export { runPipeline } from "./src/pipeline/runPipeline.js";
export { getProvider } from "./src/reasoning/providerFactory.js";
export { loadProfile } from "./src/config/profileLoader.js";

// Types
export type { TraceStep } from "./src/reasoning/types.js";
export type { OrchestratorProfile } from "./src/config/baseConfig.js";
export type { ReasoningProvider } from "./src/reasoning/reasoningProvider.js";
