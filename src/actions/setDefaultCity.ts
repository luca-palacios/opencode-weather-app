import type { AppConfig } from "../types/Settings";
import { saveCities } from "../storage/citiesStorage";

export async function setDefaultCity(index: number, config: AppConfig): Promise<AppConfig> {
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    throw new Error("Número de ciudad no válido.");
  }

  const updatedConfig = { ...config, defaultCity: config.cities[index]! };
  await saveCities(updatedConfig.cities, updatedConfig.defaultCity);
  return updatedConfig;
}
