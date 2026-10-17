import type { City } from "./City";

export type TemperatureUnit = "C" | "F";

export type AppConfig = {
  cities: City[];
  defaultCity: City | null;
  temperatureUnit: TemperatureUnit;
};
