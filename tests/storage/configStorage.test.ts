import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { AppConfig } from "../../src/types/Settings";

const temporaryHome = await mkdtemp(join(tmpdir(), "weather-cli-tests-"));
const homeVariable = process.platform === "win32" ? "USERPROFILE" : "HOME";
const originalHome = process.env[homeVariable];
let loadConfig: typeof import("../../src/storage/configStorage").loadConfig;
let saveConfig: typeof import("../../src/storage/configStorage").saveConfig;

beforeAll(async () => {
  process.env[homeVariable] = temporaryHome;
  try {
    ({ loadConfig, saveConfig } = await import("../../src/storage/configStorage"));
  } finally {
    restoreHomeDirectory();
  }
});

afterAll(async () => {
  await rm(temporaryHome, { recursive: true, force: true });
});

function restoreHomeDirectory(): void {
  if (originalHome === undefined) {
    delete process.env[homeVariable];
    return;
  }

  process.env[homeVariable] = originalHome;
}

describe("configuration storage", () => {
  test("loads defaults, persists configurations, and rejects invalid data", async () => {
    await expect(loadConfig()).resolves.toEqual({
      cities: [],
      defaultCity: null,
      temperatureUnit: "C",
    });

    const config: AppConfig = {
      cities: ["Ottawa"],
      defaultCity: "Ottawa",
      temperatureUnit: "F",
    };

    await saveConfig(config);

    await expect(loadConfig()).resolves.toEqual(config);

    const { mkdir, writeFile } = await import("node:fs/promises");
    const configDirectory = join(temporaryHome, ".config", "weather-cli");
    await mkdir(configDirectory, { recursive: true });
    await writeFile(join(configDirectory, "config.json"), JSON.stringify({ cities: [1] }));

    await expect(loadConfig()).rejects.toThrow("formato inválido");
  });
});
