import { useResolvedLocation } from "../../../features/detect-location/model/useResolvedLocation";
import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { usePlaceQueryResult } from "../../../entities/place/query/usePlaceQuery";
import { Card, SectionTitle } from "../../../shared/ui";

export function MyLocationCard() {
  const location = useResolvedLocation();
  const weatherQuery = useWeatherQueryResult(location.coords);
  const weather = weatherQuery.data;
  const placeQuery = usePlaceQueryResult(location.coords);
  const place = placeQuery.data;

  return (
    <section className="space-y-3">
      <SectionTitle title="My Location" subtitle="현재 위치 기반" />
      <Card className="p-4">
        {location.status === "loading" ? (
          <div className="text-sm text-slate-700">
            <div className="mb-2">위치 확인 중...</div>
            <div className="text-[11px] text-slate-600">
              브라우저 위치 권한 팝업이 떠있는지 확인해 주세요.
            </div>
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
                  : location.source === "ip"
                  ? "대략 위치 (IP 기반)"
                  : ""}
              </div>
              <div className="mt-3 text-sm font-medium text-slate-700">
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
      </Card>
    </section>
  );
}
