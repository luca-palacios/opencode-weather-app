import readline from "node:readline/promises";
import { cyan, green, red, underline, yellow } from "./colors";
import { obtenerPronostico } from "./forecast";
import { cargarConfiguracion, guardarConfiguracion } from "./storage";
import type {
  AppConfig,
  Coordinates,
  CurrentWeatherResponse,
  GeocodingResponse,
  TemperatureUnit,
} from "./types";

// Estado global para manejar la unidad de temperatura
let unidadTemperatura: TemperatureUnit = "C";
let ciudades: string[] = [];
let ciudadDefault: string | null = null;

// Interfaz readline global
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para obtener coordenadas de la ciudad
async function obtenerCoordenadas(nombreCiudad: string): Promise<Coordinates> {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${nombreCiudad}&count=1&language=es&format=json`,
  );
  const data = (await response.json()) as GeocodingResponse;
  const resultado = data.results?.[0];
  if (resultado) {
    return {
      latitude: resultado.latitude,
      longitude: resultado.longitude,
    };
  } else {
    throw new Error("Ciudad no encontrada");
  }
}

// Función para obtener el clima basado en coordenadas
async function obtenerClima({ latitude, longitude }: Coordinates) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`,
  );
  if (!response.ok) {
    throw new Error("No se pudo conectar con la API");
  }
  const data = (await response.json()) as CurrentWeatherResponse;
  return data.current;
}

// Función para ajustar la unidad de temperatura
async function ajustarUnidadTemperatura() {
  console.log(cyan("Selecciona la unidad de temperatura:"));
  console.log("1. Celsius (°C)");
  console.log("2. Fahrenheit (°F)");

  const respuesta = (await rl.question("Ingresa tu elección (1 o 2): ")).trim();
  console.log();
  const nuevaUnidad = respuesta === "1" ? "C" : respuesta === "2" ? "F" : null;

  if (!nuevaUnidad) {
    console.log(red("Opción no válida."));
    return;
  }

  unidadTemperatura = nuevaUnidad;
  const unidad = nuevaUnidad === "C" ? "Celsius (°C)" : "Fahrenheit (°F)";
  console.log(green(`Unidad de temperatura ajustada a ${unidad}.`));
}

// Función para agregar ciudad
async function agregarCiudad() {
  const ciudad = (await rl.question("Ingrese el nombre de la ciudad a agregar: ")).trim();
  console.log();
  try {
    await obtenerCoordenadas(ciudad);
    const nuevasCiudades = [...ciudades, ciudad];
    await guardarConfiguracion({
      cities: nuevasCiudades,
      defaultCity: ciudadDefault,
    });
    ciudades.push(ciudad);
    console.log(green(`Ciudad ${ciudad} agregada exitosamente.`));
  } catch (error) {
    console.log(red(error instanceof Error ? error.message : String(error)));
  }
}

// Función para eliminar ciudad
async function eliminarCiudad() {
  if (ciudades.length === 0) {
    console.log(red("No hay ciudades para eliminar."));
    return;
  }

  console.log("Ciudades registradas:");
  ciudades.forEach((ciudad, index) => {
    console.log(`${index + 1}. ${ciudad}`);
  });

  const numero = await rl.question("Ingrese el número de la ciudad a eliminar: ");
  console.log();
  const index = parseInt(numero, 10) - 1;
  if (index >= 0 && index < ciudades.length) {
    const ciudadEliminada = ciudades[index]!;
    const nuevasCiudades = ciudades.filter((_, ciudadIndex) => ciudadIndex !== index);
    const nuevaCiudadDefault = ciudadDefault === ciudadEliminada ? null : ciudadDefault;

    try {
      await guardarConfiguracion({
        cities: nuevasCiudades,
        defaultCity: nuevaCiudadDefault,
      });
    } catch (error) {
      console.log(red(error instanceof Error ? error.message : String(error)));
      return;
    }

    ciudades = nuevasCiudades;
    ciudadDefault = nuevaCiudadDefault;
    console.log(green(`Ciudad ${ciudadEliminada} eliminada exitosamente.`));
  } else {
    console.log(red("Número de ciudad no válido."));
  }
}

// Función para mostrar el clima de la ciudad
async function mostrarClima(ciudad: string) {
  try {
    const coords = await obtenerCoordenadas(ciudad);
    const clima = await obtenerClima(coords);
    const temperatura = unidadTemperatura === "F"
      ? (clima.temperature_2m * 9) / 5 + 32
      : clima.temperature_2m;
    console.log(
      `El clima actual en ${ciudad} es: ${yellow(temperatura.toFixed(1))} °${unidadTemperatura}`,
    );
  } catch (error) {
    console.log(red(error instanceof Error ? error.message : String(error)));
  }
}

async function mostrarPronostico() {
  if (ciudades.length === 0) {
    console.log(red("No hay ciudades registradas."));
    return;
  }

  console.log("Ciudades registradas:");
  ciudades.forEach((ciudad, index) => {
    console.log(`${index + 1}. ${ciudad}`);
  });

  const respuesta = await rl.question("Seleccione la ciudad para ver el pronóstico: ");
  console.log();
  const index = Number(respuesta.trim()) - 1;

  if (!Number.isInteger(index) || index < 0 || index >= ciudades.length) {
    console.log(red("Número de ciudad no válido."));
    return;
  }

  const ciudad = ciudades[index]!;

  try {
    const coords = await obtenerCoordenadas(ciudad);
    const pronostico = await obtenerPronostico(
      coords.latitude,
      coords.longitude,
      unidadTemperatura,
    );

    console.log(cyan(`Pronóstico de 7 días para ${ciudad}:`));
    const dateFormatter = new Intl.DateTimeFormat("es", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });

    for (const dia of pronostico) {
      const fecha = dateFormatter.format(new Date(`${dia.date}T00:00:00Z`));
      const temperaturas = yellow(
        `Mín. ${dia.minTemperature.toFixed(1)}° / Máx. ${dia.maxTemperature.toFixed(1)}°${unidadTemperatura}`,
      );
      console.log(`${fecha}: ${temperaturas}`);
    }
  } catch (error) {
    console.log(red(error instanceof Error ? error.message : String(error)));
  }
}

// Función para mostrar el clima de todas las ciudades
async function mostrarClimaTodas() {
  if (ciudades.length === 0) {
    console.log(red("No hay ciudades registradas."));
    return;
  }

  for (const ciudad of ciudades) {
    await mostrarClima(ciudad);
  }
}

// Función para establecer ciudad default
async function establecerCiudadDefault() {
  if (ciudades.length === 0) {
    console.log(red("No hay ciudades registradas para establecer como default."));
    return;
  }

  console.log("Ciudades registradas:");
  ciudades.forEach((ciudad, index) => {
    console.log(`${index + 1}. ${ciudad}`);
  });

  const numero = await rl.question(
    "Ingrese el número de la ciudad a establecer como default: ",
  );
  console.log();
  const index = parseInt(numero, 10) - 1;
  if (index >= 0 && index < ciudades.length) {
    const nuevaCiudadDefault = ciudades[index]!;

    try {
      await guardarConfiguracion({
        cities: ciudades,
        defaultCity: nuevaCiudadDefault,
      });
      ciudadDefault = nuevaCiudadDefault;
      console.log(green(`Ciudad default establecida a ${ciudadDefault}.`));
    } catch (error) {
      console.log(red(error instanceof Error ? error.message : String(error)));
    }
  } else {
    console.log(red("Número de ciudad no válido."));
  }
}

// Función para manejar la selección de opción
const manejarOpcion = async (opcion: string): Promise<boolean> => {
  switch (opcion) {
    case "1":
      if (ciudadDefault) {
        await mostrarClima(ciudadDefault);
      } else {
        console.log(red("No se ha establecido una ciudad default."));
      }
      break;
    case "2":
      await mostrarClimaTodas();
      break;
    case "3":
      await agregarCiudad();
      break;
    case "4":
      await eliminarCiudad();
      break;
    case "5":
      await establecerCiudadDefault();
      break;
    case "6":
      await mostrarPronostico();
      break;
    case "8":
      await ajustarUnidadTemperatura();
      break;
    case "9":
      console.log(green("Saliendo de la aplicación..."));
      return false;
    default:
      console.log(red("Opción no válida."));
  }
  return true;
};

// Menú de opciones
function mostrarMenu() {
  const celsius = unidadTemperatura === "C" ? `°${underline("C")}` : "°C";
  const fahrenheit = unidadTemperatura === "F" ? `°${underline("F")}` : "°F";

  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan("════════════════════════════════════════"));
  console.log(cyan("  1. Clima de ciudad default"));
  console.log(cyan(`  2. Clima de todas las ciudades (${ciudades.length})`));
  console.log(cyan("  3. Buscar y agregar ciudad"));
  console.log(cyan("  4. Eliminar ciudad"));
  console.log(cyan("  5. Establecer ciudad default"));
  console.log(cyan("  6. Pronóstico de 7 días"));
  console.log(cyan(`  8. Ajustes de unidad de temperatura (${celsius} / ${fahrenheit})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan("════════════════════════════════════════"));
}

// Ejecución principal
async function main() {
  try {
    const config: AppConfig = await cargarConfiguracion();
    ciudades = config.cities;
    ciudadDefault = config.defaultCity;

    while (true) {
      mostrarMenu();
      console.log();
      const opcion = (await rl.question("Selecciona una opción: ")).trim();
      console.log();
      const continuar = await manejarOpcion(opcion);
      if (!continuar) break;
      console.log();
    }
  } catch (error) {
    console.log(red(error instanceof Error ? error.message : String(error)));
    process.exitCode = 1;
  } finally {
    rl.close();
  }
}

main();
