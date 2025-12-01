// FILE: src/pipeline/__tests__/summary.test.ts
import { describe, it, expect } from "vitest";
import { runSequentialPipeline } from "../runSequentialPipeline.js";
import type { OrchestratorProfile } from "../../config/baseConfig.js";
import type { TraceStep } from "../../reasoning/types.js";

// -----------------------
// Mock provider runner
// -----------------------
function mockRun(profile: OrchestratorProfile, input: string) {
  return Promise.resolve({
    final: `[${profile.id}] -> ${input}`,
    trace: [
      {
        index: 0,
        timestamp: new Date().toISOString(),
        source: "provider",
        message: `Executed profile ${profile.id} with input="${input}"`
      } satisfies TraceStep
    ]
  });
}

// -----------------------
// Mock profile registry
// -----------------------
const profiles: Record<string, OrchestratorProfile> = {
  parent_concat: {
    id: "parent_concat",
    title: "Parent",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "sequential",
      children: [
        { profileId: "child", inputStrategy: "same" }
      ],
      summaryProfileId: "summary",
      summaryStrategy: "concat"
    }
  },

  parent_json: {
    id: "parent_json",
    title: "Parent",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "sequential",
      children: [
        { profileId: "child_json", inputStrategy: "same" }
      ],
      summaryProfileId: "summary",
      summaryStrategy: "json-merge"
    }
  },

  parent_summary: {
    id: "parent_summary",
    title: "Parent",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "sequential",
      children: [
        { profileId: "child", inputStrategy: "same" }
      ],
      summaryProfileId: "summary",
      summaryStrategy: "summary"
    }
  },

  // Child profiles
  child: {
    id: "child",
    title: "Child",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["child"]
  },

  child_json: {
    id: "child_json",
    title: "ChildJson",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["json-child"]
  },

  // Summary profile
  summary: {
    id: "summary",
    title: "Summary",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["summary"]
  }
};

// Resolve helper
function resolveProfile(id: string) {
  const p = profiles[id];
  if (!p) throw new Error(`Unknown profile ${id}`);
  return Promise.resolve(p);
}

// -----------------------
// TEST SUITE
// -----------------------
describe("Sequential Summary Pipeline", () => {
  it("should run summary profile using concat strategy", async () => {
    const parent = profiles["parent_concat"];

    const res = await runSequentialPipeline(
      parent,
      "ROOT",
      resolveProfile,
      mockRun
    );

    // child output: "[child] -> ROOT"
    // summary receives: concat(["[child] -> ROOT"])
    // summary final: "[summary] -> [child] -> ROOT"
    expect(res.final).toBe("[summary] -> [child] -> ROOT");

    const providerMessages = res.trace
      .filter(t => t.source === "provider")
      .map(t => t.message);

    expect(providerMessages).toContain(
      `Executed profile summary with input="[child] -> ROOT"`
    );
  });

  it("should run summary profile using json-merge strategy", async () => {
    const parent = profiles["parent_json"];

    // child output will be: `[child_json] -> ROOT`
    // but json-merge expects JSON -> so we override mockRun input manually:
    const customRun = (
      profile: OrchestratorProfile,
      input: string
    ) => {
      // child_json returns JSON string
      if (profile.id === "child_json") {
        return Promise.resolve({
          final: JSON.stringify({ foo: 123 }),
          trace: []
        });
      }
      if (profile.id === "summary") {
        return Promise.resolve({
          final: `[summary] -> ${input}`,
          trace: []
        });
      }
      throw new Error("Unexpected profile");
    };

    const res = await runSequentialPipeline(
      parent,
      "ROOT",
      resolveProfile,
      customRun
    );

    // merged JSON of one child: { foo: 123 }
    expect(res.final).toBe("[summary] -> {\"foo\":123}");
  });

  it("should run summary profile using summary strategy (LLM aggregator)", async () => {
    const parent = profiles["parent_summary"];

    const res = await runSequentialPipeline(
      parent,
      "ROOT",
      resolveProfile,
      mockRun
    );

    // summaryStrategy = "summary" means → no merge, pass child output directly
    expect(res.final).toBe("[summary] -> [child] -> ROOT");
  });

  it("should throw on custom strategy (not implemented)", async () => {
    const parent: OrchestratorProfile = {
      id: "parent_custom",
      title: "X",
      model: "mock",
      temperature: 0,
      maxSteps: 1,
      prompt: ["x"],
      orchestration: {
        mode: "sequential",
        children: [{ profileId: "child", inputStrategy: "same" }],
        summaryProfileId: "summary",
        summaryStrategy: "custom"
      }
    };

    await expect(() =>
      runSequentialPipeline(parent, "ROOT", resolveProfile, mockRun)
    ).rejects.toThrow(/not implemented/i);
  });
});
