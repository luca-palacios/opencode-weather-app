import type { City, CityListItem } from "../types/City";

export function listCities(cities: readonly City[]): CityListItem[] {
  return cities.map((city, index) => ({ number: index + 1, city }));
}
