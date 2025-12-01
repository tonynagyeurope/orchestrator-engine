// FILE: src/pipeline/summary/mergeStrategies.ts

/**
 * Concatenate an array of final outputs into a single string.
 */
export function concatMerge(outputs: string[]): string {
  return outputs.join("\n");
}

/**
 * Deep merge of JSON objects.
 * Throws if any final output is not valid JSON.
 */
export function jsonMerge(outputs: string[]): string {
  const parsed = outputs.map((o) => {
    try {
      return JSON.parse(o);
    } catch {
      throw new Error(`json-merge failed: output is not valid JSON: ${o}`);
    }
  });

  const result = parsed.reduce((acc, obj) => deepMerge(acc, obj), {});
  return JSON.stringify(result);
}

function deepMerge(a: any, b: any): any {
  if (Array.isArray(a) && Array.isArray(b)) return [...a, ...b];
  if (typeof a === "object" && typeof b === "object") {
    const res: any = { ...a };
    for (const key of Object.keys(b)) {
      if (key in res) res[key] = deepMerge(res[key], b[key]);
      else res[key] = b[key];
    }
    return res;
  }
  return b; // override primitive values
}
