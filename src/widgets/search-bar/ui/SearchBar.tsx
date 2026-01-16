import { useId, useMemo, useRef, useState } from "react";

import { buildPlaceId, type Place } from "../../../entities/place/model/types";
import { useKoreaDistrictSuggestions } from "../../../entities/place/lib/useKoreaDistrictSuggestions";
import { Card } from "../../../shared/ui";

type SearchBarProps = {
  className?: string;
  onSelect?: (place: Place) => void;
};

function clampIndex(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function SearchBar({ className, onSelect }: SearchBarProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isComposing, setIsComposing] = useState(false);

  const { suggestions } = useKoreaDistrictSuggestions(value);

  const showList = isOpen && suggestions.length > 0;
  const clampedActiveIndex = useMemo(() => {
    if (!showList) return -1;
    return clampIndex(activeIndex, 0, suggestions.length - 1);
  }, [activeIndex, showList, suggestions.length]);
  const active = useMemo(() => {
    if (!showList || clampedActiveIndex < 0) return undefined;
    return suggestions[clampedActiveIndex];
  }, [clampedActiveIndex, showList, suggestions]);

  function selectLabel(label: string): void {
    const place: Place = { label, placeId: buildPlaceId(label) };
    onSelect?.(place);
    setValue(label);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  return (
    <Card
      className={[
        "relative isolate px-4 py-3",
        showList ? "z-50" : "z-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <label className="sr-only" htmlFor="search">
        장소 검색
      </label>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-black/10" aria-hidden="true" />
        <div className="relative w-full">
          <input
            ref={inputRef}
            id="search"
            type="search"
            value={value}
            placeholder="도시/구/동을 검색하세요"
            autoComplete="off"
            className="searchbar-input h-10 w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-500 outline-none"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listboxId}
            aria-activedescendant={
              showList && clampedActiveIndex >= 0
                ? `${listboxId}-opt-${clampedActiveIndex}`
                : undefined
            }
            onChange={(e) => {
              setValue(e.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
            onFocus={() => {
              if (value.trim().length > 0) setIsOpen(true);
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onKeyDown={(e) => {
              // 한글 IME 조합 중 Enter/Arrow 처리하면 "…광역시산"처럼 마지막 조합 글자가 덧붙는 문제가 생길 수 있음
              if (
                isComposing ||
                (e.nativeEvent as unknown as { isComposing?: boolean })
                  .isComposing
              ) {
                return;
              }
              if (e.key === "ArrowDown") {
                if (!showList) {
                  setIsOpen(true);
                  return;
                }
                e.preventDefault();
                setActiveIndex(
                  clampIndex(clampedActiveIndex + 1, 0, suggestions.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                if (!showList) return;
                e.preventDefault();
                setActiveIndex(
                  clampIndex(clampedActiveIndex - 1, 0, suggestions.length - 1)
                );
              } else if (e.key === "Enter") {
                if (!showList) return;
                e.preventDefault();
                const item = active ?? suggestions[0];
                if (item) selectLabel(item.label);
              } else if (e.key === "Escape") {
                setIsOpen(false);
                setActiveIndex(-1);
              }
            }}
            onBlur={() => {
              // allow click selection
              setTimeout(() => setIsOpen(false), 100);
            }}
          />

          {showList ? (
            <div
              id={listboxId}
              role="listbox"
              className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-black/10 bg-[#E9E8D4] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
            >
              <ul className="max-h-[60vh] overflow-auto py-1">
                {suggestions.map((item, idx) => {
                  const isActive = idx === clampedActiveIndex;
                  return (
                    <li key={item.raw}>
                      <button
                        id={`${listboxId}-opt-${idx}`}
                        role="option"
                        aria-selected={isActive}
                        type="button"
                        className={[
                          "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                          isActive ? "bg-black/5" : "hover:bg-black/5",
                        ].join(" ")}
                        onMouseDown={(ev) => {
                          ev.preventDefault();
                        }}
                        onMouseEnter={() => setActiveIndex(idx)}
                        onClick={() => selectLabel(item.label)}
                      >
                        <span className="text-slate-900">{item.label}</span>
                        <span className="text-[11px] text-slate-500">
                          Enter
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
