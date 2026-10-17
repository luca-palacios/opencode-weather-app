import type { MenuOption } from "../types/MenuOption";
import type { TemperatureUnit } from "../types/Settings";
import { cyan, underline } from "../utils/colors";
import { ask } from "./input";

type PromptInput = {
  question(prompt: string): Promise<string>;
};

const MENU_OPTIONS = new Set<MenuOption>(["1", "2", "3", "4", "5", "6", "8", "9"]);

export function showMenu(cityCount: number, unit: TemperatureUnit): void {
  const celsius = unit === "C" ? `°${underline("C")}` : "°C";
  const fahrenheit = unit === "F" ? `°${underline("F")}` : "°F";

  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("  1. Clima de ciudad default"));
  console.log(cyan(`  2. Clima de todas las ciudades (${cityCount})`));
  console.log(cyan("  3. Buscar y agregar ciudad"));
  console.log(cyan("  4. Eliminar ciudad"));
  console.log(cyan("  5. Establecer ciudad default"));
  console.log(cyan("  6. Pronóstico de 7 días"));
  console.log(cyan(`  8. Ajustes de unidad de temperatura (${celsius} / ${fahrenheit})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan("════════════════════════════════════════"));
}

export async function readMenuOption(input: PromptInput): Promise<MenuOption | null> {
  const answer = (await ask(input, "Selecciona una opción: ")).trim();
  return MENU_OPTIONS.has(answer as MenuOption) ? answer as MenuOption : null;
}
