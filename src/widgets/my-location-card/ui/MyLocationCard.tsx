import { Card, SectionTitle } from "../../../shared/ui";

type MyLocationWeather = {
  locationName: string;
  temperature: number;
  condition: string;
  min: number;
  max: number;
};

const dummyMyLocation: MyLocationWeather = {
  locationName: "Seongnam-si",
  temperature: 21,
  condition: "Partly Cloudy",
  min: 15,
  max: 29,
};

export function MyLocationCard() {
  return (
    <section className="space-y-3">
      <SectionTitle title="My Location" subtitle="현재 위치 기반" />
      <Card className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {dummyMyLocation.locationName}
            </div>
            <div className="mt-1 text-xs text-slate-600">
              {dummyMyLocation.condition}
            </div>
            <div className="mt-3 text-xs text-slate-600">
              H:{dummyMyLocation.max}° L:{dummyMyLocation.min}°
            </div>
          </div>
          <div className="text-4xl font-semibold tracking-tight">
            {dummyMyLocation.temperature}°
          </div>
        </div>
      </Card>
    </section>
  );
}
