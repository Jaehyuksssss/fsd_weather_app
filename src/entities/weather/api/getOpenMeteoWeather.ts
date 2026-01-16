import type { WeatherModel } from "../model/types";
import {
  buildOpenMeteoUrl,
  fetchJson,
} from "../../../shared/api/openMeteoClient";

type LatLonInput = {
  lat: number;
  lon: number;
};

type OpenMeteoForecastResponse = {
  current?: {
    time: string;
    temperature_2m?: number;
  };
  hourly?: {
    time: string[];
    temperature_2m?: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_min?: number[];
    temperature_2m_max?: number[];
  };
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function zipHourly(
  time: string[],
  temp?: number[]
): Array<{ timeISO: string; tempC: number }> {
  if (!temp) return [];
  const out: Array<{ timeISO: string; tempC: number }> = [];
  const len = Math.min(time.length, temp.length);
  for (let i = 0; i < len; i += 1) {
    const t = time[i];
    const v = temp[i];
    if (typeof t === "string" && isNumber(v))
      out.push({ timeISO: t, tempC: v });
  }
  return out;
}

function pickTodayMinMax(daily?: OpenMeteoForecastResponse["daily"]): {
  min?: number;
  max?: number;
} {
  const min = daily?.temperature_2m_min?.[0];
  const max = daily?.temperature_2m_max?.[0];
  return {
    min: isNumber(min) ? min : undefined,
    max: isNumber(max) ? max : undefined,
  };
}

function findHourlyTempForCurrent(
  currentTimeISO: string | undefined,
  hourly: OpenMeteoForecastResponse["hourly"] | undefined
): number | undefined {
  if (!currentTimeISO) return undefined;
  const time = hourly?.time;
  const temp = hourly?.temperature_2m;
  if (!time || !temp) return undefined;

  // hourly time is usually "YYYY-MM-DDTHH:00", current may be "YYYY-MM-DDTHH:MM"
  const hourKey = currentTimeISO.slice(0, 13);
  const len = Math.min(time.length, temp.length);
  for (let i = 0; i < len; i += 1) {
    const t = time[i];
    const v = temp[i];
    if (typeof t === "string" && t.slice(0, 13) === hourKey && isNumber(v)) {
      return v;
    }
  }
  return undefined;
}

function findHourlyStartIndexForNow(
  currentTimeISO: string | undefined,
  hourly: readonly { timeISO: string; tempC: number }[]
): number {
  if (!currentTimeISO) return 0;
  const hourKey = currentTimeISO.slice(0, 13);

  // Prefer exact same hour
  for (let i = 0; i < hourly.length; i += 1) {
    if (hourly[i].timeISO.slice(0, 13) === hourKey) return i;
  }

  // Fallback: first item after current time
  for (let i = 0; i < hourly.length; i += 1) {
    if (hourly[i].timeISO > currentTimeISO) return i;
  }

  return 0;
}

export async function getOpenMeteoWeather(
  input: LatLonInput
): Promise<WeatherModel | null> {
  const url = buildOpenMeteoUrl("/forecast", {
    latitude: input.lat,
    longitude: input.lon,
    current: "temperature_2m",
    hourly: "temperature_2m",
    daily: "temperature_2m_min,temperature_2m_max",
    timezone: "auto",
  });

  const data = await fetchJson<OpenMeteoForecastResponse>(url);

  const hourlyCurrent = findHourlyTempForCurrent(
    data.current?.time,
    data.hourly
  );
  const currentTempC = hourlyCurrent ?? data.current?.temperature_2m;
  if (!isNumber(currentTempC)) return null;

  const hourlyAll = zipHourly(
    data.hourly?.time ?? [],
    data.hourly?.temperature_2m
  );
  const startIdx = findHourlyStartIndexForNow(data.current?.time, hourlyAll);
  const hourly = hourlyAll.slice(startIdx, startIdx + 12);

  const { min, max } = pickTodayMinMax(data.daily);
  const minTempC = min ?? currentTempC;
  const maxTempC = max ?? currentTempC;

  return {
    currentTempC,
    minTempC,
    maxTempC,
    hourly,
  };
}
