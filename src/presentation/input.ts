import type { CityListItem } from "../types/City";
import { showCityList, showError } from "./output";

type PromptInput = {
  question(prompt: string): Promise<string>;
};

export async function ask(input: PromptInput, prompt: string): Promise<string> {
  return input.question(prompt);
}

export async function selectCityIndex(
  input: PromptInput,
  cities: readonly CityListItem[],
  prompt: string,
): Promise<number | null> {
  if (cities.length === 0) {
    showError("No hay ciudades registradas.");
    return null;
  }

  showCityList(cities);
  const answer = (await ask(input, prompt)).trim();
  console.log();
  const index = Number(answer) - 1;

  if (!Number.isInteger(index) || index < 0 || index >= cities.length) {
    showError("Número de ciudad no válido.");
    return null;
  }

  return index;
}
