import { describe, it, expect, vi, beforeEach } from "vitest";
import { openaiReasoningProvider } from "./openaiReasoningProvider.js";
import { defaultProfiles } from "../config/baseConfig.js";

describe("openaiReasoningProvider", () => {
  const profile = defaultProfiles["ai"];

  beforeEach(() => {
    vi.restoreAllMocks();
    delete process.env.OPENAI_API_KEY;
  });

  it("falls back to mock reasoning when API key is missing", async () => {
    const result = await openaiReasoningProvider.analyze("test reasoning", profile);

    expect(result.summary).toContain("[mock]");
    expect(result.meta?.provider).toBe("mock-fallback");
    expect(result.meta?.profileId).toBe(profile.id);
  });

  it("calls OpenAI API when API key is set", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Reasoning result from fake OpenAI API" } }]
      })
    };

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue(mockResponse as any);

    const result = await openaiReasoningProvider.analyze("real reasoning", profile);

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.summary).toContain("Reasoning result from fake OpenAI API");
    expect(result.meta?.provider).toBe("openai");
    expect(result.meta?.model).toBeDefined();
  });

  it("throws a clear error when API responds with failure", async () => {
    process.env.OPENAI_API_KEY = "test-key";

    const mockResponse = {
      ok: false,
      status: 400,
      text: async () => "Bad Request"
    };

    global.fetch = vi.fn().mockResolvedValue(mockResponse as any);

    await expect(openaiReasoningProvider.analyze("fail test", profile))
      .rejects.toThrow(/OpenAI API request failed/);
  });
});
