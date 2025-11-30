// FILE: src/config/profileLoader.ts
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { orchestratorProfileSchema } from "./profileSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load profiles always from root/profiles/, not from dist/
const profilesDir = join(__dirname, "../../profiles");

export async function loadProfile(profileId: string) {
  const filePath = join(profilesDir, `${profileId}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Profile not found: ${profileId} at ${filePath}`);
  }

  const raw = await fs.promises.readFile(filePath, "utf8");
  const json = JSON.parse(raw);

  return orchestratorProfileSchema.parse(json);
}
