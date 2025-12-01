// FILE: src/config/profileLoader.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { orchestratorProfileSchema } from "./profileSchema.js";
import type { OrchestratorProfile } from "./baseConfig.js";

/**
 * Find the true project root by walking upward until package.json is found.
 * Works identically in src/, dist/, CI, Docker, Lambda, Vitest.
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
      throw new Error("Could not locate project root (package.json not found).");
    }

    current = parent;
  }
}

const thisFile = fileURLToPath(import.meta.url);
const thisDir = path.dirname(thisFile);

// True project root (repo root), regardless of src/dist/tests
const projectRoot = findProjectRoot(thisDir);

// Two possible profile locations
const repoProfilesDir = path.join(projectRoot, "profiles");
const distProfilesDir = path.join(projectRoot, "dist", "profiles");

const isTest =
  process.env.NODE_ENV === "test" ||
  process.env.VITEST_WORKER_ID !== undefined;

const profilesDir = isTest
  ? repoProfilesDir
  : fs.existsSync(distProfilesDir)
      ? distProfilesDir
      : repoProfilesDir;

/**
 * Load and validate a profile JSON file by ID.
 */
export async function loadProfile(profileId: string): Promise<OrchestratorProfile> {
  const filePath = path.join(profilesDir, `${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile not found: ${profileId} at ${filePath}`);
  }

  const raw = await fs.promises.readFile(filePath, "utf8");
  const json = JSON.parse(raw);

  return orchestratorProfileSchema.parse(json);
}
