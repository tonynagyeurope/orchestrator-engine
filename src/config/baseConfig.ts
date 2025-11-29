// src/config/baseConfig.ts

export interface TraceConfig {
  enabled: boolean;
  verbose?: boolean;
  timestamps?: boolean;
  colors?: boolean;
  compact?: boolean;      // one-line compact mode for high-volume traces
}

export interface OrchestratorProfile {
  /**
   * Unique identifier for selecting this profile.
   */
  id: string;

  /**
   * Visible name in UI or logs.
   */
  displayName: string;

  /**
   * The description of the profile.
   */
  description?: string;

  /**
   * High-level domain (AWS, FinOps, CLI, GitHub, etc.)
   */
  domainFocus: string;

  /**
   * System prompt injected before the user input.
   */
  systemPrompt: string;

  /**
   * Optional examples shown in UI.
   */
  exampleUseCases?: string[];

  /**
   * UI custom labels.
   */
  uiLabels: Record<string, string>;

  /**
   * Trace configuration (formatting, verbosity).
   */
  trace?: TraceConfig;

  /**
   * Additional reasoning rules for more complex profiles.
   */
  rules?: string[];

  /**
   * Few-shot examples for LLM.
   */
  examples?: Array<{
    input: string;
    output: Record<string, unknown>;
  }>;

  /**
   * Optional style marker (cli, finops, troubleshooting, etc.)
   */
  style?: string;

  /**
   * Model override for this profile (e.g., "openai:gpt-4o-mini").
   */
  model?: string;

  /**
   * Optional temp override per profile.
   */
  temperature?: number;

  /**
   * Future orchestration metadata
   * — this is where parallel fan-out / fan-in will attach.
   *
   * Currently optional and unused by the OE core.
   */
  orchestration?: {
    /**
     * single: normal pipeline (default)
     * parallel: fan-out into multiple profiles
     * sequential: run children in order
     */
    mode: "single" | "parallel" | "sequential";

    /**
     * Child profiles invoked by the orchestrator layer.
     */
    children?: Array<{
      profileId: string;
      alias?: string;

      /**
       * How to build input for this child:
       * - same: forward parent input
       * - template: use inputTemplate string
       * - transform: later custom function
       */
      inputStrategy?: "same" | "template" | "transform";
      inputTemplate?: string;

      /**
       * Provider override per child (optional).
       */
      providerOverride?: string;
    }>;

    /**
     * How results should be merged.
     */
    mergeStrategy?: "concat" | "summary" | "json-merge" | "custom";

    /**
     * Optional summary pipeline executed after merge.
     */
    summaryProfileId?: string;
  };
}

export const defaultProfiles: Record<string, OrchestratorProfile> = {
  ai: {
    id: "ai",
    displayName: "AI Orchestration",
    domainFocus: "AI, ML, reasoning, orchestration",
    systemPrompt: "Analyze and coordinate multi-step AI reasoning.",
    exampleUseCases: [
      "Evaluate cloud cost efficiency",
      "Compare AI inference pipelines",
      "Suggest orchestration optimizations"
    ],
    uiLabels: {
      startButton: "Start Analysis",
      stopButton: "Stop",
      inputPlaceholder: "Enter a description or task...",
      resultHeader: "Orchestration Result"
    },
    trace: { enabled: true, verbose: true, timestamps: true, colors: true }
  },

  cloud: {
    id: "cloud",
    displayName: "Cloud Optimization",
    domainFocus: "AWS, GCP, Azure",
    systemPrompt: "Analyze cloud workloads and optimization potential.",
    exampleUseCases: ["Detect underutilized resources", "Optimize instance cost"],
    uiLabels: {
      startButton: "Run Optimization",
      stopButton: "Stop",
      inputPlaceholder: "Enter workload or service name...",
      resultHeader: "Optimization Summary"
    },
    trace: { enabled: true, verbose: true, timestamps: true, colors: true }
  }
};
