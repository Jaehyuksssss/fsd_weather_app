import type { Favorite } from "../model/types";
import type { CoordsLatLon } from "../../place/model/types";

const STORAGE_KEY = "favorites:v1";
const MAX_FAVORITES = 6;

type FavoriteDraft = {
  placeId: string;
  label: string;
  coords: CoordsLatLon;
  alias?: string;
};

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isCoordsLatLon(value: unknown): value is CoordsLatLon {
  if (!value || typeof value !== "object") return false;
  const v = value as { lat?: unknown; lon?: unknown };
  return isNumber(v.lat) && isNumber(v.lon);
}

function isFavorite(value: unknown): value is Favorite {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<Favorite>;
  return (
    typeof v.placeId === "string" &&
    v.placeId.length > 0 &&
    typeof v.label === "string" &&
    v.label.length > 0 &&
    typeof v.createdAt === "string" &&
    v.createdAt.length > 0 &&
    isCoordsLatLon(v.coords)
  );
}

function read(): Favorite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const json: unknown = JSON.parse(raw);
    if (!Array.isArray(json)) return [];
    const items = json.filter(isFavorite);
    return items;
  } catch {
    return [];
  }
}

function write(items: readonly Favorite[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const favoritesRepo = {
  load(): Favorite[] {
    return read();
  },

  save(items: readonly Favorite[]): void {
    write(items);
  },

  add(
    draft: FavoriteDraft
  ): { ok: true } | { ok: false; reason: "MAX" | "DUPLICATE" } {
    const items = read();

    const exists = items.some((f) => f.placeId === draft.placeId);
    if (exists) return { ok: false, reason: "DUPLICATE" };

    if (items.length >= MAX_FAVORITES) return { ok: false, reason: "MAX" };

    const next: Favorite = {
      placeId: draft.placeId,
      label: draft.label,
      alias: draft.alias,
      coords: draft.coords,
      createdAt: new Date().toISOString(),
    };

    write([next, ...items]);
    return { ok: true };
  },

  remove(placeId: string): void {
    const items = read();
    write(items.filter((f) => f.placeId !== placeId));
  },

  updateAlias(placeId: string, alias?: string): void {
    const items = read();
    const next = items.map((f) => {
      if (f.placeId !== placeId) return f;
      const normalized = alias?.trim();
      return {
        ...f,
        alias: normalized && normalized.length > 0 ? normalized : undefined,
      };
    });
    write(next);
  },
} as const;
