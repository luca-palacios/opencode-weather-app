import { getCoordinates } from "../api/geocoding";
import type { AppConfig } from "../types/Settings";
import { saveCities } from "../storage/citiesStorage";

export async function addCity(city: string, config: AppConfig): Promise<AppConfig> {
  const normalizedCity = city.trim();
  if (!normalizedCity) throw new Error("Ingrese el nombre de una ciudad.");

  await getCoordinates(normalizedCity);
  const updatedConfig = { ...config, cities: [...config.cities, normalizedCity] };
  await saveCities(updatedConfig.cities, updatedConfig.defaultCity);
  return updatedConfig;
}
