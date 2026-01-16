import { useEffect, useState } from "react";

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
};

function mapGeolocationError(
  error: GeolocationPositionError
): DetectLocationReason {
  if (error.code === error.PERMISSION_DENIED) return "PERMISSION_DENIED";
  if (error.code === error.POSITION_UNAVAILABLE) return "UNAVAILABLE";
  if (error.code === error.TIMEOUT) return "TIMEOUT";
  return "UNKNOWN";
}

export function useDetectLocation(): DetectLocationState {
  const isSupported = "geolocation" in navigator;
  const [state, setState] = useState<DetectLocationState>(() =>
    isSupported
      ? { status: "loading" }
      : { status: "error", reason: "UNAVAILABLE" }
  );

  useEffect(() => {
    let cancelled = false;
    if (!isSupported) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setState({
          status: "success",
          coords: { lat: pos.coords.latitude, lon: pos.coords.longitude },
        });
      },
      (err) => {
        if (cancelled) return;
        setState({ status: "error", reason: mapGeolocationError(err) });
      },
      { enableHighAccuracy: false, timeout: 30_000, maximumAge: 60_000 }
    );

    return () => {
      cancelled = true;
    };
  }, [isSupported]);

  return state;
}
