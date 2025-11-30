// FILE: src/pipeline/analyzeDomain.test.ts
import { describe, it, expect } from "vitest";
import { analyzeDomain } from "./analyzeDomain.js";
import type { OrchestratorProfileValidated } from "../config/profileSchema.js";

describe("analyzeDomain", () => {
  it("should generate a deterministic summary string", () => {
    const profile: OrchestratorProfileValidated = {
      id: "aws-cli-generator",
      title: "AWS CLI Generator",
      model: "gpt-4o-mini",
      temperature: 0,
      maxSteps: 1,
      prompt: ["Generate AWS CLI commands."]
    };

    const summary1 = analyzeDomain(profile);
    const summary2 = analyzeDomain(profile);

    expect(typeof summary1).toBe("string");
    expect(summary1.length).toBeGreaterThan(0);

    // Deterministic
    expect(summary1).toBe(summary2);

    // Should include title, since analyzeDomain uses profile.title
    expect(summary1).toContain("AWS CLI Generator");
  });
});
