import type { TemperatureUnit } from "../types/Settings";
import { loadConfig, saveConfig } from "./configStorage";

export async function loadTemperatureUnit(): Promise<TemperatureUnit> {
  const { temperatureUnit } = await loadConfig();
  return temperatureUnit;
}

export async function saveTemperatureUnit(temperatureUnit: TemperatureUnit): Promise<void> {
  const config = await loadConfig();
  await saveConfig({ ...config, temperatureUnit });
}
