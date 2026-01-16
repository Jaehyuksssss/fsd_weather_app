import { Link, useParams } from "react-router-dom";

import { favoritesRepo } from "../../entities/favorite/repo/favoritesRepo";
import { useWeatherQueryResult } from "../../entities/weather/query/useWeatherQuery";
import { Card, EmptyState, ErrorState, SectionTitle } from "../../shared/ui";

type RouteParams = {
  placeId?: string;
};

export function PlacePage() {
  const params = useParams<RouteParams>();
  const placeId = params.placeId ?? "";

  if (!placeId) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Detail" subtitle="즐겨찾기 상세" />
        <ErrorState
          title="잘못된 경로입니다."
          description="placeId가 없습니다."
        />
        <Link className="text-sm underline text-white/80" to="/">
          홈으로
        </Link>
      </div>
    );
  }

  const favorites = favoritesRepo.load();
  const favorite = favorites.find((f) => f.placeId === placeId) ?? null;

  if (!favorite) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Detail" subtitle="즐겨찾기 상세" />
        <EmptyState
          title="즐겨찾기에서 해당 장소를 찾지 못했습니다."
          description="즐겨찾기 목록에서 다시 선택해 주세요."
        />
        <Link className="text-sm underline text-white/80" to="/">
          홈으로
        </Link>
      </div>
    );
  }

  const coords = favorite.coords;
  if (!coords) {
    return (
      <div className="space-y-6">
        <SectionTitle title="Detail" subtitle="즐겨찾기 상세" />
        <EmptyState title="좌표 정보가 없습니다." />
        <Link className="text-sm underline text-white/80" to="/">
          홈으로
        </Link>
      </div>
    );
  }

  const weatherQuery = useWeatherQueryResult(coords);
  const weather = weatherQuery.data;

  return (
    <div className="space-y-6">
      <SectionTitle
        title={favorite.alias ?? favorite.label}
        subtitle="즐겨찾기 상세"
      />

      <Card className="p-4">
        {weatherQuery.isLoading ? (
          <div className="text-sm text-slate-700">날씨 불러오는 중...</div>
        ) : weatherQuery.isError ? (
          <ErrorState
            title="날씨 연동 실패"
            description={
              weatherQuery.error instanceof Error
                ? weatherQuery.error.message
                : undefined
            }
          />
        ) : weather ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">현재</div>
                <div className="mt-1 text-xs text-slate-600">
                  H:{weather.maxTempC}° L:{weather.minTempC}°
                </div>
              </div>
              <div className="text-4xl font-semibold tracking-tight text-slate-900">
                {weather.currentTempC}°
              </div>
            </div>

            <div className="text-sm font-semibold text-slate-900">시간대별</div>
            <div className="-mx-1 max-w-full overflow-x-auto px-1 py-1">
              <div className="flex min-w-0 gap-2">
                {weather.hourly.slice(0, 12).map((h) => (
                  <div
                    key={h.timeISO}
                    className="shrink-0 w-[92px] rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-center"
                  >
                    <div className="text-[12px] font-semibold leading-4 text-slate-700">
                      {h.timeISO.slice(5, 10).replace("-", "/")}
                    </div>
                    <div className="mt-1 text-[11px] leading-4 text-slate-600">
                      {h.timeISO.slice(11, 16)}
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {h.tempC}°
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="해당 장소의 정보가 제공되지 않습니다." />
        )}
      </Card>

      <Link className="text-sm underline text-white/80" to="/">
        홈으로
      </Link>
    </div>
  );
}
