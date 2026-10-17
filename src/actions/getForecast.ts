import { getCoordinates } from "../api/geocoding";
import { getWeatherForecast } from "../api/weather";
import type { City } from "../types/City";
import type { TemperatureUnit } from "../types/Settings";
import type { WeatherForecast } from "../types/Weather";

export async function getForecast(
  city: City,
  unit: TemperatureUnit,
): Promise<WeatherForecast> {
  const coordinates = await getCoordinates(city);
  const days = await getWeatherForecast(coordinates, unit);

  return { city, days, unit };
}
