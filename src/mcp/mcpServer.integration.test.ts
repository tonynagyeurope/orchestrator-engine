import { describe, it, expect, vi } from "vitest";
import { handleRpcRequest } from "./rpcHandler.js";
import * as pipeline from "../pipeline/runOrchestratorPipeline.js";

// --- Mock the actual pipeline call ---
vi.spyOn(pipeline, "runOrchestratorPipeline").mockResolvedValue({
  summary: "Mocked summary of Orchestrator Engine purpose.",
  steps: ["step1", "step2"],
  provider: "MockProvider",
  domain: "test"
});

describe("MCP tools.call → Orchestrator Engine integration", () => {
  it("should execute the Orchestrator pipeline and return structured JSON-RPC response", async () => {
    const mockRequest = {
      jsonrpc: "2.0" as const, 
      method: "tools.call",
      params: { input: "Summarize the Orchestrator Engine." },
      id: 42
    };

    const response = await handleRpcRequest(mockRequest);

    // Check JSON-RPC structure
    expect(response.jsonrpc).toBe("2.0");
    expect(response.id).toBe(42);
    expect(response.result).toBeDefined();
    expect(response.error).toBeUndefined();

    // Check pipeline result content
    const result = response.result as Record<string, unknown>;
    expect(result.ok).toBe(true);
    expect(result.engine).toBe("OrchestratorEngine");

    // Check that pipeline was called with proper input
    expect(pipeline.runOrchestratorPipeline).toHaveBeenCalledWith({
      text: "Summarize the Orchestrator Engine.",
      profileId: "default"
    });

    // Check returned summary content
    const output = result.output as Record<string, unknown>;
    expect(output.summary).toContain("Mocked summary");
  });
});
