import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { getCoordinates } from "../../src/api/geocoding";

describe("getCoordinates", () => {
  afterEach(() => mock.restore());

  test("returns the first matching city's coordinates", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ results: [{ latitude: 45.42, longitude: -75.69 }] }),
    );

    await expect(getCoordinates("Ottawa")).resolves.toEqual({ latitude: 45.42, longitude: -75.69 });

    const requestUrl = new URL(String(fetchMock.mock.calls[0]?.[0]));
    expect(requestUrl.searchParams.get("name")).toBe("Ottawa");
    expect(requestUrl.searchParams.get("language")).toBe("es");
  });

  test("throws when the API request fails", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 503 }));

    await expect(getCoordinates("Ottawa")).rejects.toThrow("No se pudo buscar la ciudad");
  });

  test("throws when the city is not found", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ results: [] }));

    await expect(getCoordinates("Unknown")).rejects.toThrow("Ciudad no encontrada");
  });
});
