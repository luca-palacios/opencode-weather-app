import type { CitiesState, City } from "../types/City";
import { loadConfig, saveConfig } from "./configStorage";

export async function loadCities(): Promise<CitiesState> {
  const { cities, defaultCity } = await loadConfig();
  return { cities, defaultCity };
}

export async function saveCities(cities: City[], defaultCity: City | null): Promise<void> {
  const config = await loadConfig();
  await saveConfig({ ...config, cities, defaultCity });
}
