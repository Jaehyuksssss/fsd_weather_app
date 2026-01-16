import type { CoordsLatLon } from "../../../entities/place/model/types";
import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { Card, SectionTitle } from "../../../shared/ui";
import type { ReactNode } from "react";

type SelectedPlaceCardProps = {
  label: string;
  coords?: CoordsLatLon;
  resolvingStatus: "idle" | "loading" | "error" | "success";
  resolvingMessage?: string;
  actions?: ReactNode;
};

export function SelectedPlaceCard({
  label,
  coords,
  resolvingStatus,
  resolvingMessage,
  actions,
}: SelectedPlaceCardProps) {
  const weatherQuery = useWeatherQueryResult(coords);
  const weather = weatherQuery.data;

  return (
    <section className="space-y-3">
      <SectionTitle title="Selected" subtitle="검색 결과" />
      <Card className="p-4">
        {resolvingStatus === "loading" ? (
          <div className="text-sm text-slate-700">장소 좌표 찾는 중...</div>
        ) : resolvingStatus === "error" ? (
          <div className="text-sm text-slate-700">
            {resolvingMessage ?? "선택한 장소를 찾지 못했습니다."}
          </div>
        ) : !coords ? (
          <div className="text-sm text-slate-700">선택된 장소가 없습니다.</div>
        ) : weatherQuery.isLoading ? (
          <div className="text-sm text-slate-700">날씨 불러오는 중...</div>
        ) : weatherQuery.isError ? (
          <div className="text-sm text-slate-700">
            날씨 연동 실패{" "}
            {weatherQuery.error instanceof Error
              ? `(${weatherQuery.error.message})`
              : ""}
          </div>
        ) : weather ? (
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">{label}</div>
              <div className="mt-1 text-xs text-slate-600">Open-Meteo</div>
              <div className="mt-3 text-xs text-slate-600">
                최고 {weather.maxTempC}° · 최저 {weather.minTempC}°
              </div>
            </div>
            <div className="text-4xl font-semibold tracking-tight">
              {weather.currentTempC}°
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-700">
            해당 장소의 정보가 제공되지 않습니다.
          </div>
        )}

        {actions ? <div className="mt-4">{actions}</div> : null}
      </Card>
    </section>
  );
}
