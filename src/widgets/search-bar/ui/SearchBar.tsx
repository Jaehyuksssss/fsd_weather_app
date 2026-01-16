import type { ReactNode } from "react";
import { useId, useMemo, useRef, useState } from "react";

import { buildPlaceId, type Place } from "../../../entities/place/model/types";
import { useKoreaDistrictSuggestions } from "../../../entities/place/lib/useKoreaDistrictSuggestions";
import { Card } from "../../../shared/ui";

type SearchBarProps = {
  className?: string;
  onSelect?: (place: Place) => void;
  /**
   * 검색 결과 미리보기(선택된 장소 요약 등)를 SearchBar 카드 내부에 "접히는 패널"로 렌더하기 위한 슬롯.
   */
  panel?: ReactNode;
  /**
   * panel이 열려있는지 여부. false이면 panel 영역을 0 height로 접는다(애니메이션).
   */
  panelOpen?: boolean;
};

function clampIndex(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function SearchBar({
  className,
  onSelect,
  panel,
  panelOpen,
}: SearchBarProps) {
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

  const isPanelOpen = Boolean(panel) && Boolean(panelOpen);
  const isExpanded = showList || isPanelOpen;

  return (
    <Card
      className={["relative isolate overflow-hidden px-4 py-3", className]
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
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onFocus={() => {
              if (value.trim().length > 0) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (isComposing) return;
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
        </div>
      </div>

      {/* Expandable area (Naver-style): search box "stretches" and contains list/panel inside the same card */}
      <div
        className={[
          "grid transition-[grid-template-rows] duration-200 ease-out",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        ].join(" ")}
      >
        <div className="overflow-hidden">
          {/* full-bleed divider + content (border only, no separated "box") */}
          <div className="-mx-4 border-t border-black/10">
            {showList ? (
              <div id={listboxId} role="listbox">
                <ul className="max-h-[60vh] overflow-auto divide-y divide-black/10">
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
                            "flex w-full items-center justify-between px-4 py-3 text-left text-sm",
                            isActive
                              ? "bg-black/[0.04]"
                              : "hover:bg-black/[0.04]",
                          ].join(" ")}
                          onMouseDown={(ev) => {
                            // prevent blur before click
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
            ) : panel ? (
              <div
                className={[
                  "px-4 py-3 transition-opacity duration-200",
                  isPanelOpen ? "opacity-100" : "opacity-0",
                ].join(" ")}
              >
                {panel}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
