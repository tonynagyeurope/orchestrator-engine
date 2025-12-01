// FILE: index.ts (root of project)

export { runPipeline } from "./src/pipeline/runPipeline.js";
export { getProvider } from "./src/reasoning/providerFactory.js";
export { loadProfile } from "./src/config/profileLoader.js";

// re-export types
export type { ReasoningProvider } from "./src/reasoning/reasoningProvider.js";
export type { OrchestratorProfile } from "./src/config/baseConfig.js";
