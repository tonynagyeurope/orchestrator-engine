import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";

import { runParallelPipeline } from "../runParallelPipeline.js";
import { runPipeline } from "../runPipeline.js";

import type { OrchestratorProfile } from "../../config/baseConfig.js";
import type { TraceStep } from "../../reasoning/types.js";

// --------------------------------------------------
// Mock root orchestrator
// --------------------------------------------------
vi.mock("../runPipeline.js", () => ({
  runPipeline: vi.fn()
}));

beforeEach(() => {
  vi.clearAllMocks();
});

// --------------------------------------------------
// Profiles
// --------------------------------------------------
const profiles: Record<string, OrchestratorProfile> = {
  parent_concat: {
    id: "parent_concat",
    title: "Parent",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "parallel",
      mergeStrategy: "concat",
      children: [
        { profileId: "p1", inputStrategy: "same" },
        { profileId: "p2", inputStrategy: "same" }
      ]
    }
  },

  parent_json: {
    id: "parent_json",
    title: "Parent JSON",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "parallel",
      mergeStrategy: "json-merge",
      children: [
        { profileId: "json1", inputStrategy: "same" },
        { profileId: "json2", inputStrategy: "same" }
      ]
    }
  },

  parent_summary: {
    id: "parent_summary",
    title: "Parent Summary",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["x"],
    orchestration: {
      mode: "parallel",
      mergeStrategy: "summary",
      summaryProfileId: "summary",
      children: [
        { profileId: "p1", inputStrategy: "same" },
        { profileId: "p2", inputStrategy: "same" }
      ]
    }
  },

  p1: {
    id: "p1",
    title: "Child P1",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["p1"]
  },

  p2: {
    id: "p2",
    title: "Child P2",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["p2"]
  },

  json1: {
    id: "json1",
    title: "JSON 1",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["j1"]
  },

  json2: {
    id: "json2",
    title: "JSON 2",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["j2"]
  },

  summary: {
    id: "summary",
    title: "Summary",
    model: "mock",
    temperature: 0,
    maxSteps: 1,
    prompt: ["summary"]
  }
};

function resolveProfile(id: string) {
  const p = profiles[id];
  if (!p) throw new Error(`Unknown profile: ${id}`);
  return Promise.resolve(p);
}

// --------------------------------------------------
// TEST SUITE
// --------------------------------------------------
describe("Parallel Pipeline (Stage-2)", () => {
  it("should merge child outputs using concat strategy", async () => {
    (runPipeline as Mock).mockImplementation(
      async (
        profile: OrchestratorProfile,
        input: string
      ): Promise<{ final: string; trace: TraceStep[] }> => {
        return {
          final: `[${profile.id}] -> ${input}`,
          trace: []
        };
      }
    );

    const res = await runParallelPipeline(
      profiles.parent_concat,
      "ROOT",
      resolveProfile,
      runPipeline
    );

    expect(res.final.includes("[p1] -> ROOT")).toBe(true);
    expect(res.final.includes("[p2] -> ROOT")).toBe(true);
  });

  it("should merge using json-merge strategy", async () => {
    (runPipeline as Mock).mockImplementationOnce(
      async (): Promise<{ final: string; trace: TraceStep[] }> => ({
        final: JSON.stringify({ foo: 1 }),
        trace: []
      })
    );

    (runPipeline as Mock).mockImplementationOnce(
      async (): Promise<{ final: string; trace: TraceStep[] }> => ({
        final: JSON.stringify({ bar: 2 }),
        trace: []
      })
    );

    const res = await runParallelPipeline(
      profiles.parent_json,
      "ROOT",
      resolveProfile,
      runPipeline
    );

    expect(res.final).toBe(JSON.stringify({ foo: 1, bar: 2 }));
  });

  it("should execute summary profile when mergeStrategy = summary", async () => {
    (runPipeline as Mock).mockImplementationOnce(
      async (): Promise<{ final: string; trace: TraceStep[] }> => ({
        final: "X1",
        trace: []
      })
    );

    (runPipeline as Mock).mockImplementationOnce(
      async (): Promise<{ final: string; trace: TraceStep[] }> => ({
        final: "X2",
        trace: []
      })
    );

    (runPipeline as Mock).mockImplementationOnce(
      async (
        _profile: OrchestratorProfile,
        input: string
      ): Promise<{ final: string; trace: TraceStep[] }> => ({
        final: `[summary] -> ${input}`,
        trace: []
      })
    );

    const res = await runParallelPipeline(
      profiles.parent_summary,
      "ROOT",
      resolveProfile,
      runPipeline
    );

    expect(res.final).toContain("[summary] ->");
    expect(res.final).toContain("X1");
    expect(res.final).toContain("X2");
  });
});
