import type { ReactNode } from "react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

import { buildPlaceId, type Place } from "../../../entities/place/model/types";
import { useKoreaDistrictSuggestions } from "../../../entities/place/lib/useKoreaDistrictSuggestions";
import { recentSearches } from "../../../shared/lib/recentSearches";
import { Card } from "../../../shared/ui";

type SearchBarProps = {
  className?: string;
  onSelect?: (place: Place) => void;
  onClear?: () => void;
  clearRequestId?: number;
  panel?: ReactNode;
  panelOpen?: boolean;
};

function clampIndex(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function clampActiveIndex(value: number, length: number): number {
  if (length <= 0) return -1;
  return clampIndex(value, 0, length - 1);
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
      return recent.map((label) => ({
        key: `recent:${label}`,
        label,
        kind: "recent" as const,
      }));
    }
    return suggestions.map((s) => ({
      key: `suggestion:${s.raw}`,
      label: s.label,
      kind: "suggestion" as const,
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

  const shouldShowPanel = Boolean(panel) && Boolean(panelOpen) && !showList;

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
    <div className={["relative", className].filter(Boolean).join(" ")}>
      <Card className="relative isolate px-4 py-3">
        <label className="sr-only" htmlFor="search">
          장소 검색
        </label>
        <div className="flex items-center gap-3">
          <div
            className="grid place-items-center rounded-xl "
            aria-hidden="true"
          >
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
                  setIsOpen(recent.length > 0);
                  setActiveIndex(-1);
                  onClear?.();
                  return;
                }

                setIsOpen(true);
                setActiveIndex(-1);
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
                    setActiveIndex(0);
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
                  if (!showList || clampedActiveIndex < 0) return;
                  e.preventDefault();
                  const item = active ?? listItems[0];
                  if (item) selectLabel(item.label);
                } else if (e.key === "Escape") {
                  setIsOpen(false);
                  setActiveIndex(-1);
                }
              }}
              onBlur={() => {
                setTimeout(() => setIsOpen(false), 100);
              }}
            />
          </div>
        </div>
        {shouldShowPanel ? (
          <div className="-mx-4 mt-3 border-t border-black/10 px-4 pt-3">
            {panel}
          </div>
        ) : null}
      </Card>

      {showList ? (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-[#E9E8D4] shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          onMouseDown={(e) => {
            e.preventDefault();
          }}
        >
          <div id={listboxId} role="listbox">
            {showingRecent ? (
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="text-[13px] font-semibold text-slate-600">
                  최근 검색어
                </div>
                <button
                  type="button"
                  className="text-[12px] font-medium text-slate-500 hover:text-slate-700"
                  onMouseDown={(ev) => ev.preventDefault()}
                  onClick={() => {
                    recentSearches.clear();
                    setRecent([]);
                    setIsOpen(false);
                    setActiveIndex(-1);
                  }}
                >
                  전체 삭제
                </button>
              </div>
            ) : null}

            <ul className="max-h-[min(40vh,320px)] overflow-auto overscroll-contain px-2 py-2">
              {listItems.map((item, idx) => {
                const isActive = idx === clampedActiveIndex;
                return (
                  <li key={item.key}>
                    <div
                      id={`${listboxId}-opt-${idx}`}
                      role="option"
                      aria-selected={isActive}
                      className="flex w-full items-center gap-3 text-left text-sm"
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      {/* Icon (no hover background) */}
                      <span
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-black/[0.06] text-slate-600"
                        aria-hidden="true"
                      >
                        {item.kind === "recent" ? (
                          <svg
                            viewBox="0 0 20 20"
                            width="14"
                            height="14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M10 16.5a6.5 6.5 0 1 1 0-13 6.5 6.5 0 0 1 0 13Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M10 5.8v4.3l2.6 1.6"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 20 20"
                            width="14"
                            height="14"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M8.7 14.4a5.7 5.7 0 1 1 0-11.4 5.7 5.7 0 0 1 0 11.4Z"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            />
                            <path
                              d="M13 13l4 4"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                            />
                          </svg>
                        )}
                      </span>

                      {/* Hover/active background applies only to the right area (excluding icon). */}
                      <div
                        className={[
                          "flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2",
                          isActive ? "bg-black/10" : "hover:bg-black/10",
                        ].join(" ")}
                      >
                        <button
                          type="button"
                          className="flex min-w-0 flex-1 items-center text-left"
                          onClick={() => selectLabel(item.label)}
                        >
                          <span className="min-w-0 flex-1 truncate text-slate-900">
                            {item.label}
                          </span>
                        </button>

                        {item.kind === "recent" ? (
                          <button
                            type="button"
                            className="ml-auto rounded-md px-2 py-1 text-[12px] font-medium text-slate-500 hover:bg-black/[0.06] hover:text-slate-700"
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => {
                              const next = recentSearches.remove(item.label);
                              setRecent(next);
                              setActiveIndex((prev) =>
                                clampActiveIndex(prev, next.length)
                              );
                              if (
                                next.length === 0 &&
                                value.trim().length === 0
                              ) {
                                setIsOpen(false);
                                setActiveIndex(-1);
                              }
                            }}
                          >
                            삭제
                          </button>
                        ) : (
                          <span className="ml-auto" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
