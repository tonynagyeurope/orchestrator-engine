import type { OrchestratorProfile } from "./baseConfig.js";

/**
 * Converts a generic JSON config object into a valid OrchestratorProfile.
 * Missing required fields are filled with safe defaults.
 */
export function toOrchestratorProfile(
  json: Record<string, unknown>
): OrchestratorProfile {

  return {
    id: String(json.id ?? "custom-profile"),

    displayName: String(json.displayName ?? "Custom Profile"),

    domainFocus: String(json.domainFocus ?? "general"),

    systemPrompt: String(json.systemPrompt ?? ""),

    uiLabels: normalizeUiLabels(json.uiLabels),

    ...json
  };
}

/**
 * Ensures uiLabels is a Record<string,string>.
 * Accepts:
 *  - missing → returns default
 *  - string → wraps as { default: string }
 *  - object → casts safely
 */
function normalizeUiLabels(value: unknown): Record<string, string> {
  if (!value) {
    return { default: "Profile" };
  }

  if (typeof value === "string") {
    return { default: value };
  }

  if (typeof value === "object") {
    const record: Record<string, string> = {};
    for (const [k, v] of Object.entries(value)) {
      record[k] = String(v);
    }
    return record;
  }

  return { default: "Profile" };
}
