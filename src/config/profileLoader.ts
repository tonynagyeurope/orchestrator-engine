import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { OrchestratorProfile } from "./baseConfig.js";

export async function resolveProfilesDir(): Promise<string> {
  // Current file (after build):
  // dist/src/config/profileLoader.js
  const currentDir = path.dirname(fileURLToPath(import.meta.url));

  // dist/src/config → dist/profiles
  const profilesPath = path.join(currentDir, "../../profiles");

  return profilesPath;
}


export async function loadProfile(profileId: string): Promise<OrchestratorProfile> {
  const profilesDir = await resolveProfilesDir();

  const filePath = path.join(profilesDir, `${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile not found: ${profileId} at ${filePath}`);
  }

  const json = fs.readFileSync(filePath, "utf8");
  return JSON.parse(json) as OrchestratorProfile;
}
