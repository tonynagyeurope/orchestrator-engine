import { describe, it, expect, beforeAll } from "vitest";
import { mockReasoningProvider } from "./mockReasoningProvider.js";
import { getReasoningProvider } from "./reasoningProvider.js";
import { defaultProfiles } from "../config/baseConfig.js";

describe("mockReasoningProvider", () => {
  let profile = defaultProfiles["ai"];

  it("produces reasoning steps and summary", async () => {
    const result = await mockReasoningProvider.analyze("Test AI reasoning pipeline", profile);

    expect(result.summary).toContain("Simulated reasoning");
    expect(result.steps.length).toBeGreaterThan(2);
    expect(result.meta?.provider).toBe("mock");
    expect(result.meta?.profileId).toBe(profile.id);
  });
});

describe("getReasoningProvider factory", () => {
  beforeAll(() => {
    process.env.OE_REASONING_MODE = "mock";
  });

  it("returns a valid provider instance with analyze() method", async () => {
    const provider = await getReasoningProvider();
    expect(provider).toHaveProperty("analyze");
    const result = await provider.analyze("Simple reasoning task", defaultProfiles["cloud"]);
    expect(result.summary).toMatch(/Simulated reasoning completed/);
  });

  it("throws for unsupported provider modes", async () => {
    process.env.OE_REASONING_MODE = "invalid";
    await expect(getReasoningProvider()).rejects.toThrow(/Unsupported reasoning provider/);
  });
});
