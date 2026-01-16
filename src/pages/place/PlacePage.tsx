import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";

import { findFavoriteByPlaceId } from "../../entities/favorite/model/selectors";
import { useFavorites } from "../../entities/favorite/model/useFavorites";
import { useWeatherQueryResult } from "../../entities/weather/query/useWeatherQuery";
import {
  Card,
  EmptyState,
  ErrorState,
  SectionTitle,
  SwipeScroll,
} from "../../shared/ui";

type RouteParams = {
  placeId?: string;
};

export function PlacePage() {
  const params = useParams<RouteParams>();
  const favorites = useFavorites();

  const placeId = params.placeId ?? "";

  const favorite = useMemo(
    () => findFavoriteByPlaceId(favorites.favorites, placeId),
    [favorites.favorites, placeId]
  );

  const coords = favorite?.coords;
  const weatherQuery = useWeatherQueryResult(coords);
  const weather = weatherQuery.data;

  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [draftAlias, setDraftAlias] = useState("");

  return (
    <div className="space-y-6">
      <SectionTitle title="Detail" subtitle="즐겨찾기 상세" />

      <Card className="p-4">
        {placeId.length === 0 ? (
          <ErrorState
            title="잘못된 경로입니다."
            description="placeId가 없습니다."
          />
        ) : !favorite ? (
          <EmptyState
            title="즐겨찾기에서 해당 장소를 찾지 못했습니다."
            description="즐겨찾기 목록에서 다시 선택해 주세요."
          />
        ) : !coords ? (
          <EmptyState
            title="좌표 정보가 없습니다."
            description="즐겨찾기에서 삭제 후 다시 추가해 주세요."
          />
        ) : weatherQuery.isLoading ? (
          <div className="text-sm text-slate-700">날씨 불러오는 중...</div>
        ) : weatherQuery.isError ? (
          <ErrorState
            title="날씨 연동 실패"
            description={
              weatherQuery.error instanceof Error
                ? weatherQuery.error.message
                : undefined
            }
            onRetry={() => weatherQuery.refetch()}
          />
        ) : weather ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900">
                  {favorite.alias ?? favorite.label}
                </div>
                <div className="mt-1 text-xs text-slate-600">Open-Meteo</div>
                <div className="mt-1 text-xs text-slate-600">
                  최고 {weather.maxTempC}° · 최저 {weather.minTempC}°
                </div>
              </div>
              <div className="text-4xl font-semibold tracking-tight text-slate-900">
                {weather.currentTempC}°
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {isEditingAlias ? (
                  <input
                    value={draftAlias}
                    onChange={(e) => setDraftAlias(e.target.value)}
                    placeholder="별칭"
                    className="h-9 w-full min-w-0 rounded-lg border border-black/10 bg-black/[0.03] px-3 text-sm text-slate-900 placeholder:text-slate-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        favorites.updateAlias(placeId, draftAlias);
                        setIsEditingAlias(false);
                      } else if (e.key === "Escape") {
                        setDraftAlias(favorite.alias ?? "");
                        setIsEditingAlias(false);
                      }
                    }}
                    onBlur={() => {
                      favorites.updateAlias(placeId, draftAlias);
                      setIsEditingAlias(false);
                    }}
                    autoFocus
                  />
                ) : (
                  <button
                    type="button"
                    className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-xs font-medium text-slate-700 hover:bg-black/10"
                    onClick={() => {
                      setDraftAlias(favorite.alias ?? "");
                      setIsEditingAlias(true);
                    }}
                  >
                    별칭 수정
                  </button>
                )}
              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-xs font-medium text-slate-700 hover:bg-black/10"
                onClick={() => favorites.removeFavorite(placeId)}
              >
                즐겨찾기 삭제
              </button>
            </div>

            <div className="text-sm font-semibold text-slate-900">시간대별</div>
            <SwipeScroll
              className="-mx-1 max-w-full px-1 py-1 snap-x snap-mandatory"
              dragClassName="flex min-w-0 gap-2"
            >
              {weather.hourly.slice(0, 12).map((h) => (
                <div
                  key={h.timeISO}
                  className="shrink-0 w-[92px] snap-start rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-center"
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
            </SwipeScroll>
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
