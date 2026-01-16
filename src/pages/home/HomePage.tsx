import { SearchBar } from "../../widgets/search-bar";
import { FavoritesList } from "../../widgets/favorites-list";
import { MyLocationCard } from "../../widgets/my-location-card";
import { SelectedPreview } from "../../widgets/selected-preview";
import { SelectedPlaceCard } from "../../widgets/selected-place-card";
import { useState } from "react";
import type { CoordsLatLon, Place } from "../../entities/place/model/types";
import { geocodePlace } from "../../features/geocode-place/api/geocodePlace";

export function HomePage() {
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

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Weather</div>
        <div className="text-sm text-white/60">검색 · 현재 위치 · 즐겨찾기</div>
      </header>

      <SearchBar
        onSelect={(place: Place) => {
          setSelectedLabel(place.label);
          setGeocodeStatus("loading");
          setGeocodeMessage(undefined);
          setSelectedCoords(undefined);

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

      {selectedLabel || geocodeStatus !== "idle" ? (
        <SelectedPlaceCard
          label={selectedLabel ?? "선택한 장소"}
          coords={selectedCoords}
          resolvingStatus={geocodeStatus}
          resolvingMessage={geocodeMessage}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 space-y-6">
          <MyLocationCard />
          <FavoritesList />
        </div>
        <div className="min-w-0 lg:pt-[34px]">
          <SelectedPreview
            coords={selectedCoords}
            resolvingStatus={geocodeStatus}
            resolvingMessage={geocodeMessage}
          />
        </div>
      </div>
    </div>
  );
}
