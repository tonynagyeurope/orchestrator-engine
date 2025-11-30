// FILE: src/cli/validateProfiles.test.ts
import { describe, it, expect } from "vitest";
import { exec } from "node:child_process";
import path from "node:path";

function execPromise(cmd: string, cwd: string): Promise<{ stdout: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (err, stdout) => {
      if (err) reject(err);
      else resolve({ stdout });
    });
  });
}

describe("validate:profiles CLI", () => {
  it("should return OK for all profiles", async () => {
    const projectRoot = path.resolve(__dirname, "../../");

    const { stdout } = await execPromise(
      "npm run validate:profiles",
      projectRoot
    );

    // Accepts the REAL CLI output
    expect(stdout).toContain("[OE] All profiles valid");
  });
});
