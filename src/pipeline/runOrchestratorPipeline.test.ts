// FILE: src/pipeline/runOrchestratorPipeline.test.ts

import { describe, it, expect } from "vitest";
import { runOrchestratorPipeline } from "./runOrchestratorPipeline.js";

describe("runOrchestratorPipeline (Stage-3 smoke test)", () => {
  it("should run a single pipeline and return final, trace, summary", async () => {
    const result = await runOrchestratorPipeline({
      provider: "test",   // mock no longer exists in Stage-3
      input: "hello world",
      profileId: "default"
    });

    // provider
    expect(result.provider).toBe("test");
    expect(result.profile).toBe("default");

    // final
    expect(typeof result.final).toBe("string");

    // trace
    expect(Array.isArray(result.trace)).toBe(true);
    expect(result.trace.length).toBeGreaterThan(0);
    expect(typeof result.trace[0].message).toBe("string");

    // summary
    expect(typeof result.summary).toBe("string");
    expect(result.summary.length).toBeGreaterThan(0);

    // steps
    expect(Array.isArray(result.steps)).toBe(true);
    expect(result.steps.length).toBe(result.trace.length);
  });
});
