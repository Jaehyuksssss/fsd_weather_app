import type { Favorite } from "./types";

export function findFavoriteByPlaceId(
  favorites: readonly Favorite[],
  placeId: string
): Favorite | null {
  if (!placeId) return null;
  return favorites.find((f) => f.placeId === placeId) ?? null;
}
