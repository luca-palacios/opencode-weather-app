export type TemperatureUnit = "C" | "F";

export type AppConfig = {
  cities: string[];
  defaultCity: string | null;
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeocodingResponse = {
  results?: Array<Coordinates>;
};

export type CurrentWeatherResponse = {
  current: { temperature_2m: number };
};

export type WeatherForecastResponse = {
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
