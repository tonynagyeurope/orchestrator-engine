// FILE: src/utils/templateEngine.ts

/**
 * Enhanced Stage-2 template engine.
 * Supported expressions:
 *   ${input}
 *   ${previous}
 *   ${json.<path>}
 */
export function applyTemplate(
  template: string,
  context: {
    input: string;
    previous: string;
    [key: string]: unknown;
  }
): string {
  return template.replace(/\$\{([^}]+)\}/g, (match, rawExpr) => {
    const expr = rawExpr.trim();

    // --- Direct bindings ---
    if (expr === "input") return context.input;
    if (expr === "previous") return context.previous;

    // --- JSON deep path ---
    if (expr.startsWith("json.")) {
      const path = expr.replace(/^json\./, "").split(".");
      let cursor: any = context;

      for (const key of path) {
        if (cursor && typeof cursor === "object" && key in cursor) {
          cursor = cursor[key];
        } else {
          throw new Error(
            `Template error: JSON path "${expr}" could not be resolved`
          );
        }
      }

      return String(cursor);
    }

    // --- Unknown expression ---
    throw new Error(`Template error: unknown expression "${expr}"`);
  });
}
