import type { CoordsLatLon } from "../../../entities/place/model/types";
import { buildQuery, fetchJson } from "../../../shared/api/openMeteoClient";
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from "../../../shared/lib/localStorageJson";

type GeocodingResult = {
  latitude: number;
  longitude: number;
  country_code?: string;
};

type GeocodingResponse = {
  results?: GeocodingResult[];
};

const STORAGE_KEY = "geocode:coordsByLabel:v1";

function normalizeLabelForQuery(label: string): string {
  return label.replace(/-/g, " ").trim();
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCoordsLatLon(value: unknown): value is CoordsLatLon {
  if (!value || typeof value !== "object") return false;
  const v = value as { lat?: unknown; lon?: unknown };
  return isNumber(v.lat) && isNumber(v.lon);
}

function isCoordsMap(value: unknown): value is Record<string, CoordsLatLon> {
  if (!value || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  for (const coords of Object.values(obj)) {
    if (!isCoordsLatLon(coords)) return false;
  }
  return true;
}

function readCached(label: string): CoordsLatLon | null {
  const map = readJsonFromLocalStorage<Record<string, CoordsLatLon>>(
    STORAGE_KEY,
    isCoordsMap
  );
  if (!map) return null;
  return map[label] ?? null;
}

function writeCached(label: string, coords: CoordsLatLon): void {
  const prev =
    readJsonFromLocalStorage<Record<string, CoordsLatLon>>(STORAGE_KEY, isCoordsMap) ??
    {};
  writeJsonToLocalStorage(STORAGE_KEY, { ...prev, [label]: coords });
}

function buildGeocodingUrl(query: string): string {
  return `https://geocoding-api.open-meteo.com/v1/search${buildQuery({
    name: query,
    language: "ko",
    count: 10,
    format: "json",
  })}`;
}

function pickBestResult(results: readonly GeocodingResult[]): GeocodingResult | null {
  const kr = results.find((r) => r.country_code === "KR");
  return kr ?? results[0] ?? null;
}

export async function geocodeOpenMeteo(label: string): Promise<CoordsLatLon | null> {
  const cached = readCached(label);
  if (cached) return cached;

  const query = normalizeLabelForQuery(label);
  if (query.length === 0) return null;

  const url = buildGeocodingUrl(query);
  const data = await fetchJson<GeocodingResponse>(url);
  const results = data.results ?? [];
  if (results.length === 0) return null;

  const picked = pickBestResult(results);
  if (!picked) return null;
  if (!isNumber(picked.latitude) || !isNumber(picked.longitude)) return null;

  const coords: CoordsLatLon = { lat: picked.latitude, lon: picked.longitude };
  writeCached(label, coords); // success only
  return coords;
}


