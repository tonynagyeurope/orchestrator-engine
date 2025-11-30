// FILE: src/e2e/pipeline.e2e.test.ts
import { describe, it, expect } from "vitest";
import { runOrchestratorPipeline } from "../pipeline/runOrchestratorPipeline.js";
import { loadProfile } from "../config/profileLoader.js";
import type { OrchestratorProfileValidated } from "../config/profileSchema.js";

describe("Orchestrator Engine – Core Pipeline E2E", () => {
  it("should run the core pipeline end-to-end using a real profile", async () => {
    const profile = await loadProfile("default") as OrchestratorProfileValidated;

    const result = await runOrchestratorPipeline(
      "hello world",
      profile
    );

    expect(result).toBeDefined();
    expect(typeof result.summary).toBe("string");
  });
});
