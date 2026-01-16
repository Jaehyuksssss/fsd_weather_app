import { Card, EmptyState, SectionTitle, Skeleton } from "../../../shared/ui";

function SearchBarPlaceholder() {
  return (
    <Card className="px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/10" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-40" />
          <div className="mt-2">
            <Skeleton className="h-3 w-64 max-w-full" />
          </div>
        </div>
      </div>
    </Card>
  );
}

function MyLocationPlaceholder() {
  return (
    <section className="space-y-3">
      <SectionTitle title="My Location" subtitle="현재 위치 기반 날씨" />
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-44" />
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-56" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-end">
            <Skeleton className="h-10 w-20" />
            <div className="mt-2">
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.04] p-2"
            >
              <Skeleton className="h-3 w-10" />
              <div className="mt-2">
                <Skeleton className="h-5 w-12" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}

function FavoritesPlaceholder() {
  return (
    <section className="space-y-3">
      <SectionTitle title="Favorites" subtitle="최대 6개" />
      <Card className="p-6">
        <EmptyState
          title="즐겨찾기가 비어있어요"
          description="장소를 검색해 즐겨찾기에 추가해보세요."
        />
      </Card>
    </section>
  );
}

export function HomePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <SectionTitle title="Weather" subtitle="검색/현재 위치/즐겨찾기" />
        <SearchBarPlaceholder />
      </div>
      <MyLocationPlaceholder />
      <FavoritesPlaceholder />
    </div>
  );
}
