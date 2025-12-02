// FILE: src/e2e/pipeline.e2e.test.ts

import { describe, it, expect } from "vitest";
import { runOrchestratorPipeline } from "../pipeline/runOrchestratorPipeline.js";

describe("Orchestrator Engine – Core Pipeline E2E", () => {
  it("should run the core pipeline end-to-end using a real profile", async () => {
    const result = await runOrchestratorPipeline({
      provider: "test",
      input: "e2e test input",
      profileId: "default"
    });

    expect(typeof result.final).toBe("string");
    expect(result.trace.length).toBeGreaterThan(0);
    expect(result.profile).toBe("default");
  });
});
