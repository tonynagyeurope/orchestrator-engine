import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { orchestratorProfileSchema } from "./profileSchema.js";

/**
 * Resolve project root dynamically by searching upward until package.json is found.
 */
function findProjectRoot(startDir: string): string {
  let current = startDir;

  while (true) {
    const pkgPath = path.join(current, "package.json");
    if (fs.existsSync(pkgPath)) {
      return current; // Found project root
    }

    const parent = path.dirname(current);
    if (parent === current) {
      throw new Error("Could not locate project root.");
    }

    current = parent;
  }
}

const thisFile = fileURLToPath(import.meta.url);
const thisDir = path.dirname(thisFile);

const projectRoot = findProjectRoot(thisDir);
const profilesDir = path.join(projectRoot, "profiles");

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
