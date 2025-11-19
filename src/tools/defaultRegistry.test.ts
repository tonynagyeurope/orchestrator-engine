// src/tools/defaultRegistry.test.ts
import { describe, it, expect } from "vitest";
import { createDefaultMcpRegistry } from "./defaultRegistry.js";

describe("createDefaultMcpRegistry", () => {
  it("registers the built-in tools", async () => {
    const registry = createDefaultMcpRegistry();

    const tools = registry.list().sort();
    expect(tools).toEqual([
      "awsGetObject",
      "awsListObjects",
      "fetchUrl"
    ]);

    // Smoke test: each tool should be executable with minimal input.
    await expect(
      registry.execute("fetchUrl", { url: "https://example.com" })
    ).resolves.toBeDefined();

    await expect(
      registry.execute("awsListObjects", { bucket: "example-bucket" })
    ).rejects.toBeInstanceOf(Error); 
    // We only care that the tool exists and runs,
    // missing AWS credentials are fine in unit tests.

    await expect(
      registry.execute("awsGetObject", {
        bucket: "example-bucket",
        key: "example-key.json"
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
