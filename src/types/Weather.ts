import type { City } from "./City";
import type { TemperatureUnit } from "./Settings";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type CurrentWeatherApiResponse = {
  current: { temperature_2m: number };
};

export type ForecastApiResponse = {
  daily?: {
    time?: string[];
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
  };
};

export type ForecastDay = {
  date: string;
  maxTemperature: number;
  minTemperature: number;
};

export type CurrentWeather = {
  city: City;
  temperature: number;
  unit: TemperatureUnit;
};

export type WeatherForecast = {
  city: City;
  days: ForecastDay[];
  unit: TemperatureUnit;
};
