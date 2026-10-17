import { getCoordinates } from "../api/geocoding";
import { getCurrentWeather } from "../api/weather";
import type { City } from "../types/City";
import type { TemperatureUnit } from "../types/Settings";
import type { CurrentWeather } from "../types/Weather";
import { convertTemperature } from "../utils/format";

export async function getWeather(
  city: City,
  unit: TemperatureUnit,
): Promise<CurrentWeather> {
  const coordinates = await getCoordinates(city);
  const temperature = await getCurrentWeather(coordinates);

  return {
    city,
    temperature: convertTemperature(temperature, unit),
    unit,
  };
}
