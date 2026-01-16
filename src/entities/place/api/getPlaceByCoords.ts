import { buildPlaceId, type CoordsLatLon, type Place } from "../model/types";
import { buildQuery, fetchJson } from "../../../shared/api/openMeteoClient";

type BigDataCloudReverseResponse = {
  city?: string;
  locality?: string;
  principalSubdivision?: string; // 시/도
  countryName?: string;
};

function buildReverseGeocodingUrl(coords: CoordsLatLon): string {
  // Reverse geocoding without API key
  // https://www.bigdatacloud.com/geocoding-apis/free-reverse-geocode-to-city-api
  return `https://api.bigdatacloud.net/data/reverse-geocode-client${buildQuery({
    latitude: coords.lat,
    longitude: coords.lon,
    localityLanguage: "ko",
  })}`;
}

function buildLabel(result: BigDataCloudReverseResponse): string {
  const primary = result.city ?? result.locality;
  const parts = [primary, result.principalSubdivision].filter(
    (v): v is string => typeof v === "string" && v.length > 0
  );
  const unique = Array.from(new Set(parts));
  return unique.join(", ");
}

export async function getPlaceByCoords(
  coords: CoordsLatLon
): Promise<Place | null> {
  const url = buildReverseGeocodingUrl(coords);
  const data = await fetchJson<BigDataCloudReverseResponse>(url);

  const label = buildLabel(data);
  if (label.length === 0) return null;

  return {
    placeId: buildPlaceId(label),
    label,
    coords,
  };
}
