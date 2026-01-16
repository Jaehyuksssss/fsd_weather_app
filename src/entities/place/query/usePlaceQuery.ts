import { useQuery } from "@tanstack/react-query";

import type { CoordsLatLon, Place } from "../model/types";
import { getPlaceByCoords } from "../api/getPlaceByCoords";

export function usePlaceQueryResult(coords?: CoordsLatLon) {
  return useQuery({
    queryKey: ["place-reverse", coords?.lat, coords?.lon],
    enabled: Boolean(coords),
    queryFn: () => getPlaceByCoords(coords as CoordsLatLon),
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    retry: false,
  });
}

export function usePlaceQuery(coords?: CoordsLatLon): Place | null {
  return usePlaceQueryResult(coords).data ?? null;
}


