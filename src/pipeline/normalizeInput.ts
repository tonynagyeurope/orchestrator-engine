// src/pipeline/normalizeInput.ts

/**
 * Step 1 - Normalize Input
 * Ensures consistent structure and format for the orchestration pipeline.
 */
export async function normalizeInput(input: string): Promise<{ text: string }> {
  const trimmed = input.trim();
  return { text: trimmed };
}
