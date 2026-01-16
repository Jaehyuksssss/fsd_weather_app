import type { CoordsLatLon } from "../../../entities/place/model/types";
import { buildQuery, fetchJson } from "../../../shared/api/openMeteoClient";

type NominatimItem = {
  lat: string;
  lon: string;
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseNumber(value: string): number | null {
  const n = Number(value);
  return isNumber(n) ? n : null;
}

function normalizeLabelForQuery(label: string): string {
  return label.replace(/-/g, " ").trim().replace(/\s+/g, " ");
}

function buildUrl(query: string): string {
  // Public Nominatim instance: usage policy applies. We keep queries limited and cache results client-side.
  return `https://nominatim.openstreetmap.org/search${buildQuery({
    q: query,
    format: "json",
    limit: 1,
    countrycodes: "kr",
    "accept-language": "ko",
  })}`;
}

export async function geocodeNominatim(
  label: string
): Promise<CoordsLatLon | null> {
  const q = normalizeLabelForQuery(label);
  if (q.length === 0) return null;

  const url = buildUrl(q);
  const data = await fetchJson<unknown>(url);
  if (!Array.isArray(data)) return null;

  const first = data[0] as NominatimItem | undefined;
  if (!first) return null;

  const lat = parseNumber(first.lat);
  const lon = parseNumber(first.lon);
  if (lat === null || lon === null) return null;

  return { lat, lon };
}
