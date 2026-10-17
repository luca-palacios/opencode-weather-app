import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { selectCityIndex } from "../../src/presentation/input";

describe("city selection", () => {
  afterEach(() => mock.restore());

  test("returns the zero-based index for a valid selection", async () => {
    spyOn(console, "log").mockImplementation(() => {});
    const input = { question: async () => "2" };

    await expect(
      selectCityIndex(input, [{ number: 1, city: "Ottawa" }, { number: 2, city: "Toronto" }], "City: "),
    ).resolves.toBe(1);
  });

  test("returns null for an invalid selection", async () => {
    const log = spyOn(console, "log").mockImplementation(() => {});
    const input = { question: async () => "invalid" };

    await expect(selectCityIndex(input, [{ number: 1, city: "Ottawa" }], "City: ")).resolves.toBeNull();
    expect(log).toHaveBeenCalled();
  });

  test("does not prompt when no cities are available", async () => {
    const question = mock(async () => "1");
    spyOn(console, "log").mockImplementation(() => {});

    await expect(selectCityIndex({ question }, [], "City: ")).resolves.toBeNull();
    expect(question).not.toHaveBeenCalled();
  });
});
