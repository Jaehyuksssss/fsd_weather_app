import type { ReactNode } from "react";

import type { CoordsLatLon } from "../../../entities/place/model/types";
import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { EmptyState, ErrorState } from "../../../shared/ui";

type SelectedPlaceInlineProps = {
  label: string;
  coords?: CoordsLatLon;
  resolvingStatus: "idle" | "loading" | "error" | "success";
  resolvingMessage?: string;
  actions?: ReactNode;
};

export function SelectedPlaceInline({
  label,
  coords,
  resolvingStatus,
  resolvingMessage,
  actions,
}: SelectedPlaceInlineProps) {
  const weatherQuery = useWeatherQueryResult(coords);
  const weather = weatherQuery.data;

  if (resolvingStatus === "loading") {
    return <div className="text-sm text-slate-700">장소 좌표 찾는 중...</div>;
  }

  if (resolvingStatus === "error") {
    return (
      <ErrorState
        title="장소 좌표 변환 실패"
        description={resolvingMessage ?? "선택한 장소를 찾지 못했습니다."}
      />
    );
  }

  if (!coords) {
    return (
      <EmptyState
        title="선택된 장소가 없습니다."
        description="검색 결과에서 하나를 선택해 주세요."
      />
    );
  }

  if (weatherQuery.isLoading) {
    return <div className="text-sm text-slate-700">날씨 불러오는 중...</div>;
  }

  if (weatherQuery.isError) {
    return (
      <ErrorState
        title="날씨 연동 실패"
        description={
          weatherQuery.error instanceof Error
            ? weatherQuery.error.message
            : undefined
        }
        onRetry={() => weatherQuery.refetch()}
      />
    );
  }

  if (!weather) {
    return <EmptyState title="해당 장소의 정보가 제공되지 않습니다." />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-900">{label}</div>
          <div className="mt-1 text-xs text-slate-600"></div>
          <div className="mt-2 text-xs text-slate-600">
            최고 {weather.maxTempC}° · 최저 {weather.minTempC}°
          </div>
        </div>
        <div className="text-4xl font-semibold tracking-tight text-slate-900">
          {weather.currentTempC}°
        </div>
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  );
}
