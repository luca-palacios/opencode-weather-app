import type { ForecastDay, TemperatureUnit, WeatherForecastResponse } from "./types";

const FORECAST_DAYS = 7;

export async function obtenerPronostico(
  latitude: number,
  longitude: number,
  unit: TemperatureUnit,
): Promise<ForecastDay[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: "temperature_2m_max,temperature_2m_min",
    forecast_days: String(FORECAST_DAYS),
    timezone: "auto",
    temperature_unit: unit === "F" ? "fahrenheit" : "celsius",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

  if (!response.ok) {
    throw new Error("No se pudo obtener el pronóstico");
  }

  const data = (await response.json()) as WeatherForecastResponse;
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
