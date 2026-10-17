import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { getCurrentWeather, getWeatherForecast } from "../../src/api/weather";

describe("weather API", () => {
  afterEach(() => mock.restore());

  test("returns a valid current temperature", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ current: { temperature_2m: 18.5 } }),
    );

    await expect(getCurrentWeather({ latitude: 45, longitude: -75 })).resolves.toBe(18.5);
  });

  test("rejects an invalid current temperature", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({ current: { temperature_2m: Number.NaN } }),
    );

    await expect(getCurrentWeather({ latitude: 45, longitude: -75 })).rejects.toThrow(
      "La API devolvió datos de clima inválidos",
    );
  });

  test("maps daily forecast data and requests the selected unit", async () => {
    const fetchMock = spyOn(globalThis, "fetch").mockResolvedValue(
      Response.json({
        daily: {
          time: Array.from({ length: 7 }, (_, index) => `2024-01-${String(index + 1).padStart(2, "0")}`),
          temperature_2m_max: [1, 2, 3, 4, 5, 6, 7],
          temperature_2m_min: [-1, -2, -3, -4, -5, -6, -7],
        },
      }),
    );

    const forecast = await getWeatherForecast({ latitude: 45, longitude: -75 }, "F");

    expect(forecast).toHaveLength(7);
    expect(forecast[0]).toEqual({ date: "2024-01-01", maxTemperature: 1, minTemperature: -1 });
    expect(new URL(String(fetchMock.mock.calls[0]?.[0])).searchParams.get("temperature_unit")).toBe(
      "fahrenheit",
    );
  });

  test("rejects incomplete forecast data", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(Response.json({ daily: { time: [] } }));

    await expect(getWeatherForecast({ latitude: 45, longitude: -75 }, "C")).rejects.toThrow(
      "La API devolvió un pronóstico incompleto",
    );
  });
});
