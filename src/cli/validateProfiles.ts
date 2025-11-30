import fs from "fs";
import path from "path";
import kleur from "kleur";

import { loadProfile } from "../config/profileLoader.js";
import { orchestratorProfileSchema } from "../config/profileSchema.js";

/**
 * Validate all JSON profiles inside profiles/
 * Prints full Zod validation errors.
 */
export async function validateProfiles(): Promise<number> {
  const profilesDir = path.join(process.cwd(), "profiles");

  if (!fs.existsSync(profilesDir)) {
    console.error(kleur.red(`Profiles directory not found: ${profilesDir}`));
    return 1;
  }

  const files = fs.readdirSync(profilesDir).filter((f) => f.endsWith(".json"));
  console.log(kleur.cyan(`[OE] Validating ${files.length} profiles…`));

  let errors = 0;

  for (const file of files) {
    const filePath = path.join(profilesDir, file);
    const profileId = file.replace(".json", "");

    process.stdout.write(` • ${profileId} … `);

    try {
      // 1) Parse raw JSON
      const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // 2) Zod validate
      const parsed = orchestratorProfileSchema.safeParse(raw);

      if (!parsed.success) {
        errors++;
        console.log(kleur.red("INVALID"));
        console.log(kleur.yellow(`  Zod errors in ${filePath}:`));

        parsed.error.issues.forEach((issue) => {
          console.log(`   - ${issue.path.join(".")}: ${issue.message}`);
        });

        continue;
      }

      // 3) Validate loader (resolves dist/profiles/, merges, etc.)
      await loadProfile(profileId);

      console.log(kleur.green("OK"));
    } catch (err) {
      errors++;
      console.log(kleur.red("INVALID"));

      if (err instanceof Error) {
        console.log(kleur.yellow(`  Loader error in ${filePath}:`));
        console.log(`   - ${err.message}`);
      }
    }
  }

  if (errors > 0) {
    console.log(kleur.red(`\n[OE] ${errors} invalid profile(s) found ✗`));
  } else {
    console.log(kleur.green(`\n[OE] All profiles valid ✓`));
  }

  return errors;
}
