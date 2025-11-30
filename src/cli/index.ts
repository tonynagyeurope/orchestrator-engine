// FILE: src/cli/index.ts

import { validateProfiles } from "./validateProfiles.js";

const command = process.argv[2];

async function main() {
  switch (command) {
    case "validate-profiles": {
      const errors = await validateProfiles();
      process.exit(errors === 0 ? 0 : 1);
    }

    default:
      console.log(`
Orchestrator Engine CLI

Usage:
  oe validate-profiles     Validate all JSON profiles
`);
      process.exit(0);
  }
}

main();
