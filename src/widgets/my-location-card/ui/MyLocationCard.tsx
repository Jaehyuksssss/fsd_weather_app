import { useDetectLocation } from "../../../features/detect-location/model/useDetectLocation";
import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { usePlaceQueryResult } from "../../../entities/place/query/usePlaceQuery";
import { Card, SectionTitle } from "../../../shared/ui";

export function MyLocationCard() {
  const location = useDetectLocation();
  const weatherQuery = useWeatherQueryResult(location.coords);
  const weather = weatherQuery.data;
  const placeQuery = usePlaceQueryResult(location.coords);
  const place = placeQuery.data;

  return (
    <section className="space-y-3">
      <SectionTitle title="My Location" subtitle="현재 위치 기반" />
      <Card className="p-4">
        {location.status === "loading" || location.status === "idle" ? (
          <div className="text-sm text-slate-700">위치 확인 중...</div>
        ) : location.status === "error" ? (
          <div className="text-sm text-slate-700">
            위치 확인 실패 ({location.reason ?? "UNKNOWN"})
          </div>
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
              <div className="text-sm font-semibold">
                {place?.label ??
                  (location.coords
                    ? `${location.coords.lat.toFixed(
                        4
                      )}, ${location.coords.lon.toFixed(4)}`
                    : "현재 위치")}
              </div>
              <div className="mt-1 text-xs text-slate-600">
                {placeQuery.isLoading
                  ? "위치명 불러오는 중..."
                  : placeQuery.isError
                  ? "위치명 불러오기 실패"
                  : "Open-Meteo"}
              </div>
              <div className="mt-3 text-xs text-slate-600">
                H:{weather.maxTempC}° L:{weather.minTempC}°
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
      </Card>
    </section>
  );
}
