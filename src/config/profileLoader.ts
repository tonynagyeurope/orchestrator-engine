// src/config/profileLoader.ts

import fs from "fs";
import path from "path";
import { OrchestratorProfile, defaultProfiles } from "./baseConfig.js";

/**
 * Profile Loader with Overlay & Cache
 * -----------------------------------
 * Loads orchestration profiles from multiple sources (public + private),
 * merges overrides, and caches results in-memory for performance.
 */

const cache = new Map<string, OrchestratorProfile>();

export function __clearProfileCache() {
  cache.clear();
}

function mergeProfiles(
  base: OrchestratorProfile,
  overlay: Partial<OrchestratorProfile>
): OrchestratorProfile {
  return {
    ...base,
    ...overlay,
    uiLabels: { ...base.uiLabels, ...overlay.uiLabels },
    exampleUseCases: overlay.exampleUseCases || base.exampleUseCases,
  };
}

export async function loadProfile(profileId: string): Promise<OrchestratorProfile> {
  // 1. Return from cache if available
  if (cache.has(profileId)) return cache.get(profileId)!;

  let privateOverlay: Partial<OrchestratorProfile> | undefined;

  // 2. Load from local JSON file
  const filePath = process.env.PRIVATE_PROFILE_PATH;
  if (filePath && fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(path.resolve(filePath), "utf8");
      const profiles = JSON.parse(raw) as Record<string, OrchestratorProfile>;
      if (profiles[profileId]) privateOverlay = profiles[profileId];
    } catch (err) {
      console.warn(`[OE] Failed to read private profile file: ${err}`);
    }
  }

  // 3. Load from remote JSON URL
  const remoteUrl = process.env.PRIVATE_PROFILE_URL;
  if (!privateOverlay && remoteUrl) {
    try {
      const res = await fetch(remoteUrl);
      if (res.ok) {
        const profiles = (await res.json()) as Record<string, OrchestratorProfile>;
        if (profiles[profileId]) privateOverlay = profiles[profileId];
      }
    } catch (err) {
      console.warn(`[OE] Failed to fetch private profile from ${remoteUrl}: ${err}`);
    }
  }

  // 4. Merge with default base profile
  const base = defaultProfiles[profileId] || defaultProfiles["ai"];
  const merged = privateOverlay ? mergeProfiles(base, privateOverlay) : base;

  // 5. Cache and return
  cache.set(profileId, merged); // Need to call !!!
  return merged;
}
