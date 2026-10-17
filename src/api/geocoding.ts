import type { GeocodingResponse } from "../types/City";
import type { Coordinates } from "../types/Weather";

export async function getCoordinates(city: string): Promise<Coordinates> {
  const params = new URLSearchParams({
    name: city,
    count: "1",
    language: "es",
    format: "json",
  });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);

  if (!response.ok) {
    throw new Error("No se pudo buscar la ciudad");
  }

  const data = (await response.json()) as GeocodingResponse;
  const coordinates = data.results?.[0];

  if (!coordinates) {
    throw new Error("Ciudad no encontrada");
  }

  return coordinates;
}
