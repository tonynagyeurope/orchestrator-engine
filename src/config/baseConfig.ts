// src/config/baseConfig.ts

export interface TraceConfig {
  enabled: boolean;
  verbose?: boolean;
  timestamps?: boolean;
  colors?: boolean;
  compact?: boolean;      // one-line compact mode for high-volume traces
}

export interface OrchestratorProfile {
  id: string;
  displayName: string;
  domainFocus: string;
  systemPrompt: string;
  exampleUseCases?: string[];
  uiLabels: Record<string, string>;
  trace?: TraceConfig;
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
