// FILE: src/config/profileAdapter.ts
import { OrchestratorProfile } from "./baseConfig.js";

/**
 * Adapter to normalize raw JSON into a valid OrchestratorProfile.
 * Currently redundant because JSON is validated by Zod,
 * but kept for future extension (transform rules, migrations, etc.)
 */
export function toOrchestratorProfile(json: Record<string, unknown>): OrchestratorProfile {
  return {
    id: String(json.id),
    title: String(json.title),

    model: String(json.model),
    temperature: Number(json.temperature),
    maxSteps: Number(json.maxSteps),

    prompt: Array.isArray(json.prompt) ? json.prompt.map(String) : [],

    rules: Array.isArray(json.rules)
      ? json.rules.map(String)
      : undefined,

    style: json.style as OrchestratorProfile["style"] | undefined,

    examples: Array.isArray(json.examples)
      ? (json.examples as OrchestratorProfile["examples"])
      : undefined,

    orchestration: json.orchestration as OrchestratorProfile["orchestration"] | undefined
  };
}
