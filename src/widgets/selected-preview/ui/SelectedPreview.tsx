import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { Card, SectionTitle } from "../../../shared/ui";
import { useResolvedLocation } from "../../../features/detect-location/model/useResolvedLocation";
import type { CoordsLatLon } from "../../../entities/place/model/types";

function formatMonthDay(timeISO: string): string {
  // "YYYY-MM-DDTHH:MM" -> "MM/DD"
  const mm = timeISO.slice(5, 7);
  const dd = timeISO.slice(8, 10);
  return `${mm}/${dd}`;
}

function formatTime(timeISO: string): string {
  return timeISO.slice(11, 16);
}

type SelectedPreviewProps = {
  /**
   * 검색 결과 등 "선택된 좌표"가 있으면 해당 좌표로 상세 날씨를 표시한다.
   * 없으면 현재 위치(ResolvedLocation)를 사용한다.
   */
  coords?: CoordsLatLon;
  /**
   * 검색 지오코딩 로딩/실패 UI용 상태.
   */
  resolvingStatus?: "idle" | "loading" | "error" | "success";
  resolvingMessage?: string;
};

export function SelectedPreview({
  coords: overrideCoords,
  resolvingStatus = "idle",
  resolvingMessage,
}: SelectedPreviewProps) {
  const location = useResolvedLocation();
  const coords = overrideCoords ?? location.coords;
  const weatherQuery = useWeatherQueryResult(coords);
  const weather = weatherQuery.data;
  const shouldWaitForLocation =
    !overrideCoords && location.status === "loading";

  return (
    <section className="space-y-3">
      <SectionTitle title="Detail" subtitle="시간대별 기온" />
      <Card className="w-full min-w-0 overflow-hidden p-4">
        {resolvingStatus === "loading" ? (
          <div className="text-sm text-slate-700">장소 좌표 찾는 중...</div>
        ) : resolvingStatus === "error" ? (
          <div className="text-sm text-slate-700">
            {resolvingMessage ?? "선택한 장소를 찾지 못했습니다."}
          </div>
        ) : shouldWaitForLocation ? (
          <div className="text-sm text-slate-700">위치 확인 중...</div>
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
          <div className="-mx-1 max-w-full overflow-x-auto px-1 py-1">
            <div className="flex min-w-0 gap-2">
              {weather.hourly.slice(0, 12).map((h, idx, arr) => {
                const day = h.timeISO.slice(0, 10);
                const prevDay =
                  idx > 0 ? arr[idx - 1]?.timeISO.slice(0, 10) : null;
                const showDay = idx === 0 || day !== prevDay;
                return (
                  <div
                    key={h.timeISO}
                    className="shrink-0 w-[92px] rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2 text-center"
                  >
                    <div
                      className={[
                        "text-[12px] font-semibold leading-4 text-slate-700",
                        showDay ? "" : "opacity-0",
                      ].join(" ")}
                    >
                      {formatMonthDay(h.timeISO)}
                    </div>
                    <div className="mt-1 text-[11px] leading-4 text-slate-600">
                      {formatTime(h.timeISO)}
                    </div>
                    <div className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">
                      {h.tempC}°
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-sm text-slate-700">
            해당 장소의 정보가 제공되지 않습니다.
          </div>
        )}

        {import.meta.env.DEV ? (
          <div className="mt-3 text-[11px] text-slate-600">
            debug: source={overrideCoords ? "search" : "location"} / coords=
            {coords.lat.toFixed(4)},{coords.lon.toFixed(4)} / status=
            {weatherQuery.status}/{weatherQuery.fetchStatus}
          </div>
        ) : null}
      </Card>
    </section>
  );
}
