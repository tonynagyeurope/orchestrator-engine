// FILE: src/config/baseConfig.ts
import { z } from "zod";

export interface TraceConfig {
  enabled: boolean;
  verbose?: boolean;
  timestamps?: boolean;
  colors?: boolean;
  compact?: boolean;
}

export const OrchestratorProfileSchema = z.object({
  id: z.string(),
  title: z.string(),

  model: z.string(),
  temperature: z.number(),
  maxSteps: z.number(),

  prompt: z.array(z.string()),

  rules: z.array(z.string()).optional(),

  style: z
    .object({
      tone: z.string(),
      format: z.string()
    })
    .optional(),

  examples: z
    .array(
      z.object({
        input: z.string(),
        output: z.unknown()
      })
    )
    .optional(),

  orchestration: z
    .object({
      mode: z.enum(["single", "parallel", "sequential"]).optional(),

      children: z
        .array(
          z.object({
            profileId: z.string(),
            alias: z.string().optional(),
            inputStrategy: z.enum(["same", "template", "transform"]).optional(),
            inputTemplate: z.string().optional(),
            providerOverride: z.string().optional()
          })
        )
        .optional(),

      mergeStrategy: z.enum(["concat", "summary", "json-merge", "custom"]).optional(),

      summaryProfileId: z.string().optional()
    })
    .optional()
});

export type OrchestratorProfile = z.infer<typeof OrchestratorProfileSchema>;
