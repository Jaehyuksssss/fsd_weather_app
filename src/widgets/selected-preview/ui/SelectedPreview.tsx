import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { Card, SectionTitle } from "../../../shared/ui";
import { useResolvedLocation } from "../../../features/detect-location/model/useResolvedLocation";

function formatMonthDay(timeISO: string): string {
  // "YYYY-MM-DDTHH:MM" -> "MM/DD"
  const mm = timeISO.slice(5, 7);
  const dd = timeISO.slice(8, 10);
  return `${mm}/${dd}`;
}

function formatTime(timeISO: string): string {
  return timeISO.slice(11, 16);
}

export function SelectedPreview() {
  const location = useResolvedLocation();
  const weatherQuery = useWeatherQueryResult(location.coords);
  const weather = weatherQuery.data;

  return (
    <section className="space-y-3">
      <SectionTitle title="Detail" subtitle="시간대별 기온" />
      <Card className="w-full min-w-0 overflow-hidden p-4">
        {location.status === "loading" ? (
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
                        "text-[10px] leading-4 text-slate-500",
                        showDay ? "" : "opacity-0",
                      ].join(" ")}
                    >
                      {formatMonthDay(h.timeISO)}
                    </div>
                    <div className="text-[11px] leading-4 text-slate-600">
                      {formatTime(h.timeISO)}
                    </div>
                    <div className="mt-1 text-sm font-semibold">{h.tempC}°</div>
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
      </Card>
    </section>
  );
}
