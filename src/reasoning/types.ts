// src/reasoning/types.ts

import { OrchestratorProfile } from "../config/baseConfig.js";
import { ReasoningResult } from "./reasoningProvider.js";

export interface ReasoningProvider {
  id: string;
  analyze(
    input: string,
    profile: string | OrchestratorProfile,
    options?: Record<string, unknown>
  ): Promise<ReasoningResult>;
}