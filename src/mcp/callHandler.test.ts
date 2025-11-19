import { describe, it, expect } from "vitest";
import { McpToolRegistry } from "../tools/registry.js";
import type { McpTool } from "../types/mcp.js";
import type { OEConfig } from "../types/config.js";
import {
  McpCallHandler,
  type McpEventEmitter,
  type McpResultEvent,
  type McpErrorEvent
} from "./callHandler.js";

class TestEmitter implements McpEventEmitter {
  public readonly events: unknown[] = [];

  emit(event: unknown): void {
    this.events.push(event);
  }
}

type PartialConfigOverrides = Partial<Omit<OEConfig, "capabilities">> & {
  capabilities?: Partial<OEConfig["capabilities"]>;
};

const makeBaseConfig = (overrides?: PartialConfigOverrides): OEConfig => {
  const base: OEConfig = {
    provider: "openai",
    capabilities: {
      awsApi: true,
      cliOnly: false,
      requiresHumanApproval: false
    },
    reasoning: {
      maxSteps: 5,
      safeMode: "guardrail"
    }
  } as OEConfig;

  return {
    ...base,
    ...overrides,
    capabilities: {
      ...base.capabilities,
      ...(overrides?.capabilities ?? {})
    },
    reasoning: {
      ...base.reasoning,
      ...(overrides?.reasoning ?? {})
    }
  };
};

const echoTool: McpTool = {
  name: "echo",
  description: "Echoes the input back.",
  inputSchema: {
    type: "object",
    properties: {},
    required: []
  },
  outputSchema: {
    type: "object",
    properties: {}
  },
  async handler(input: unknown): Promise<unknown> {
    return { input };
  }
};

describe("McpCallHandler", () => {
  it("executes a tool and emits result event", async () => {
    const registry = new McpToolRegistry();
    registry.register(echoTool);

    const config = makeBaseConfig();
    const emitter = new TestEmitter();

    const handler = new McpCallHandler(registry, config, emitter);

    const response = await handler.handle({
      type: "mcp.call",
      tool: "echo",
      input: { foo: "bar" }
    });

    const resultEvent = response as McpResultEvent;

    expect(resultEvent.type).toBe("mcp.result");
    expect(resultEvent.tool).toBe("echo");
    expect(resultEvent.result).toEqual({ input: { foo: "bar" } });

    // First event should be the "call" event.
    const callEvent = emitter.events[0] as { type?: string; event?: string };
    expect(callEvent.type).toBe("mcp.event");
    expect(callEvent.event).toBe("call");

    // There should also be a "mcp.result" event emitted.
    const hasResultEvent = emitter.events.some(event => {
      const e = event as { type?: string };
      return e.type === "mcp.result";
    });
    expect(hasResultEvent).toBe(true);
  });

  it("returns mcp.error when the tool is missing", async () => {
    const registry = new McpToolRegistry();
    const config = makeBaseConfig();
    const emitter = new TestEmitter();

    const handler = new McpCallHandler(registry, config, emitter);

    const response = await handler.handle({
      type: "mcp.call",
      tool: "missingTool",
      input: {}
    });

    const errorEvent = response as McpErrorEvent;
    expect(errorEvent.type).toBe("mcp.error");
    expect(errorEvent.tool).toBe("missingTool");
    expect(errorEvent.error).toMatch(/Tool not found/i);

    const hasErrorEvent = emitter.events.some(event => {
      const e = event as { type?: string };
      return e.type === "mcp.error";
    });
    expect(hasErrorEvent).toBe(true);
  });

  it("enforces cliOnly guardrail", async () => {
    const registry = new McpToolRegistry();

    const dangerousTool: McpTool = {
      name: "awsPutObjectDanger",
      description: "Dangerous write tool (test only).",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      },
      outputSchema: {
        type: "object",
        properties: {}
      },
      async handler(): Promise<unknown> {
        return { ok: true };
      }
    };

    registry.register(dangerousTool);

    const config = makeBaseConfig({
      capabilities: { cliOnly: true }
    });

    const emitter = new TestEmitter();
    const handler = new McpCallHandler(registry, config, emitter);

    const response = await handler.handle({
      type: "mcp.call",
      tool: "awsPutObjectDanger",
      input: {}
    });

    const errorEvent = response as McpErrorEvent;
    expect(errorEvent.type).toBe("mcp.error");
    expect(errorEvent.error).toMatch(/not permitted in cli-only mode/i);
  });

  it("enforces awsApi=false guardrail for mutating AWS tools", async () => {
    const registry = new McpToolRegistry();

    const writeTool: McpTool = {
      name: "awsPutObjectDemo",
      description: "Mutating AWS tool (test only).",
      inputSchema: {
        type: "object",
        properties: {},
        required: []
      },
      outputSchema: {
        type: "object",
        properties: {}
      },
      async handler(): Promise<unknown> {
        return { ok: true };
      }
    };

    registry.register(writeTool);

    const config = makeBaseConfig({
      capabilities: { awsApi: false }
    });

    const emitter = new TestEmitter();
    const handler = new McpCallHandler(registry, config, emitter);

    const response = await handler.handle({
      type: "mcp.call",
      tool: "awsPutObjectDemo",
      input: {}
    });

    const errorEvent = response as McpErrorEvent;
    expect(errorEvent.type).toBe("mcp.error");
    expect(errorEvent.error).toMatch(/AWS API access disabled/i);
  });
});
