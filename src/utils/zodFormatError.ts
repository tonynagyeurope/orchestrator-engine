// FILE: src/utils/zodFormatError.ts
import kleur from "kleur";
import { ZodError } from "zod";

/**
 * Converts a Zod error into a clean, readable multi-line message.
 */
export function formatZodError(error: ZodError): string {
  const issues = error.issues.map((issue) => {
    const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
    return `- ${path} → ${issue.message}`;
  });

  return issues.join("\n");
}

export function formatProfileValidationError(
  error: Error,
  sourceFile?: string
): string {
  if (!(error instanceof ZodError)) {
    return error.message ?? String(error);
  }

  const lines: string[] = [];

  // Header
  lines.push(kleur.bold().red("Profile validation failed."));
  if (sourceFile) {
    lines.push(kleur.yellow(`File: ${sourceFile}`));
  }
  lines.push("");

  // List issues
  for (const issue of error.issues) {
    const path = issue.path.length > 0
      ? issue.path.join(".")
      : "(root)";

    lines.push(
      kleur.red(`• ${issue.message}`) +
      " " +
      kleur.gray(`[path: ${path}]`)
    );
  }

  lines.push("");
  lines.push(kleur.gray("Fix the errors above and re-run:"));
  lines.push(kleur.gray("  oe validate-profiles"));

  return lines.join("\n");
}

