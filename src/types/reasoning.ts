// src/types/reasoning.ts
export interface ReasoningResult {
  summary: string;
  steps: string[];
  meta?: Record<string, unknown>;
}
