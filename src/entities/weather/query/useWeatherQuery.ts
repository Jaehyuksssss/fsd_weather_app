import { useQuery } from "@tanstack/react-query";

import { getOpenMeteoWeather } from "../api/getOpenMeteoWeather";
import type { WeatherModel } from "../model/types";

type LatLonInput = {
  lat: number;
  lon: number;
};

export function useWeatherQueryResult(input?: LatLonInput) {
  return useQuery({
    queryKey: ["open-meteo-weather", input?.lat, input?.lon],
    enabled: Boolean(input),
    queryFn: () => getOpenMeteoWeather(input as LatLonInput),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    retry: false,
  });
}

export function useWeatherQuery(input?: LatLonInput): WeatherModel | null {
  return useWeatherQueryResult(input).data ?? null;
}
