import { useCallback, useEffect, useState } from "react";

const DEFAULT_POSITION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  timeout: 30_000,
  maximumAge: 60_000,
};

const POSITION_OPTIONS_CANDIDATES: readonly PositionOptions[] = [
  // 1) 캐시된 위치가 있으면 빠르게 가져온다 (UX 개선)
  { enableHighAccuracy: false, timeout: 1_500, maximumAge: 10 * 60_000 },
  // 2) 기본 시도
  DEFAULT_POSITION_OPTIONS,
  // 3) 마지막 수단: 정확도↑ + 타임아웃↑
  { enableHighAccuracy: true, timeout: 60_000, maximumAge: 0 },
] as const;

type DetectLocationStatus = "idle" | "loading" | "success" | "error";
type DetectLocationReason =
  | "PERMISSION_DENIED"
  | "TIMEOUT"
  | "UNAVAILABLE"
  | "UNKNOWN";

type CoordsLatLon = {
  lat: number;
  lon: number;
};

export type DetectLocationState = {
  status: DetectLocationStatus;
  coords?: CoordsLatLon;
  reason?: DetectLocationReason;
  /**
   * 디버깅용 상세 정보 (예: 브라우저 에러 메시지/코드).
   * 사용자에게 노출해도 민감정보는 포함되지 않는다.
   */
  details?: string;
  /**
   * Permissions API가 지원되는 경우 geolocation 권한 상태.
   */
  permission?: PermissionState;
};

export type DetectLocationResult = DetectLocationState & {
  refetch: () => void;
};

function mapGeolocationError(
  error: GeolocationPositionError
): DetectLocationReason {
  if (error.code === error.PERMISSION_DENIED) return "PERMISSION_DENIED";
  if (error.code === error.POSITION_UNAVAILABLE) return "UNAVAILABLE";
  if (error.code === error.TIMEOUT) return "TIMEOUT";
  return "UNKNOWN";
}

function formatOptions(opt: PositionOptions): string {
  const high = opt.enableHighAccuracy ? "high" : "low";
  const t = typeof opt.timeout === "number" ? `${opt.timeout}ms` : "-";
  const age = typeof opt.maximumAge === "number" ? `${opt.maximumAge}ms` : "-";
  return `accuracy=${high} timeout=${t} maxAge=${age}`;
}

function getCurrentPositionPromise(
  geolocation: Geolocation,
  options: PositionOptions
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function locateWithRetries(geolocation: Geolocation): Promise<{
  pos: GeolocationPosition;
  attempt: number;
  options: PositionOptions;
}> {
  let lastError: unknown = null;

  for (let i = 0; i < POSITION_OPTIONS_CANDIDATES.length; i++) {
    const options = POSITION_OPTIONS_CANDIDATES[i];
    try {
      const pos = await getCurrentPositionPromise(geolocation, options);
      return { pos, attempt: i + 1, options };
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError;
}

export function useDetectLocation(): DetectLocationResult {
  const geolocation = navigator.geolocation;
  const [permission, setPermission] = useState<PermissionState | undefined>(
    undefined
  );
  const [state, setState] = useState<DetectLocationState>(() => {
    if (!geolocation) {
      return {
        status: "error",
        reason: "UNAVAILABLE",
        details: "navigator.geolocation is not available",
      };
    }
    return { status: "loading" };
  });

  useEffect(() => {
    if (!("permissions" in navigator)) return;
    const perms = navigator.permissions;
    if (!perms?.query) return;

    perms
      .query({ name: "geolocation" })
      .then((result) => {
        setPermission(result.state);
        setState((prev) => ({ ...prev, permission: result.state }));
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const refetch = useCallback(() => {
    if (!geolocation) {
      setState({
        status: "error",
        reason: "UNAVAILABLE",
        details: "navigator.geolocation is not available",
        permission,
      });
      return;
    }

    setState((prev) => ({
      ...prev,
      status: "loading",
      reason: undefined,
      details: undefined,
    }));

    locateWithRetries(geolocation)
      .then(({ pos, attempt, options }) => {
        setState({
          status: "success",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          permission,
          details: `attempt=${attempt} (${formatOptions(options)})`,
        });
      })
      .catch((e: unknown) => {
        if (e && typeof e === "object" && "code" in e) {
          const err = e as GeolocationPositionError;
          setState((prev) => ({
            ...prev,
            status: "error",
            reason: mapGeolocationError(err),
            details:
              typeof err?.message === "string" && err.message.length > 0
                ? `${err.code}: ${err.message}`
                : `${err.code}`,
          }));
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setState((prev) => ({
          ...prev,
          status: "error",
          reason: "UNKNOWN",
          details: `locateWithRetries failed: ${message}`,
        }));
      });
  }, [geolocation, permission]);

  useEffect(() => {
    if (!geolocation) return;

    // Effect 본문에서 setState를 동기 호출하지 않기 위해,
    // 초기 마운트에서는 loading 초기값을 사용하고 "요청"만 수행한다.
    let cancelled = false;

    locateWithRetries(geolocation)
      .then(({ pos, attempt, options }) => {
        if (cancelled) return;
        setState({
          status: "success",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          permission,
          details: `attempt=${attempt} (${formatOptions(options)})`,
        });
      })
      .catch((e: unknown) => {
        if (cancelled) return;

        if (e && typeof e === "object" && "code" in e) {
          const err = e as GeolocationPositionError;
          setState((prev) => ({
            ...prev,
            status: "error",
            reason: mapGeolocationError(err),
            details:
              typeof err?.message === "string" && err.message.length > 0
                ? `${err.code}: ${err.message}`
                : `${err.code}`,
          }));
          return;
        }

        const message = e instanceof Error ? e.message : String(e);
        setState((prev) => ({
          ...prev,
          status: "error",
          reason: "UNKNOWN",
          details: `locateWithRetries failed: ${message}`,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [geolocation, permission]);

  return { ...state, refetch };
}
