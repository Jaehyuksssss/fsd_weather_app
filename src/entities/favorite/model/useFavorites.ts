import { useCallback, useEffect, useMemo, useState } from "react";

import type { CoordsLatLon } from "../../place/model/types";
import type { Favorite } from "./types";
import { favoritesRepo } from "../repo/favoritesRepo";

type AddResult = { ok: true } | { ok: false; reason: "MAX" | "DUPLICATE" };

export function useFavorites(): Readonly<{
  favorites: readonly Favorite[];
  isFavorite: (placeId: string) => boolean;
  addFavorite: (input: {
    placeId: string;
    label: string;
    coords: CoordsLatLon;
  }) => AddResult;
  removeFavorite: (placeId: string) => void;
  updateAlias: (placeId: string, alias?: string) => void;
}> {
  const [favorites, setFavorites] = useState<readonly Favorite[]>(() =>
    favoritesRepo.load()
  );

  const reload = useCallback(() => {
    setFavorites(favoritesRepo.load());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== "favorites:v1") return;
      reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [reload]);

  const isFavorite = useCallback(
    (placeId: string) => favorites.some((f) => f.placeId === placeId),
    [favorites]
  );

  const addFavorite = useCallback(
    (input: { placeId: string; label: string; coords: CoordsLatLon }) => {
      const res = favoritesRepo.add({
        placeId: input.placeId,
        label: input.label,
        coords: input.coords,
      });
      reload();
      return res;
    },
    [reload]
  );

  const removeFavorite = useCallback(
    (placeId: string) => {
      favoritesRepo.remove(placeId);
      reload();
    },
    [reload]
  );

  const updateAlias = useCallback(
    (placeId: string, alias?: string) => {
      favoritesRepo.updateAlias(placeId, alias);
      reload();
    },
    [reload]
  );

  return useMemo(
    () => ({ favorites, isFavorite, addFavorite, removeFavorite, updateAlias }),
    [addFavorite, favorites, isFavorite, removeFavorite, updateAlias]
  );
}
