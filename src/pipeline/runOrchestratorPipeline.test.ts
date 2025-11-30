// FILE: src/pipeline/runOrchestratorPipeline.test.ts
import { describe, it, expect } from "vitest";
import { runOrchestratorPipeline } from "./runOrchestratorPipeline.js";
import { loadProfile } from "../config/profileLoader.js";
import type { OrchestratorProfileValidated } from "../config/profileSchema.js";

describe("runOrchestratorPipeline (single pipeline smoke test)", () => {
  it("should return ok, provider, domain, input, and summary", async () => {
    // Load a real orchestrator profile
    const profile = await loadProfile("default") as OrchestratorProfileValidated;

    // Call the pipeline according to the *actual* signature:
    // runOrchestratorPipeline(input, profile)
    const result = await runOrchestratorPipeline(
      "hello world",
      profile
    );

    // Basic shape validation
    expect(result.ok).toBe(true);
    expect(result.provider).toBe(profile.title);
    expect(result.domain).toBe(profile.id);
    expect(result.input).toBe("hello world");

    // summary is produced by analyzeDomain(...)
    expect(result.summary).toBeDefined();
    expect(typeof result.summary).toBe("string");
  });
});
