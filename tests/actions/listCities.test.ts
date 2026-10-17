import { describe, expect, test } from "bun:test";
import { listCities } from "../../src/actions/listCities";

describe("city actions", () => {
  test("lists cities with one-based numbering", () => {
    expect(listCities(["Ottawa", "Toronto"])).toEqual([
      { number: 1, city: "Ottawa" },
      { number: 2, city: "Toronto" },
    ]);
  });
});
