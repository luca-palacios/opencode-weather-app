import type { CityListItem } from "../types/City";
import type { CurrentWeather, WeatherForecast } from "../types/Weather";
import { cyan, green, red, yellow } from "../utils/colors";
import { formatForecastDate, formatTemperature } from "../utils/format";

export function showError(message: string): void {
  console.log(red(message));
}

export function showSuccess(message: string): void {
  console.log(green(message));
}

export function showInfo(message: string): void {
  console.log(cyan(message));
}

export function showCityList(cities: readonly CityListItem[]): void {
  console.log("Ciudades registradas:");
  for (const item of cities) {
    console.log(`${item.number}. ${item.city}`);
  }
}

export function showCurrentWeather(weather: CurrentWeather): void {
  const temperature = yellow(formatTemperature(weather.temperature, weather.unit));
  console.log(`El clima actual en ${weather.city} es: ${temperature}`);
}

export function showForecast(forecast: WeatherForecast): void {
  showInfo(`Pronóstico de 7 días para ${forecast.city}:`);

  for (const day of forecast.days) {
    const date = formatForecastDate(day.date);
    const temperatures = yellow(
      `Mín. ${formatTemperature(day.minTemperature, forecast.unit)} / Máx. ${formatTemperature(day.maxTemperature, forecast.unit)}`,
    );
    console.log(`${date}: ${temperatures}`);
  }
}
