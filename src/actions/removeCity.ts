import type { AppConfig } from "../types/Settings";
import { saveCities } from "../storage/citiesStorage";

export async function removeCity(index: number, config: AppConfig): Promise<AppConfig> {
  if (!Number.isInteger(index) || index < 0 || index >= config.cities.length) {
    throw new Error("Número de ciudad no válido.");
  }

  const removedCity = config.cities[index]!;
  const cities = config.cities.filter((_, cityIndex) => cityIndex !== index);
  const defaultCity = config.defaultCity === removedCity && !cities.includes(removedCity)
    ? null
    : config.defaultCity;
  const updatedConfig = { ...config, cities, defaultCity };

  await saveCities(cities, defaultCity);
  return updatedConfig;
}
