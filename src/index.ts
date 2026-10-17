import readline from "node:readline/promises";
import { addCity } from "./actions/addCity";
import { configureTemperatureUnit } from "./actions/configureTemperatureUnit";
import { getForecast } from "./actions/getForecast";
import { getWeather } from "./actions/getWeather";
import { listCities } from "./actions/listCities";
import { removeCity } from "./actions/removeCity";
import { setDefaultCity } from "./actions/setDefaultCity";
import { loadConfig } from "./storage/configStorage";
import type { City } from "./types/City";
import type { AppConfig, TemperatureUnit } from "./types/Settings";
import type { MenuOption } from "./types/MenuOption";
import { cyan } from "./utils/colors";
import { ask, selectCityIndex } from "./presentation/input";
import { readMenuOption, showMenu } from "./presentation/menu";
import {
  showCurrentWeather,
  showError,
  showForecast,
  showSuccess,
} from "./presentation/output";

async function showWeatherForCity(city: City, unit: TemperatureUnit): Promise<void> {
  try {
    showCurrentWeather(await getWeather(city, unit));
  } catch (error) {
    showError(errorMessage(error));
  }
}

async function selectCity(
  input: readline.Interface,
  config: AppConfig,
  prompt: string,
): Promise<City | null> {
  const cityOptions = listCities(config.cities);
  const index = await selectCityIndex(input, cityOptions, prompt);
  return index === null ? null : cityOptions[index]!.city;
}

async function handleOption(
  option: MenuOption,
  input: readline.Interface,
  config: AppConfig,
): Promise<{ config: AppConfig; shouldContinue: boolean }> {
  switch (option) {
    case "1":
      if (!config.defaultCity) {
        showError("No se ha establecido una ciudad default.");
      } else {
        await showWeatherForCity(config.defaultCity, config.temperatureUnit);
      }
      break;
    case "2":
      if (config.cities.length === 0) {
        showError("No hay ciudades registradas.");
        break;
      }
      for (const city of config.cities) {
        await showWeatherForCity(city, config.temperatureUnit);
      }
      break;
    case "3": {
      const city = (await ask(input, "Ingrese el nombre de la ciudad a agregar: ")).trim();
      console.log();
      try {
        config = await addCity(city, config);
        showSuccess(`Ciudad ${city} agregada exitosamente.`);
      } catch (error) {
        showError(errorMessage(error));
      }
      break;
    }
    case "4": {
      const index = await selectCityIndex(
        input,
        listCities(config.cities),
        "Ingrese el número de la ciudad a eliminar: ",
      );
      if (index === null) break;
      const removedCity = config.cities[index]!;
      try {
        config = await removeCity(index, config);
        showSuccess(`Ciudad ${removedCity} eliminada exitosamente.`);
      } catch (error) {
        showError(errorMessage(error));
      }
      break;
    }
    case "5": {
      const index = await selectCityIndex(
        input,
        listCities(config.cities),
        "Ingrese el número de la ciudad a establecer como default: ",
      );
      if (index === null) break;
      try {
        config = await setDefaultCity(index, config);
        showSuccess(`Ciudad default establecida a ${config.defaultCity}.`);
      } catch (error) {
        showError(errorMessage(error));
      }
      break;
    }
    case "6": {
      const city = await selectCity(
        input,
        config,
        "Seleccione la ciudad para ver el pronóstico: ",
      );
      if (city === null) break;
      try {
        showForecast(await getForecast(city, config.temperatureUnit));
      } catch (error) {
        showError(errorMessage(error));
      }
      break;
    }
    case "8": {
      console.log(cyan("Selecciona la unidad de temperatura:"));
      console.log("1. Celsius (°C)");
      console.log("2. Fahrenheit (°F)");
      const answer = (await ask(input, "Ingresa tu elección (1 o 2): ")).trim();
      console.log();
      const unit = answer === "1" ? "C" : answer === "2" ? "F" : null;

      if (!unit) {
        showError("Opción no válida.");
        break;
      }

      try {
        await configureTemperatureUnit(unit);
        config = { ...config, temperatureUnit: unit };
        const label = unit === "C" ? "Celsius (°C)" : "Fahrenheit (°F)";
        showSuccess(`Unidad de temperatura ajustada a ${label}.`);
      } catch (error) {
        showError(errorMessage(error));
      }
      break;
    }
    case "9":
      showSuccess("Saliendo de la aplicación...");
      return { config, shouldContinue: false };
  }

  return { config, shouldContinue: true };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function main(): Promise<void> {
  let config: AppConfig;
  try {
    config = await loadConfig();
  } catch (error) {
    showError(errorMessage(error));
    process.exitCode = 1;
    return;
  }

  const input = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      showMenu(config.cities.length, config.temperatureUnit);
      console.log();
      const option = await readMenuOption(input);
      console.log();

      if (!option) {
        showError("Opción no válida.");
        console.log();
        continue;
      }

      const result = await handleOption(option, input, config);
      config = result.config;
      if (!result.shouldContinue) break;
      console.log();
    }
  } finally {
    input.close();
  }
}

main();
