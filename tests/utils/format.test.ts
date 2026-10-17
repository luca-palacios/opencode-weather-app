import { describe, expect, test } from "bun:test";
import { convertTemperature, formatForecastDate, formatTemperature } from "../../src/utils/format";

describe("temperature formatting", () => {
  test("formats a temperature with one decimal place and its unit", () => {
    expect(formatTemperature(21, "C")).toBe("21.0°C");
    expect(formatTemperature(68.25, "F")).toBe("68.3°F");
  });

  test("converts Celsius to Fahrenheit and leaves Fahrenheit unchanged", () => {
    expect(convertTemperature(0, "F")).toBe(32);
    expect(convertTemperature(20, "C")).toBe(20);
  });
});

describe("forecast date formatting", () => {
  test("formats dates consistently using the Spanish locale", () => {
    expect(formatForecastDate("2024-01-15")).toBe("lun, 15 ene");
  });
});
