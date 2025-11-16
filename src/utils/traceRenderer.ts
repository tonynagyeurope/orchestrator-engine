// src/utils/traceRenderer.ts

import kleur from "kleur";
import { TraceStep } from "./traceFormatter.js";

/**
 * traceRenderer.ts
 * ----------------
 * Simple CLI visualization for reasoning traces.
 * Displays indexed steps with colors, timestamps, and optional metadata.
 */

export function renderTrace(trace: TraceStep[]): void {
  console.log(kleur.bold().blue("\n[Reasoning Trace Visualization]"));
  console.log(kleur.gray("───────────────────────────────────────────────"));

  trace.forEach((step) => {
    const index = kleur.yellow(`#${step.index.toString().padStart(2, "0")}`);
    // Use fixed, locale-independent HH:MM:SS format for deterministic tests
    const isoTime = new Date(step.timestamp).toISOString().split("T")[1].split(".")[0];
    const time = kleur.gray(`[${isoTime}]`);
    const text = kleur.white(step.text);

    console.log(`${index} ${time} ${text}`);

    if (step.meta && Object.keys(step.meta).length > 0) {
      const metaText = Object.entries(step.meta)
        .map(([k, v]) => `${kleur.gray(k)}=${kleur.cyan(String(v))}`)
        .join("  ");
      console.log(kleur.dim(`   ↳ ${metaText}`));
    }
  });

  console.log(kleur.gray("───────────────────────────────────────────────\n"));
}
