import { useEffect, useMemo, useRef, useState } from "react";

import type { CoordsLatLon } from "../../../entities/place/model/types";
import { getIpApproxCoords } from "../../../shared/api/ipGeoClient";
import {
  readJsonFromLocalStorage,
  writeJsonToLocalStorage,
} from "../../../shared/lib/localStorageJson";
import { useDetectLocation } from "./useDetectLocation";

type LocationSource = "geolocation" | "ip" | "last_saved" | "default_seoul";

export type ResolvedLocationState = Readonly<{
  status: "loading" | "success";
  coords: CoordsLatLon;
  source: LocationSource;
  note?: string;
}>;

const LAST_COORDS_STORAGE_KEY = "weather:lastCoords:v1";
const SEOUL_COORDS: CoordsLatLon = { lat: 37.5665, lon: 126.978 };

function isCoordsLatLon(value: unknown): value is CoordsLatLon {
  if (!value || typeof value !== "object") return false;
  const v = value as { lat?: unknown; lon?: unknown };
  return (
    typeof v.lat === "number" &&
    Number.isFinite(v.lat) &&
    typeof v.lon === "number" &&
    Number.isFinite(v.lon)
  );
}

export function useResolvedLocation(): ResolvedLocationState {
  const geo = useDetectLocation();

  const lastSaved = useMemo(
    () =>
      readJsonFromLocalStorage<CoordsLatLon>(
        LAST_COORDS_STORAGE_KEY,
        isCoordsLatLon
      ),
    []
  );

  const [ipCoords, setIpCoords] = useState<CoordsLatLon | null>(null);
  const ipAttemptedRef = useRef(false);

  // 1) geolocation 성공 시 최우선 적용 + 저장
  useEffect(() => {
    if (geo.status !== "success" || !geo.coords) return;
    writeJsonToLocalStorage(LAST_COORDS_STORAGE_KEY, geo.coords);
  }, [geo.coords, geo.status]);

  // 2) geolocation 실패/거부 시 IP 기반 대략 추정 시도 (한 번)
  useEffect(() => {
    if (geo.status !== "error") return;
    if (ipAttemptedRef.current) return;
    ipAttemptedRef.current = true;

    let cancelled = false;

    getIpApproxCoords()
      .then((coords) => {
        if (cancelled) return;
        setIpCoords(coords);
        writeJsonToLocalStorage(LAST_COORDS_STORAGE_KEY, coords);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [geo.status]);

  if (geo.status === "success" && geo.coords) {
    return { status: "success", coords: geo.coords, source: "geolocation" };
  }
  if (ipCoords) {
    return {
      status: "success",
      coords: ipCoords,
      source: "ip",
      note: "IP 기반 대략 위치",
    };
  }
  if (lastSaved) {
    return { status: "success", coords: lastSaved, source: "last_saved" };
  }

  return {
    status:
      geo.status === "loading" || geo.status === "idle" ? "loading" : "success",
    coords: SEOUL_COORDS,
    source: "default_seoul",
  };
}
