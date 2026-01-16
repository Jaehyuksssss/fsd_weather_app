import { Card } from "../../../shared/ui";

type SearchBarProps = {
  className?: string;
};

export function SearchBar({ className }: SearchBarProps) {
  return (
    <Card className={["px-4 py-3", className].filter(Boolean).join(" ")}>
      <label className="sr-only" htmlFor="search">
        장소 검색
      </label>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-black/10" aria-hidden="true" />
        <input
          id="search"
          type="search"
          placeholder="도시/구/동을 검색하세요"
          autoComplete="off"
          className="searchbar-input h-10 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
        />
      </div>
    </Card>
  );
}
