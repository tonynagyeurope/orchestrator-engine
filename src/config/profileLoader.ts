import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { orchestratorProfileSchema } from "./profileSchema.js";

/**
 * Resolve dist/profiles at runtime.
 * ESM + tsc build → dist/config/ is the current folder.
 *
 * Root:
 *   profiles/*.json         ← source
 * Build:
 *   dist/profiles/*.json    ← runtime
 */
function resolveProfilesDir(): string {
  // dist/src/config → two levels up → dist
  const dir = path.dirname(fileURLToPath(import.meta.url));
  const distRoot = path.join(dir, "..", "..");
  const profilesDir = path.join(distRoot, "profiles");

  return profilesDir;
}

export async function loadProfile(profileId: string) {
  const profilesDir = await resolveProfilesDir();
  const filePath = path.join(profilesDir, `${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile not found: ${profileId} at ${filePath}`);
  }

  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const parsed = orchestratorProfileSchema.parse(raw);

  return parsed;
}
