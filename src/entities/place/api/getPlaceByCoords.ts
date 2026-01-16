import { buildPlaceId, type CoordsLatLon, type Place } from "../model/types";
import { buildQuery, fetchJson } from "../../../shared/api/openMeteoClient";

type OpenMeteoReverseResult = {
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  latitude: number;
  longitude: number;
};

type OpenMeteoReverseResponse = {
  results?: OpenMeteoReverseResult[];
};

function buildReverseGeocodingUrl(coords: CoordsLatLon): string {
  return `https://geocoding-api.open-meteo.com/v1/reverse${buildQuery({
    latitude: coords.lat,
    longitude: coords.lon,
    language: "ko",
    count: 1,
  })}`;
}

function buildLabel(result: OpenMeteoReverseResult): string {
  const parts = [result.name, result.admin1].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  const unique = Array.from(new Set(parts));
  return unique.join(", ");
}

export async function getPlaceByCoords(coords: CoordsLatLon): Promise<Place | null> {
  const url = buildReverseGeocodingUrl(coords);
  const data = await fetchJson<OpenMeteoReverseResponse>(url);

  const first = data.results?.[0];
  if (!first || typeof first.name !== "string" || first.name.length === 0) return null;

  const label = buildLabel(first);
  return {
    placeId: buildPlaceId(label),
    label,
    coords,
  };
}


