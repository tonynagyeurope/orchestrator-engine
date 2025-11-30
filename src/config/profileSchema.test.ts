// FILE: src/config/profileSchema.test.ts
import { describe, it, expect } from "vitest";
import { orchestratorProfileSchema } from "./profileSchema.js";
import type { OrchestratorProfileValidated } from "./profileSchema.js";

describe("orchestratorProfileSchema", () => {
  it("should validate a correct profile", () => {
    const validProfile = {
      id: "test-profile",
      title: "Test Profile",
      model: "gpt-4o-mini",
      temperature: 0,
      maxSteps: 1,
      prompt: ["You are a test profile."]
    };

    const result = orchestratorProfileSchema.parse(validProfile);
    const typed: OrchestratorProfileValidated = result;

    expect(typed.id).toBe("test-profile");
    expect(typed.title).toBe("Test Profile");
    expect(typed.prompt.length).toBe(1);
  });

  it("should reject an invalid profile", () => {
    const invalidProfile = {
      id: 123,                  // ❌ must be string
      title: "Invalid Profile",
      model: "gpt-invalid",
      prompt: "not-an-array"    // ❌ must be string[]
    };

    expect(() =>
      orchestratorProfileSchema.parse(invalidProfile)
    ).toThrow();
  });
});
