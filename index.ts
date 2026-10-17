import readline from "node:readline/promises";

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
  console.log("Selecciona la unidad de temperatura:");
  console.log("1. Celsius (°C)");
  console.log("2. Fahrenheit (°F)");

  const respuesta = (await rl.question("Ingresa tu elección (1 o 2): ")).trim();
  if (respuesta === "1") {
    unidadTemperatura = "C";
    console.log("Unidad de temperatura ajustada a Celsius (°C).");
  } else if (respuesta === "2") {
    unidadTemperatura = "F";
    console.log("Unidad de temperatura ajustada a Fahrenheit (°F).");
  } else {
    console.log("Opción no válida.");
  }
}

// Función para agregar ciudad
async function agregarCiudad() {
  const ciudad = (await rl.question("Ingrese el nombre de la ciudad a agregar: ")).trim();
  try {
    await obtenerCoordenadas(ciudad);
    ciudades.push(ciudad);
    console.log(`Ciudad ${ciudad} agregada exitosamente.`);
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
  }
}

// Función para eliminar ciudad
async function eliminarCiudad() {
  if (ciudades.length === 0) {
    console.log("No hay ciudades para eliminar.");
    return;
  }

  console.log("Ciudades registradas:");
  ciudades.forEach((ciudad, index) => {
    console.log(`${index + 1}. ${ciudad}`);
  });

  const numero = await rl.question("Ingrese el número de la ciudad a eliminar: ");
  const index = parseInt(numero, 10) - 1;
  if (index >= 0 && index < ciudades.length) {
    const ciudadEliminada = ciudades.splice(index, 1);
    console.log(`Ciudad ${ciudadEliminada} eliminada exitosamente.`);
  } else {
    console.log("Número de ciudad no válido.");
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
      `El clima actual en ${ciudad} es: ${temperatura.toFixed(1)} °${unidadTemperatura}`,
    );
  } catch (error) {
    console.log(error instanceof Error ? error.message : String(error));
  }
}

// Función para mostrar el clima de todas las ciudades
async function mostrarClimaTodas() {
  if (ciudades.length === 0) {
    console.log("No hay ciudades registradas.");
    return;
  }

  for (const ciudad of ciudades) {
    await mostrarClima(ciudad);
  }
}

// Función para establecer ciudad default
async function establecerCiudadDefault() {
  if (ciudades.length === 0) {
    console.log("No hay ciudades registradas para establecer como default.");
    return;
  }

  console.log("Ciudades registradas:");
  ciudades.forEach((ciudad, index) => {
    console.log(`${index + 1}. ${ciudad}`);
  });

  const numero = await rl.question(
    "Ingrese el número de la ciudad a establecer como default: ",
  );
  const index = parseInt(numero, 10) - 1;
  if (index >= 0 && index < ciudades.length) {
    ciudadDefault = ciudades[index]!;
    console.log(`Ciudad default establecida a ${ciudadDefault}.`);
  } else {
    console.log("Número de ciudad no válido.");
  }
}

// Función para manejar la selección de opción
const manejarOpcion = async (opcion: string): Promise<boolean> => {
  switch (opcion) {
    case "1":
      if (ciudadDefault) {
        await mostrarClima(ciudadDefault);
      } else {
        console.log("No se ha establecido una ciudad default.");
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
      console.log("Saliendo de la aplicación...");
      return false;
    default:
      console.log("Opción no válida.");
  }
  return true;
};

// Menú de opciones
function mostrarMenu() {
  const celsius = unidadTemperatura === "C" ? "°\x1b[4mC\x1b[0m" : "°C";
  const fahrenheit = unidadTemperatura === "F" ? "°\x1b[4mF\x1b[0m" : "°F";

  console.log("════════════════════════════════════════");
  console.log("         WEATHER CLI");
  console.log("════════════════════════════════════════");
  console.log("  1. Clima de ciudad default");
  console.log(`  2. Clima de todas las ciudades (${ciudades.length})`);
  console.log("  3. Buscar y agregar ciudad");
  console.log("  4. Eliminar ciudad");
  console.log("  5. Establecer ciudad default");
  console.log(`  8. Ajustes de unidad de temperatura (${celsius} / ${fahrenheit})`);
  console.log("  9. Salir");
  console.log("════════════════════════════════════════");
}

// Ejecución principal
async function main() {
  try {
    while (true) {
      mostrarMenu();
      const opcion = (await rl.question("Selecciona una opción: ")).trim();
      const continuar = await manejarOpcion(opcion);
      if (!continuar) break;
    }
  } finally {
    rl.close();
  }
}

main();
