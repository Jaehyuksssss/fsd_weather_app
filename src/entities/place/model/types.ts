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
  return (
    label
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      // allow unicode letters/numbers (e.g., Korean), plus hyphen
      .replace(/[^\p{L}\p{N}-]/gu, "")
  );
}

export function buildPlaceId(label: string): string {
  const base = normalizeLabelForId(label);
  return base.length > 0 ? base : "place";
}
