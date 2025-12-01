// src/reasoning/reasoningProvider.ts

import { OrchestratorProfile } from "../config/baseConfig.js";
import { ReasoningResult } from "./types.js";

export interface ReasoningProvider {
  id: string;  // "openai", "bedrock"
  run(
    input: string,
    profile: OrchestratorProfile
  ): Promise<ReasoningResult>;
}
