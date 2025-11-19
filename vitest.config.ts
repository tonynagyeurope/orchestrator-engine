import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: "v8", // use native coverage
      reporter: ["text", "lcov"],
      exclude: ["dist", "infra", "coverage", "node_modules"]
    }
  }
});
