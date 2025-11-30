/**
 * Copies the profiles/ directory into dist/profiles during build.
 * Ensures that production builds can load profiles without relying on src paths.
 */

import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const srcDir = path.join(root, "profiles");
const destDir = path.join(root, "dist", "profiles");

if (!fs.existsSync(srcDir)) {
  console.error("profiles directory does not exist:", srcDir);
  process.exit(1);
}

fs.rmSync(destDir, { recursive: true, force: true });
fs.mkdirSync(destDir, { recursive: true });

for (const file of fs.readdirSync(srcDir)) {
  const from = path.join(srcDir, file);
  const to = path.join(destDir, file);
  fs.copyFileSync(from, to);
}

console.log("[copy-profiles] profiles copied to dist/profiles");
