import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { AppConfig } from "./types";

const CONFIG_PATH = join(homedir(), ".config", "weather-cli", "config.json");

const DEFAULT_CONFIG: AppConfig = {
  cities: [],
  defaultCity: null,
};

function hasErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === code;
}

function isAppConfig(value: unknown): value is AppConfig {
  if (typeof value !== "object" || value === null) return false;

  const config = value as Record<string, unknown>;
  const cities = config.cities;

  return Array.isArray(cities) &&
    cities.every((city) => typeof city === "string") &&
    (config.defaultCity === null ||
      (typeof config.defaultCity === "string" && cities.includes(config.defaultCity)));
}

export async function cargarConfiguracion(): Promise<AppConfig> {
  let contents: string;

  try {
    contents = await readFile(CONFIG_PATH, "utf8");
  } catch (error) {
    if (hasErrorCode(error, "ENOENT")) return { ...DEFAULT_CONFIG, cities: [] };
    throw new Error(`No se pudo leer la configuración: ${errorMessage(error)}`);
  }

  let config: unknown;
  try {
    config = JSON.parse(contents);
  } catch {
    throw new Error(`El archivo de configuración contiene JSON inválido: ${CONFIG_PATH}`);
  }

  if (!isAppConfig(config)) {
    throw new Error(`El archivo de configuración tiene un formato inválido: ${CONFIG_PATH}`);
  }

  return config;
}

export async function guardarConfiguracion(config: AppConfig): Promise<void> {
  try {
    await mkdir(dirname(CONFIG_PATH), { recursive: true });
    await writeFile(CONFIG_PATH, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  } catch (error) {
    throw new Error(`No se pudo guardar la configuración en ${CONFIG_PATH}: ${errorMessage(error)}`);
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
