import type { TemperatureUnit } from "../types/Settings";
import { saveTemperatureUnit } from "../storage/settingsStorage";

export async function configureTemperatureUnit(unit: TemperatureUnit): Promise<void> {
  await saveTemperatureUnit(unit);
}
