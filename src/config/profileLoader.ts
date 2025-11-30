// FILE: src/config/profileLoader.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { orchestratorProfileSchema } from "./profileSchema.js";

/**
 * Locate the project root by walking upward until package.json is found.
 * This guarantees correct behavior in local dev, dist builds, and CI.
 */
function findProjectRoot(start: string): string {
  let current = start;

  while (true) {
    const pkg = path.join(current, "package.json");
    if (fs.existsSync(pkg)) {
      return current;
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Could not find project root — package.json missing.");
    }

    current = parent;
  }
}

const thisFile = fileURLToPath(import.meta.url);
const thisDir = path.dirname(thisFile);

// The true project root (where package.json lives)
const projectRoot = findProjectRoot(thisDir);

// Primary: dist/profiles (after build)
const distProfilesDir = path.join(projectRoot, "dist", "profiles");

// Fallback: repo/profiles (source mode)
const repoProfilesDir = path.join(projectRoot, "profiles");

// Choose correct directory dynamically
const profilesDir = fs.existsSync(distProfilesDir)
  ? distProfilesDir
  : repoProfilesDir;

/**
 * Load and validate a profile by ID.
 */
export async function loadProfile(profileId: string) {
  const filePath = path.join(profilesDir, `${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Profile not found: ${profileId} at ${filePath}`
    );
  }

  const raw = await fs.promises.readFile(filePath, "utf8");
  const json = JSON.parse(raw);

  return orchestratorProfileSchema.parse(json);
}
