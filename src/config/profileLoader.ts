// src/config/profileLoader.ts

import fs from "fs";
import path from "path";
import { OrchestratorProfile, defaultProfiles } from "./baseConfig.js";

/**
 * profileLoader.ts
 * -----------------
 * Unified loader for both public (default) and private (external) profiles.
 * Private profiles can be loaded from:
 *  - Environment variable `PRIVATE_PROFILE_PATH` (local JSON file)
 *  - Environment variable `PRIVATE_PROFILE_URL`  (remote JSON via fetch)
 */

export async function loadProfile(profileId: string): Promise<OrchestratorProfile> {
  // 1️Try external JSON file if provided via env
  const filePath = process.env.PRIVATE_PROFILE_PATH;
  if (filePath && fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(path.resolve(filePath), "utf8");
      const profiles = JSON.parse(raw) as Record<string, OrchestratorProfile>;
      if (profiles[profileId]) return profiles[profileId];
    } catch (err) {
      console.warn(`[OE] Failed to read private profile file: ${err}`);
    }
  }

  // 2️Try remote URL (for example, from S3 or private repo)
  const remoteUrl = process.env.PRIVATE_PROFILE_URL;
  if (remoteUrl) {
    try {
      const res = await fetch(remoteUrl);
      if (res.ok) {
        const profiles = (await res.json()) as Record<string, OrchestratorProfile>;
        if (profiles[profileId]) return profiles[profileId];
      }
    } catch (err) {
      console.warn(`[OE] Failed to fetch private profile from ${remoteUrl}: ${err}`);
    }
  }

  // Fallback to default profiles (OSS layer)
  return defaultProfiles[profileId] || defaultProfiles["ai"];
}
