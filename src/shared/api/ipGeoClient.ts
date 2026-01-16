import { fetchJson } from "./openMeteoClient";

export type IpGeoCoords = Readonly<{
  lat: number;
  lon: number;
}>;

type IpWhoIsResponse = {
  success: boolean;
  latitude?: number;
  longitude?: number;
  message?: string;
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export async function getIpApproxCoords(): Promise<IpGeoCoords> {
  // No API key required
  const data = await fetchJson<IpWhoIsResponse>("https://ipwho.is/");
  if (!data.success) {
    throw new Error(data.message ?? "ipwho.is failed");
  }
  if (!isNumber(data.latitude) || !isNumber(data.longitude)) {
    throw new Error("ipwho.is returned invalid coordinates");
  }
  return { lat: data.latitude, lon: data.longitude };
}
