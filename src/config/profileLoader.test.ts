// FILE: src/config/profileLoader.test.ts
import { describe, it, expect } from "vitest";
import { loadProfile } from "./profileLoader.js";
import type { OrchestratorProfileValidated } from "./profileSchema.js";

describe("profileLoader", () => {
  it("should load all 3 valid profiles", async () => {
    const profileNames = [
      "default",
      "aws-cli-generator",
      "aws-cost-optimizer"
    ];

    for (const name of profileNames) {
      const profile = await loadProfile(name);
      const typed = profile as OrchestratorProfileValidated;

      expect(typed).toBeDefined();
      expect(typed.id).toBe(name);
    }
  });

  it("should throw Zod validation error for invalid profile", async () => {
    await expect(loadProfile("nonexistent-profile")).rejects.toThrow();
  });
});
