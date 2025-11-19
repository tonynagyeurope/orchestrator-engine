/**
 * Global configuration types for the Orchestrator Engine (OE).
 * These types define capability guardrails, provider selection,
 * enabled toolsets, and reasoning behavior.
 *
 * The OE config is intentionally static, JSON-friendly, and
 * controlled by "config-as-control" philosophy.
 */

/**
 * Capabilities define what the agent is allowed to do.
 * These values directly impact the reasoning strategy.
 */
export interface Capabilities {
  /**
   * If false → agent cannot call AWS APIs (SDK, signed requests).
   * This forces the agent to avoid direct infra mutations.
   */
  awsApi: boolean;

  /**
   * If true → agent must generate CLI commands instead of
   * attempting direct execution or API calls.
   * This enables safe, human-verified workflows.
   */
  cliOnly: boolean;

  /**
   * If true → the system enforces a "human-in-the-loop" model.
   * The AI may propose an action (e.g. CLI command),
   * but the human decides whether to execute it.
   */
  requiresHumanApproval: boolean;
}

/**
 * High-level configuration for the Orchestrator Engine.
 * This structure is loaded at runtime and drives all
 * provider selection, guardrail enforcement, and reasoning strategies.
 */
export interface OEConfig {
  /**
   * The selected reasoning provider.
   * Determines which LLM integration layer the OE uses.
   */
  provider: "anthropic" | "openai" | "bedrock";

  /**
   * Guardrails and safety controls that shape the behavior
   * of the reasoning engine.
   */
  capabilities: Capabilities;

  /**
   * List of enabled tools in the OE runtime.
   * Tools may be MCP-wrapped or native OE utilities.
   */
  tools: string[];

  /**
   * Reasoning configuration (depth, guardrail mode, etc.)
   */
  reasoning: {
    /**
     * Maximum internal reasoning steps.
     * Works in dispatch logic + multi-step execution traces.
     */
    maxSteps: number;

    /**
     * Guardrail behavior mode.
     * - "guardrail": safe, restricted execution
     * - "none": unrestricted (not recommended for demo)
     */
    safeMode: "guardrail" | "none";
  };
}
