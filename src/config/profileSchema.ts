// FILE: src/config/profileSchema.ts
import { z } from "zod";

/**
 * Zod schema for OE Orchestrator Profile.
 * Strict validation of all fields and nested structures.
 */

export const orchestrationSchema = z.object({
  mode: z.enum(["single", "parallel", "sequential"]).default("single"),
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
  mergeStrategy: z
    .enum(["concat", "summary", "json-merge", "custom"])
    .optional(),
  summaryProfileId: z.string().optional()
});

export const styleSchema = z.object({
  tone: z.string(),
  format: z.string()
});

export const exampleSchema = z.object({
  input: z.string(),
  output: z.unknown()
});

export const orchestratorProfileSchema = z.object({
  id: z.string(),
  title: z.string(),
  model: z.string(),
  temperature: z.number().default(0.0),
  maxSteps: z.number().default(1),
  prompt: z.array(z.string()),
  rules: z.array(z.string()).optional(),
  style: styleSchema.optional(),
  examples: z.array(exampleSchema).optional(),
  orchestration: orchestrationSchema.optional()
});

export type OrchestratorProfileValidated = z.infer<typeof orchestratorProfileSchema>;
