import { Card, SectionTitle } from "../../../shared/ui";

type FavoriteItem = {
  id: string;
  name: string;
  temperature: number;
  condition: string;
  min: number;
  max: number;
  isSelected?: boolean;
};

const dummyFavorites: FavoriteItem[] = [
  {
    id: "seoul",
    name: "Seoul",
    temperature: 22,
    condition: "Cloudy",
    min: 15,
    max: 29,
    isSelected: true,
  },
  {
    id: "busan",
    name: "Busan",
    temperature: 18,
    condition: "Clear",
    min: 13,
    max: 24,
  },
];

export function FavoritesList() {
  return (
    <section className="space-y-3">
      <SectionTitle title="Favorites" subtitle="최대 6개" />
      <div className="space-y-3">
        {dummyFavorites.map((item) => (
          <Card
            key={item.id}
            className={[
              "px-4 py-3",
              item.isSelected
                ? "ring-2 ring-sky-500/25 border-sky-500/25"
                : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="mt-1 text-xs text-slate-600">
                  {item.condition}
                </div>
                <div className="mt-3 text-[11px] text-slate-600">
                  H:{item.max}° L:{item.min}°
                </div>
              </div>
              <div className="text-3xl font-semibold tracking-tight">
                {item.temperature}°
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
