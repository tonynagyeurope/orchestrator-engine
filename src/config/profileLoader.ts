// FILE: src/config/profileLoader.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { orchestratorProfileSchema } from "./profileSchema.js";
import type { OrchestratorProfile } from "./baseConfig.js";
import { readdir, readFile } from "node:fs/promises";

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


/**
 * Load all profile JSON files from the /profiles directory.
 * Works in ESM + TypeScript + Node 20 (your project setup).
 */
export async function loadAllProfiles() {
  // Resolve absolute path to the /profiles directory
  const profilesDir = path.resolve(process.cwd(), "profiles");

  // Read all files in the directory
  const files = await readdir(profilesDir);

  // Filter JSON files
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const profiles: Record<string, unknown>[] = [];

  for (const file of jsonFiles) {
    const filePath = path.join(profilesDir, file);

    // Read file content as UTF-8 text
    const raw = await readFile(filePath, { encoding: "utf-8" });

    try {
      const parsed = JSON.parse(raw);
      profiles.push(parsed);
    } catch (err) {
      console.error(`Failed to parse JSON profile: ${filePath}`, err);
    }
  }

  return profiles;
}

