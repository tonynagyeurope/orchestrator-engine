import { renderTrace } from "../src/utils/traceRenderer.js";
import { TraceStep } from "../src/utils/traceFormatter.js";

const trace: TraceStep[] = [
  { index: 1, text: "Loading configuration", timestamp: new Date().toISOString() },
  { index: 2, text: "Analyzing reasoning flow", timestamp: new Date().toISOString() },
  { index: 3, text: "Rendering trace...", timestamp: new Date().toISOString() }
];

renderTrace(trace);
