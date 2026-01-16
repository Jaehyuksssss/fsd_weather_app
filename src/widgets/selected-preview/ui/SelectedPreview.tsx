import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { Card, SectionTitle } from "../../../shared/ui";
import { useResolvedLocation } from "../../../features/detect-location/model/useResolvedLocation";

function formatHourLabel(timeISO: string): string {
  // Open-Meteo hourly time is usually "YYYY-MM-DDTHH:MM"
  return timeISO.slice(11, 16);
}

export function SelectedPreview() {
  const location = useResolvedLocation();
  const weatherQuery = useWeatherQueryResult(location.coords);
  const weather = weatherQuery.data;

  return (
    <section className="space-y-3">
      <SectionTitle title="Detail" subtitle="시간대별 기온" />
      <Card className="overflow-hidden p-4">
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
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1">
            {weather.hourly.slice(0, 12).map((h) => (
              <div
                key={h.timeISO}
                className="shrink-0 rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2"
              >
                <div className="text-[11px] text-slate-600">
                  {formatHourLabel(h.timeISO)}
                </div>
                <div className="mt-1 text-sm font-semibold">{h.tempC}°</div>
              </div>
            ))}
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
