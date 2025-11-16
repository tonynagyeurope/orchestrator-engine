import { describe, it, expect, beforeEach } from "vitest";
import { loadProfile, __clearProfileCache } from "./profileLoader.js";
import { defaultProfiles } from "./baseConfig.js";
import fs from "fs";
import path from "path";

// helper to create a temp private profile file
const tmpFile = path.resolve("tmp-test-profile.json");

describe("profileLoader", () => {
  beforeEach(() => {
    __clearProfileCache();
    process.env.PRIVATE_PROFILE_PATH = "";
    process.env.PRIVATE_PROFILE_URL = "";
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it("returns default profile when no private config is present", async () => {
    const result = await loadProfile("ai");
    expect(result.id).toBe("ai");
    expect(result.displayName).toBe(defaultProfiles["ai"].displayName);
  });

  it("loads and merges private profile from local JSON", async () => {
    const privateData = {
      ai: {
        id: "ai",
        displayName: "Private AI Profile",
        uiLabels: { startButton: "Run private task" }
      }
    };
    fs.writeFileSync(tmpFile, JSON.stringify(privateData));
    process.env.PRIVATE_PROFILE_PATH = tmpFile;

    const result = await loadProfile("ai");
    expect(result.displayName).toBe("Private AI Profile");
    expect(result.uiLabels!.startButton).toBe("Run private task");
  });

  it("returns cached profile on second call", async () => {
    const result1 = await loadProfile("ai");
    const result2 = await loadProfile("ai");
    expect(result1).toBe(result2);
  });
});
