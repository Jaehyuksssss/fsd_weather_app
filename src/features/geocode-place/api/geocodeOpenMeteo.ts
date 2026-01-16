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
  const base = label.replace(/-/g, " ").trim().replace(/\s+/g, " ");
  // korea_districts 데이터는 종종 "전주시덕진구"처럼 행정단위가 붙어있음 → 사람이 검색하는 형태로 분리
  // 예: "전주시덕진구" -> "전주시 덕진구"
  return base.replace(/([도시군구읍면동리])(?=[가-힣])/g, "$1 ");
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
    readJsonFromLocalStorage<Record<string, CoordsLatLon>>(
      STORAGE_KEY,
      isCoordsMap
    ) ?? {};
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

function pickBestResult(
  results: readonly GeocodingResult[]
): GeocodingResult | null {
  const kr = results.find((r) => r.country_code === "KR");
  return kr ?? results[0] ?? null;
}

function buildCandidateQueries(label: string): readonly string[] {
  const q = normalizeLabelForQuery(label).replace(/\s+/g, " ").trim();
  if (q.length === 0) return [];

  const tokens = q.split(" ").filter(Boolean);
  const candidates: string[] = [];

  // 1) full label
  candidates.push(q);
  // 2) drop top-level region (e.g., "전북특별자치도")
  if (tokens.length >= 2) candidates.push(tokens.slice(1).join(" "));
  // 3) last 2 tokens (e.g., "전주시 덕진구")
  if (tokens.length >= 2) candidates.push(tokens.slice(-2).join(" "));
  // 4) last token (e.g., "덕진구")
  if (tokens.length >= 1) candidates.push(tokens.slice(-1).join(" "));

  // dedupe, keep order
  return Array.from(new Set(candidates));
}

export async function geocodeOpenMeteo(
  label: string
): Promise<CoordsLatLon | null> {
  const cached = readCached(label);
  if (cached) return cached;

  const queries = buildCandidateQueries(label);
  if (queries.length === 0) return null;

  for (const query of queries) {
    const url = buildGeocodingUrl(query);
    const data = await fetchJson<GeocodingResponse>(url);
    const results = data.results ?? [];
    if (results.length === 0) continue;

    const picked = pickBestResult(results);
    if (!picked) continue;
    if (!isNumber(picked.latitude) || !isNumber(picked.longitude)) continue;

    const coords: CoordsLatLon = {
      lat: picked.latitude,
      lon: picked.longitude,
    };
    writeCached(label, coords);
    return coords;
  }

  return null;
}

export const geocodeCache = {
  read: readCached,
  write: writeCached,
} as const;
