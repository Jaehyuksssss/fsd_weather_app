import { SearchBar } from "../../widgets/search-bar";
import { FavoritesList } from "../../widgets/favorites-list";
import { MyLocationCard } from "../../widgets/my-location-card";
import { SelectedPreview } from "../../widgets/selected-preview";

export function HomePage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <div className="text-2xl font-semibold tracking-tight">Weather</div>
        <div className="text-sm text-white/60">검색 · 현재 위치 · 즐겨찾기</div>
      </header>

      <SearchBar />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 space-y-6">
          <MyLocationCard />
          <FavoritesList />
        </div>
        <div className="min-w-0 lg:pt-[34px]">
          <SelectedPreview />
        </div>
      </div>
    </div>
  );
}
