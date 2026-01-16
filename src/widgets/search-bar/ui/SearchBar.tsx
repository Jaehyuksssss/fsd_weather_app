import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { buildPlaceId, type Place } from "../../../entities/place/model/types";
import { useKoreaDistrictSuggestions } from "../../../entities/place/lib/useKoreaDistrictSuggestions";
import { recentSearches } from "../../../entities/place/lib/recentSearches";
import { Card } from "../../../shared/ui";

type SearchBarProps = {
  className?: string;
  onSelect?: (place: Place) => void;
  /**
   * 입력값이 비워지는 경우(예: search input의 clear(X) 버튼) 결과/미리보기 상태를 함께 초기화하기 위한 콜백.
   */
  onClear?: () => void;
  /**
   * 외부에서 SearchBar 입력값을 비워야 할 때 사용하는 트리거.
   * 값이 변경될 때마다 내부 입력값을 ""로 리셋하고 onClear를 호출한다.
   */
  clearRequestId?: number;
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
  onClear,
  clearRequestId,
  panel,
  panelOpen,
}: SearchBarProps) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [value, setValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [isComposing, setIsComposing] = useState(false);
  const [recent, setRecent] = useState<readonly string[]>(() =>
    recentSearches.load()
  );

  const { suggestions } = useKoreaDistrictSuggestions(value);

  const trimmed = value.trim();
  const showingRecent = trimmed.length === 0;
  const listItems = useMemo(() => {
    if (showingRecent) {
      return recent.map((label) => ({ key: `recent:${label}`, label }));
    }
    return suggestions.map((s) => ({
      key: `suggestion:${s.raw}`,
      label: s.label,
    }));
  }, [recent, showingRecent, suggestions]);

  const showList = isOpen && listItems.length > 0;
  const clampedActiveIndex = useMemo(() => {
    if (!showList) return -1;
    return clampIndex(activeIndex, 0, listItems.length - 1);
  }, [activeIndex, listItems.length, showList]);
  const active = useMemo(() => {
    if (!showList || clampedActiveIndex < 0) return undefined;
    return listItems[clampedActiveIndex];
  }, [clampedActiveIndex, listItems, showList]);

  function selectLabel(label: string): void {
    const place: Place = { label, placeId: buildPlaceId(label) };
    onSelect?.(place);
    setRecent(recentSearches.add(label));
    setValue(label);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  }

  const isPanelOpen = Boolean(panel) && Boolean(panelOpen);
  const isExpanded = showList || isPanelOpen;

  const lastClearRequestIdRef = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (clearRequestId === undefined) return;
    if (lastClearRequestIdRef.current === undefined) {
      lastClearRequestIdRef.current = clearRequestId;
      return;
    }
    if (lastClearRequestIdRef.current === clearRequestId) return;

    lastClearRequestIdRef.current = clearRequestId;
    const t = window.setTimeout(() => {
      setValue("");
      setIsOpen(false);
      setActiveIndex(-1);
      onClear?.();
      inputRef.current?.focus();
    }, 0);

    return () => window.clearTimeout(t);
  }, [clearRequestId, onClear]);

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
        <div className="grid place-items-center rounded-xl " aria-hidden="true">
          <img
            src="/search.svg"
            alt=""
            className="h-7 w-7 "
            draggable={false}
          />
        </div>
        <div className="relative w-full">
          <input
            ref={inputRef}
            id="search"
            type="search"
            value={value}
            placeholder="도시/구/동을 검색하세요"
            autoComplete="off"
            className="searchbar-input h-10 w-full bg-transparent text-md font-semibold text-slate-900 placeholder:text-slate-500 outline-none"
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
              const nextValue = e.target.value;
              setValue(nextValue);

              if (nextValue.trim().length === 0) {
                // show recent searches when available
                setIsOpen(recent.length > 0);
                setActiveIndex(-1);
                onClear?.();
                return;
              }

              setIsOpen(true);
              setActiveIndex(0);
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            onFocus={() => {
              if (value.trim().length > 0) setIsOpen(true);
              else if (recent.length > 0) setIsOpen(true);
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
                  clampIndex(clampedActiveIndex + 1, 0, listItems.length - 1)
                );
              } else if (e.key === "ArrowUp") {
                if (!showList) return;
                e.preventDefault();
                setActiveIndex(
                  clampIndex(clampedActiveIndex - 1, 0, listItems.length - 1)
                );
              } else if (e.key === "Enter") {
                if (!showList) return;
                e.preventDefault();
                const item = active ?? listItems[0];
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
                <ul className="max-h-[min(60vh,576px)] overflow-auto divide-y divide-black/10">
                  {listItems.map((item, idx) => {
                    const isActive = idx === clampedActiveIndex;
                    return (
                      <li key={item.key}>
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
