// backend/src/config/baseConfig.ts

/**
 * Core configuration model for the Orchestrator Engine (OE)
 * ---------------------------------------------------------
 * This defines the structure of all orchestration profiles.
 * Public (OSS) and private (external) profiles must both follow this schema.
 */

export interface OrchestratorProfile {
  id: string;                     // Unique identifier (e.g. "ai", "cloud")
  displayName: string;            // Human-readable name
  domainFocus: string;            // Short description of what domain this profile targets
  systemPrompt: string;           // Core prompt applied to AI reasoning steps
  exampleUseCases?: string[];     // Optional examples for UI
  uiLabels?: Record<string, string>; // Optional UI label overrides (i18n-ready)
  version?: string;               // Optional semantic version
}

/**
 * Default public profiles available in OSS.
 * These can be overridden or extended by private configs at runtime.
 */
export const defaultProfiles: Record<string, OrchestratorProfile> = {
  ai: {
    id: "ai",
    displayName: "AI Orchestration",
    domainFocus: "General-purpose orchestration and reasoning pipeline",
    systemPrompt: "You are an AI orchestration engine analyzing multi-step reasoning flows.",
    exampleUseCases: [
      "Summarize an AI pipeline",
      "Identify performance bottlenecks",
      "Recommend reasoning optimizations"
    ]
  },
  cloud: {
    id: "cloud",
    displayName: "Cloud Intelligence",
    domainFocus: "Generic cloud automation and optimization project",
    systemPrompt: "You are a cloud consultant analyzing cost and performance tradeoffs.",
    exampleUseCases: [
      "Detect idle resources",
      "Recommend architecture improvements",
      "Summarize scaling patterns"
    ]
  }
};

/**
 * Utility to fetch a profile by id, falling back to default.
 */
export function getProfileById(id: string): OrchestratorProfile {
  return defaultProfiles[id] || defaultProfiles["ai"];
}
