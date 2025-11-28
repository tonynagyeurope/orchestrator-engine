import fs from "fs";
import path from "path";

const src = path.resolve("profiles");
const dest = path.resolve("dist", "profiles");

// Ensure source exists
if (!fs.existsSync(src)) {
  console.error("Profiles directory not found:", src);
  process.exit(1);
}

// Create dist/profiles folder
fs.mkdirSync(dest, { recursive: true });

// Copy all json files
for (const file of fs.readdirSync(src)) {
  const srcFile = path.join(src, file);
  const destFile = path.join(dest, file);

  if (file.endsWith(".json")) {
    fs.copyFileSync(srcFile, destFile);
    console.log("Copied:", file);
  }
}
