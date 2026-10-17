import readline from "node:readline/promises";
import { cyan, green, red, underline, yellow } from "./colors";

// Estado global para manejar la unidad de temperatura
let unidadTemperatura: "C" | "F" = "C";
let ciudades: string[] = [];
let ciudadDefault: string | null = null;

type GeocodingResponse = {
  results?: Array<{ latitude: number; longitude: number }>;
};

type WeatherResponse = {
  current: { temperature_2m: number };
};

// Interfaz readline global
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Función para obtener coordenadas de la ciudad
async function obtenerCoordenadas(nombreCiudad: string) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${nombreCiudad}&count=1&language=es&format=json`,
  );
  const data = (await response.json()) as GeocodingResponse;
  const resultado = data.results?.[0];
  if (resultado) {
    return {
      lat: resultado.latitude,
      lon: resultado.longitude,
    };
  } else {
    throw new Error("Ciudad no encontrada");
  }
}

// Función para obtener el clima basado en coordenadas
async function obtenerClima(lat: number, lon: number) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`,
  );
  if (!response.ok) {
    throw new Error("No se pudo conectar con la API");
  }
  const data = (await response.json()) as WeatherResponse;
  return data.current;
}

// Función para ajustar la unidad de temperatura
async function ajustarUnidadTemperatura() {
  console.log(cyan("Selecciona la unidad de temperatura:"));
  console.log("1. Celsius (°C)");
  console.log("2. Fahrenheit (°F)");

  const respuesta = (await rl.question("Ingresa tu elección (1 o 2): ")).trim();
  console.log();
  if (respuesta === "1") {
    unidadTemperatura = "C";
    console.log(green("Unidad de temperatura ajustada a Celsius (°C)."));
  } else if (respuesta === "2") {
    unidadTemperatura = "F";
    console.log(green("Unidad de temperatura ajustada a Fahrenheit (°F)."));
  } else {
    console.log(red("Opción no válida."));
  }
}

// Función para agregar ciudad
async function agregarCiudad() {
  const ciudad = (await rl.question("Ingrese el nombre de la ciudad a agregar: ")).trim();
  console.log();
  try {
    await obtenerCoordenadas(ciudad);
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
    const ciudadEliminada = ciudades.splice(index, 1);
    console.log(green(`Ciudad ${ciudadEliminada} eliminada exitosamente.`));
  } else {
    console.log(red("Número de ciudad no válido."));
  }
}

// Función para mostrar el clima de la ciudad
async function mostrarClima(ciudad: string) {
  try {
    const coords = await obtenerCoordenadas(ciudad);
    const clima = await obtenerClima(coords.lat, coords.lon);
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
    ciudadDefault = ciudades[index]!;
    console.log(green(`Ciudad default establecida a ${ciudadDefault}.`));
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
  console.log(cyan(`  8. Ajustes de unidad de temperatura (${celsius} / ${fahrenheit})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan("════════════════════════════════════════"));
}

// Ejecución principal
async function main() {
  try {
    while (true) {
      mostrarMenu();
      console.log();
      const opcion = (await rl.question("Selecciona una opción: ")).trim();
      console.log();
      const continuar = await manejarOpcion(opcion);
      if (!continuar) break;
      console.log();
    }
  } finally {
    rl.close();
  }
}

main();
