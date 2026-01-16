import { Card, SectionTitle } from "../../../shared/ui";

type SelectedPreviewData = {
  name: string;
  temperature: number;
  condition: string;
};

const dummySelected: SelectedPreviewData = {
  name: "Seoul",
  temperature: 22,
  condition: "Cloudy",
};

export function SelectedPreview() {
  return (
    <section className="space-y-3">
      <SectionTitle title="Preview" subtitle="선택한 장소" />
      <Card className="overflow-hidden p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">{dummySelected.name}</div>
            <div className="mt-1 text-xs text-slate-600">
              {dummySelected.condition}
            </div>
          </div>
          <div className="text-4xl font-semibold tracking-tight">
            {dummySelected.temperature}°
          </div>
        </div>

        <div className="mt-4">
          <div className="h-40 w-full rounded-2xl border border-black/10 bg-black/[0.03] p-3">
            <div className="h-full w-full rounded-xl bg-black/[0.03]" />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <div className="text-[11px] text-slate-600">습도</div>
              <div className="mt-1 text-sm font-semibold">73%</div>
            </div>
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <div className="text-[11px] text-slate-600">바람</div>
              <div className="mt-1 text-sm font-semibold">1 m/s</div>
            </div>
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <div className="text-[11px] text-slate-600">강수</div>
              <div className="mt-1 text-sm font-semibold">0 mm</div>
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
