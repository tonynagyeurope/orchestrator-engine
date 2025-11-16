import { describe, it, expect } from "vitest";
import { analyzeAi } from "./analyzeAi.js";
import { defaultProfiles } from "../config/baseConfig.js";

describe("analyzeAi", () => {
  it("returns simulated reasoning steps", async () => {
    const profile = defaultProfiles["ai"];
    const input = { text: "Optimize an AI workload for latency" };
    const result = await analyzeAi(input, profile);

    expect(result.summary.toLowerCase()).toContain("simulated reasoning");
    expect(result.steps.length).toBeGreaterThan(2);
    expect(result.meta!.profileId).toBe("ai");
  });
});
