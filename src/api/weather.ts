import type {
  Coordinates,
  CurrentWeatherApiResponse,
  ForecastApiResponse,
  ForecastDay,
} from "../types/Weather";
import type { TemperatureUnit } from "../types/Settings";
import { FORECAST_DAYS } from "../utils/constants";

export async function getCurrentWeather(
  { latitude, longitude }: Coordinates,
): Promise<number> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new Error("No se pudo conectar con la API del clima");
  }

  const data = (await response.json()) as CurrentWeatherApiResponse;
  const temperature = data.current?.temperature_2m;

  if (typeof temperature !== "number" || !Number.isFinite(temperature)) {
    throw new Error("La API devolvió datos de clima inválidos");
  }

  return temperature;
}

export async function getWeatherForecast(
  coordinates: Coordinates,
  unit: TemperatureUnit,
): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: String(coordinates.latitude),
    longitude: String(coordinates.longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: String(FORECAST_DAYS),
    timezone: "auto",
    temperature_unit: unit === "F" ? "fahrenheit" : "celsius",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el pronóstico");
  }

  const data = (await response.json()) as ForecastApiResponse;
  const dates = data.daily?.time;
  const maximums = data.daily?.temperature_2m_max;
  const minimums = data.daily?.temperature_2m_min;

  if (!dates || !maximums || !minimums) {
    throw new Error("La API devolvió un pronóstico incompleto");
  }

  return Array.from({ length: FORECAST_DAYS }, (_, index) => {
    const date = dates[index];
    const maxTemperature = maximums[index];
    const minTemperature = minimums[index];

    if (
      !date ||
      typeof maxTemperature !== "number" ||
      !Number.isFinite(maxTemperature) ||
      typeof minTemperature !== "number" ||
      !Number.isFinite(minTemperature)
    ) {
      throw new Error("La API devolvió un pronóstico incompleto");
    }

    return { date, maxTemperature, minTemperature };
  });
}
