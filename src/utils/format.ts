import type { TemperatureUnit } from "../types/Settings";

export function formatTemperature(temperature: number, unit: TemperatureUnit): string {
  return `${temperature.toFixed(1)}°${unit}`;
}

export function convertTemperature(temperature: number, unit: TemperatureUnit): number {
  return unit === "F" ? (temperature * 9) / 5 + 32 : temperature;
}

export function formatForecastDate(date: string): string {
  return new Intl.DateTimeFormat("es", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
