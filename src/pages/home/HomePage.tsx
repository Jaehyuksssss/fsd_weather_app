import { SearchBar } from "../../widgets/search-bar";
import { FavoritesList } from "../../widgets/favorites-list";
import { MyLocationCard } from "../../widgets/my-location-card";
import { SelectedPreview } from "../../widgets/selected-preview";
import { SelectedPlaceInline } from "../../widgets/selected-place-card";
import { useFavorites } from "../../entities/favorite/model/useFavorites";
import { useSelectPlace } from "../../features/select-place/model/useSelectPlace";

export function HomePage() {
  const favorites = useFavorites();
  const selectPlace = useSelectPlace();
  const { state } = selectPlace;

  const selectedIsFavorite = selectPlace.selectedIsFavorite(favorites);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Weather</div>
        <div className="text-sm text-white/60">검색 · 현재 위치 · 즐겨찾기</div>
      </header>

      <SearchBar
        clearRequestId={state.searchClearRequestId}
        onClear={selectPlace.onSearchClear}
        panelOpen={
          Boolean(state.selectedLabel) || state.geocodeStatus !== "idle"
        }
        panel={
          state.selectedLabel || state.geocodeStatus !== "idle" ? (
            <SelectedPlaceInline
              label={state.selectedLabel ?? "선택한 장소"}
              coords={state.selectedCoords}
              resolvingStatus={state.geocodeStatus}
              resolvingMessage={state.geocodeMessage}
              actions={
                state.selectedCoords && state.selectedLabel ? (
                  <div className="flex items-center justify-end gap-2">
                    {selectedIsFavorite ? (
                      <div className="text-sm font-medium text-slate-600">
                        이미 추가 된 장소에요
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-sm font-medium text-slate-700 hover:bg-black/10"
                        onClick={() =>
                          selectPlace.onAddSelectedToFavorites(favorites)
                        }
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
        onSelect={selectPlace.onSelectPlace}
      />

      {state.favoriteActionMessage ? (
        <div className="-mt-2 text-sm font-medium text-white/70">
          {state.favoriteActionMessage}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className="min-w-0">
          <MyLocationCard />
        </div>
        <div className="min-w-0">
          <SelectedPreview
            coords={state.selectedCoords}
            label={state.selectedLabel}
            resolvingStatus={state.geocodeStatus}
            resolvingMessage={state.geocodeMessage}
          />
        </div>
      </div>

      <div className="min-w-0">
        <FavoritesList
          favorites={favorites.favorites}
          selectedPlaceId={state.selectedPlaceId}
          onSelect={(fav) => {
            selectPlace.onSelectResolvedPlace({
              label: fav.alias ?? fav.label,
              placeId: fav.placeId,
              coords: fav.coords,
            });
          }}
          onRemove={(placeId) => favorites.removeFavorite(placeId)}
          onUpdateAlias={(placeId, alias) =>
            favorites.updateAlias(placeId, alias)
          }
          onReorder={(placeId, toIndex) =>
            favorites.reorderFavorite(placeId, toIndex)
          }
        />
      </div>
    </div>
  );
}
