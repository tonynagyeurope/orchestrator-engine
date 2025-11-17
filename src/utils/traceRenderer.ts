// src/utils/traceRenderer.ts

import kleur from "kleur";
import { TraceStep } from "./traceFormatter.js";
import { TraceConfig } from "../config/baseConfig.js";

/**
 * traceRenderer.ts
 * ----------------
 * Simple CLI visualization for reasoning traces.
 * Displays indexed steps with colors, timestamps, and optional metadata.
 */

export function renderTrace(trace: TraceStep[], config?: TraceConfig): void {
  if (!config?.enabled) return; // silent mode support

  const useColor = config?.colors ?? true;
  const useTimestamps = config?.timestamps ?? true;

  const color = useColor ? kleur : { gray: (x:string)=>x, yellow:(x:string)=>x, white:(x:string)=>x, bold:()=>({blue:(x:string)=>x}) };

  console.log(color.bold().blue("[Reasoning Trace Visualization]"));
  console.log(color.gray("───────────────────────────────────────────────"));

  trace.forEach((step) => {
    const index = color.yellow(`#${step.index.toString().padStart(2, "0")}`);
    const time = useTimestamps ? color.gray(`[${new Date(step.timestamp).toISOString().split("T")[1].split(".")[0]}] `) : "";
    const text = color.white(step.text);
    console.log(`${index} ${time}${text}`);

    if (step.meta && Object.keys(step.meta).length > 0) {
      const metaText = Object.entries(step.meta)
        .map(([k, v]) => {
            const cyan = (kleur as any).cyan || ((s: string) => s);
            return `${color.gray(k)}=${cyan(String(v))}`;
        })
        .join("  ");
      console.log(color.gray(`   ↳ ${metaText}`));
    }
  });

  console.log(color.gray("───────────────────────────────────────────────"));
}