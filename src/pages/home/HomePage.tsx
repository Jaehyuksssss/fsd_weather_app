import { SearchBar } from "../../widgets/search-bar";
import { FavoritesList } from "../../widgets/favorites-list";
import { MyLocationCard } from "../../widgets/my-location-card";
import { SelectedPreview } from "../../widgets/selected-preview";
import { SelectedPlaceInline } from "../../widgets/selected-place-card";
import { useState } from "react";
import type { CoordsLatLon, Place } from "../../entities/place/model/types";
import { buildPlaceId } from "../../entities/place/model/types";
import { geocodePlace } from "../../features/geocode-place/api/geocodePlace";
import { useFavorites } from "../../entities/favorite/model/useFavorites";

export function HomePage() {
  const [searchClearRequestId, setSearchClearRequestId] = useState(0);
  const [selectedCoords, setSelectedCoords] = useState<
    CoordsLatLon | undefined
  >(undefined);
  const [selectedLabel, setSelectedLabel] = useState<string | undefined>(
    undefined
  );
  const [geocodeStatus, setGeocodeStatus] = useState<
    "idle" | "loading" | "error" | "success"
  >("idle");
  const [geocodeMessage, setGeocodeMessage] = useState<string | undefined>(
    undefined
  );
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | undefined>(
    undefined
  );
  const [favoriteActionMessage, setFavoriteActionMessage] = useState<
    string | undefined
  >(undefined);

  const favorites = useFavorites();

  const resolvedSelectedPlaceId =
    selectedLabel && selectedLabel.length > 0
      ? selectedPlaceId ?? buildPlaceId(selectedLabel)
      : undefined;
  const selectedIsFavorite = resolvedSelectedPlaceId
    ? favorites.isFavorite(resolvedSelectedPlaceId)
    : false;

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Weather</div>
        <div className="text-sm text-white/60">검색 · 현재 위치 · 즐겨찾기</div>
      </header>

      <SearchBar
        clearRequestId={searchClearRequestId}
        onClear={() => {
          setSelectedCoords(undefined);
          setSelectedLabel(undefined);
          setSelectedPlaceId(undefined);
          setGeocodeStatus("idle");
          setGeocodeMessage(undefined);
          setFavoriteActionMessage(undefined);
        }}
        panelOpen={Boolean(selectedLabel) || geocodeStatus !== "idle"}
        panel={
          selectedLabel || geocodeStatus !== "idle" ? (
            <SelectedPlaceInline
              label={selectedLabel ?? "선택한 장소"}
              coords={selectedCoords}
              resolvingStatus={geocodeStatus}
              resolvingMessage={geocodeMessage}
              actions={
                selectedCoords && selectedLabel ? (
                  <div className="flex items-center justify-end gap-2">
                    {selectedIsFavorite ? (
                      <div className="text-sm font-medium text-slate-600">
                        이미 추가 된 장소에요
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-sm font-medium text-slate-700 hover:bg-black/10"
                        onClick={() => {
                          const placeId =
                            resolvedSelectedPlaceId ??
                            buildPlaceId(selectedLabel);
                          const res = favorites.addFavorite({
                            placeId,
                            label: selectedLabel,
                            coords: selectedCoords,
                          });
                          if (!res.ok) {
                            setFavoriteActionMessage(
                              res.reason === "MAX"
                                ? "즐겨찾기는 최대 6개까지 가능합니다."
                                : "이미 추가 된 장소에요."
                            );
                            return;
                          }

                          setFavoriteActionMessage(undefined);
                          setSearchClearRequestId((prev) => prev + 1);
                        }}
                      >
                        즐겨찾기 추가
                      </button>
                    )}
                  </div>
                ) : null
              }
            />
          ) : null
        }
        onSelect={(place: Place) => {
          setSelectedLabel(place.label);
          setSelectedPlaceId(place.placeId);
          setGeocodeStatus("loading");
          setGeocodeMessage(undefined);
          setSelectedCoords(undefined);
          setFavoriteActionMessage(undefined);

          geocodePlace(place.label)
            .then((coords) => {
              if (!coords) {
                setGeocodeStatus("error");
                setGeocodeMessage("선택한 장소를 찾지 못했습니다.");
                return;
              }
              setSelectedCoords(coords);
              setGeocodeStatus("success");
            })
            .catch((e: unknown) => {
              const message = e instanceof Error ? e.message : String(e);
              setGeocodeStatus("error");
              setGeocodeMessage(`장소 좌표 변환 실패 (${message})`);
            });
        }}
      />

      {favoriteActionMessage ? (
        <div className="-mt-2 text-sm font-medium text-white/70">
          {favoriteActionMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <MyLocationCard />
        </div>
        <div className="min-w-0">
          <SelectedPreview
            coords={selectedCoords}
            label={selectedLabel}
            resolvingStatus={geocodeStatus}
            resolvingMessage={geocodeMessage}
          />
        </div>
      </div>

      <div className="min-w-0">
        <FavoritesList
          favorites={favorites.favorites}
          selectedPlaceId={selectedPlaceId}
          onSelect={(fav) => {
            setSelectedLabel(fav.alias ?? fav.label);
            setSelectedCoords(fav.coords);
            setSelectedPlaceId(fav.placeId);
            setGeocodeStatus("success");
            setGeocodeMessage(undefined);
          }}
          onRemove={(placeId) => favorites.removeFavorite(placeId)}
          onUpdateAlias={(placeId, alias) =>
            favorites.updateAlias(placeId, alias)
          }
        />
      </div>
    </div>
  );
}
