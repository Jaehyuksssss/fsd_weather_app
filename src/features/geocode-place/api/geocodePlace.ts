import type { CoordsLatLon } from "../../../entities/place/model/types";

import { geocodeNominatim } from "./geocodeNominatim";
import { geocodeCache, geocodeOpenMeteo } from "./geocodeOpenMeteo";

export async function geocodePlace(label: string): Promise<CoordsLatLon | null> {
  const cached = geocodeCache.read(label);
  if (cached) return cached;

  // 1) Open-Meteo (primary)
  const viaOpenMeteo = await geocodeOpenMeteo(label);
  if (viaOpenMeteo) return viaOpenMeteo;

  // 2) Nominatim (fallback)
  const viaNominatim = await geocodeNominatim(label);
  if (viaNominatim) {
    geocodeCache.write(label, viaNominatim);
    return viaNominatim;
  }

  return null;
}


