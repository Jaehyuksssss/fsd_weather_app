export type CoordsLatLon = {
  lat: number;
  lon: number;
};

export type Place = {
  placeId: string;
  label: string;
  coords?: CoordsLatLon;
};

function normalizeLabelForId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export function buildPlaceId(label: string): string {
  const base = normalizeLabelForId(label);
  return base.length > 0 ? base : "place";
}
