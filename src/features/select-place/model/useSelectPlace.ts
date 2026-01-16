import { useCallback, useMemo, useState } from "react";

import type { CoordsLatLon, Place } from "../../../entities/place/model/types";
import { buildPlaceId } from "../../../entities/place/model/types";
import { geocodePlace } from "../../geocode-place/api/geocodePlace";

type GeocodeStatus = "idle" | "loading" | "error" | "success";

type FavoritesApi = Readonly<{
  isFavorite: (placeId: string) => boolean;
  addFavorite: (input: {
    placeId: string;
    label: string;
    coords: CoordsLatLon;
  }) => { ok: true } | { ok: false; reason: "MAX" | "DUPLICATE" };
}>;

type SelectPlaceState = Readonly<{
  selectedCoords?: CoordsLatLon;
  selectedLabel?: string;
  selectedPlaceId?: string;
  geocodeStatus: GeocodeStatus;
  geocodeMessage?: string;
  favoriteActionMessage?: string;
  searchClearRequestId: number;
}>;

export function useSelectPlace(): Readonly<{
  state: SelectPlaceState;
  resolvedSelectedPlaceId?: string;
  selectedIsFavorite: (favorites: FavoritesApi) => boolean;
  onSearchClear: () => void;
  onSelectPlace: (place: Place) => void;
  onSelectResolvedPlace: (input: {
    label: string;
    placeId: string;
    coords: CoordsLatLon;
  }) => void;
  onAddSelectedToFavorites: (favorites: FavoritesApi) => void;
}> {
  const [state, setState] = useState<SelectPlaceState>(() => ({
    geocodeStatus: "idle",
    searchClearRequestId: 0,
  }));

  const resolvedSelectedPlaceId = useMemo(() => {
    const label = state.selectedLabel;
    if (!label || label.length === 0) return undefined;
    return state.selectedPlaceId ?? buildPlaceId(label);
  }, [state.selectedLabel, state.selectedPlaceId]);

  const onSearchClear = useCallback(() => {
    setState((prev) => ({
      ...prev,
      selectedCoords: undefined,
      selectedLabel: undefined,
      selectedPlaceId: undefined,
      geocodeStatus: "idle",
      geocodeMessage: undefined,
      favoriteActionMessage: undefined,
    }));
  }, []);

  const onSelectPlace = useCallback((place: Place) => {
    setState((prev) => ({
      ...prev,
      selectedLabel: place.label,
      selectedPlaceId: place.placeId,
      selectedCoords: undefined,
      geocodeStatus: "loading",
      geocodeMessage: undefined,
      favoriteActionMessage: undefined,
    }));

    geocodePlace(place.label)
      .then((coords) => {
        if (!coords) {
          setState((prev) => ({
            ...prev,
            geocodeStatus: "error",
            geocodeMessage: "선택한 장소를 찾지 못했습니다.",
          }));
          return;
        }
        setState((prev) => ({
          ...prev,
          selectedCoords: coords,
          geocodeStatus: "success",
        }));
      })
      .catch((e: unknown) => {
        const message = e instanceof Error ? e.message : String(e);
        setState((prev) => ({
          ...prev,
          geocodeStatus: "error",
          geocodeMessage: `장소 좌표 변환 실패 (${message})`,
        }));
      });
  }, []);

  const onSelectResolvedPlace = useCallback(
    (input: { label: string; placeId: string; coords: CoordsLatLon }) => {
      setState((prev) => ({
        ...prev,
        selectedLabel: input.label,
        selectedPlaceId: input.placeId,
        selectedCoords: input.coords,
        geocodeStatus: "success",
        geocodeMessage: undefined,
        favoriteActionMessage: undefined,
      }));
    },
    []
  );

  const selectedIsFavorite = useCallback(
    (favorites: FavoritesApi) => {
      return resolvedSelectedPlaceId
        ? favorites.isFavorite(resolvedSelectedPlaceId)
        : false;
    },
    [resolvedSelectedPlaceId]
  );

  const onAddSelectedToFavorites = useCallback(
    (favorites: FavoritesApi) => {
      const label = state.selectedLabel;
      const coords = state.selectedCoords;
      const placeId =
        resolvedSelectedPlaceId ??
        (label && label.length > 0 ? buildPlaceId(label) : undefined);

      if (!label || !coords || !placeId) return;
      if (favorites.isFavorite(placeId)) {
        setState((prev) => ({ ...prev, favoriteActionMessage: "이미 즐겨찾기에 있어요." }));
        return;
      }

      const res = favorites.addFavorite({ placeId, label, coords });
      if (!res.ok) {
        setState((prev) => ({
          ...prev,
          favoriteActionMessage:
            res.reason === "MAX"
              ? "즐겨찾기는 최대 6개까지 가능합니다."
              : "이미 즐겨찾기에 있어요.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        favoriteActionMessage: undefined,
        searchClearRequestId: prev.searchClearRequestId + 1,
      }));
    },
    [resolvedSelectedPlaceId, state.selectedCoords, state.selectedLabel]
  );

  return {
    state,
    resolvedSelectedPlaceId,
    selectedIsFavorite,
    onSearchClear,
    onSelectPlace,
    onSelectResolvedPlace,
    onAddSelectedToFavorites,
  };
}


