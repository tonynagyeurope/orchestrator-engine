// FILE: src/pipeline/__tests__/sequential.test.ts
import { describe, it, expect } from "vitest";
import { runSequentialPipeline } from "../runSequentialPipeline.js";
import type { OrchestratorProfile } from "../../config/baseConfig.js";
import { TraceStep } from "../../reasoning/types.js";

// --- Mock reasoning provider output ---
function mockRun(profile: OrchestratorProfile, input: string) {
  // Deterministic "reasoning" for testing.
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

// --- Mock profile registry ---
const profiles: Record<string, OrchestratorProfile> = {
  a: {
    id:"a", title:"A", model:"mock", temperature:0, maxSteps:1, prompt:["x"], 
    orchestration: {
      mode: "sequential",
      children: [
        {
          profileId: "b",
          inputStrategy: "same"
        },
        {
          profileId: "c",
          inputStrategy: "transform"
        }
      ]
    }
  },
  b: { id:"b", title:"B", model:"mock", temperature:0, maxSteps:1, prompt:["x"] },
  c: { id:"c", title:"C", model:"mock", temperature:0, maxSteps:1, prompt:["x"] }
};

function resolveProfile(id: string) {
  const p = profiles[id];
  if (!p) throw new Error(`Unknown profile ${id}`);
  return Promise.resolve(p);
}

describe("runSequentialPipeline()", () => {
  it("should run sequential children with correct input strategies", async () => {
    const parent = profiles["a"];
    const input = "ROOT";

    const result = await runSequentialPipeline(
      parent,
      input,
      resolveProfile,
      mockRun
    );

    // The expected final output:
    //
    // Child B: same       → input = "ROOT"
    // finalB = "[b] -> ROOT"
    //
    // Child C: transform  → input = finalB
    // finalC = "[c] -> [b] -> ROOT"
    //
    expect(result.final).toBe("[c] -> [b] -> ROOT");

    // Check trace ordering and content
    expect(result.trace.length).toBeGreaterThan(0);

    const providerMessages = result.trace
      .filter(t => t.source === "provider")
      .map(t => t.message);

    expect(providerMessages).toContain(
      `Executed profile b with input="ROOT"`
    );

    expect(providerMessages).toContain(
      `Executed profile c with input="[b] -> ROOT"`
    );
  });

  it("should apply template strategy correctly", async () => {
    // Override profile 'a' temporarily to include a template step
    const parent: OrchestratorProfile = {
    id: "a",
    title: "Mock A",
    model: "mock-model",
    temperature: 0,
    maxSteps: 1,
    prompt: ["test"],
    
      orchestration: {
        mode: "sequential",
        children: [
          {
            profileId: "b",
            inputStrategy: "template",
            inputTemplate: "Hello ${input}, prev=${previous}"
          }
        ]
      }
    };

    const result = await runSequentialPipeline(
      parent,
      "ROOT",
      resolveProfile,
      mockRun
    );

    expect(result.final).toBe(`[b] -> Hello ROOT, prev=ROOT`);
  });

  it("should throw if template strategy is used without template", async () => {
    const parent: OrchestratorProfile = {
      id: "a",
      title: "Mock A",
      model: "mock-model",
      temperature: 0,
      maxSteps: 1,
      prompt: ["test"],
      orchestration: {
        mode: "sequential",
        children: [
          {
            profileId: "b",
            inputStrategy: "template"
          }
        ]
      }
    };

    await expect(() =>
      runSequentialPipeline(parent, "ROOT", resolveProfile, mockRun)
    ).rejects.toThrow();
  });
});
