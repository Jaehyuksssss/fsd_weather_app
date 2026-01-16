import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import type { Favorite } from "../../../entities/favorite/model/types";
import { useWeatherQueryResult } from "../../../entities/weather/query/useWeatherQuery";
import { Card, EmptyState, SectionTitle } from "../../../shared/ui";

type FavoritesListProps = {
  favorites: readonly Favorite[];
  selectedPlaceId?: string;
  onSelect?: (favorite: Favorite) => void;
  onRemove?: (placeId: string) => void;
  onUpdateAlias?: (placeId: string, alias?: string) => void;
  onReorder?: (placeId: string, toIndex: number) => void;
};

function FavoriteCard({
  favorite,
  isSelected,
  isReorderMode,
  isDraggingAny,
  draggingPlaceId,
  overPlaceId,
  onReorderPointerDown,
  onSelect,
  onRemove,
  onUpdateAlias,
}: {
  favorite: Favorite;
  isSelected: boolean;
  isReorderMode: boolean;
  isDraggingAny: boolean;
  draggingPlaceId: string | null;
  overPlaceId: string | null;
  onReorderPointerDown?: (e: React.PointerEvent, placeId: string) => void;
  onSelect?: (favorite: Favorite) => void;
  onRemove?: (placeId: string) => void;
  onUpdateAlias?: (placeId: string, alias?: string) => void;
}) {
  const weatherQuery = useWeatherQueryResult(favorite.coords);
  const weather = weatherQuery.data;

  const [isEditing, setIsEditing] = useState(false);
  const [draftAlias, setDraftAlias] = useState(favorite.alias ?? "");
  const aliasWrapRef = useRef<HTMLDivElement | null>(null);
  const isDraggingThis = draggingPlaceId === favorite.placeId;
  const isOverThis = overPlaceId === favorite.placeId;

  const saveAndClose = useCallback(() => {
    onUpdateAlias?.(favorite.placeId, draftAlias);
    setIsEditing(false);
  }, [draftAlias, favorite.placeId, onUpdateAlias]);

  useEffect(() => {
    if (!isEditing) return;

    const onPointerDown = (e: PointerEvent) => {
      const wrap = aliasWrapRef.current;
      const target = e.target as Node | null;
      if (!wrap || !target) return;
      if (wrap.contains(target)) return;
      saveAndClose();
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    return () =>
      document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isEditing, saveAndClose]);

  return (
    <Card
      data-favorite-card="true"
      data-placeid={favorite.placeId}
      onPointerDown={(e) => {
        if (!isReorderMode) return;
        if (isEditing) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (
          target?.closest?.("a,button,input,textarea,select,[role='button']")
        ) {
          return;
        }
        onReorderPointerDown?.(e, favorite.placeId);
      }}
      className={[
        "relative px-4 py-3",
        isSelected ? "ring-2 ring-sky-500/25 border-sky-500/25" : undefined,
        isDraggingThis ? "opacity-70" : undefined,
        !isDraggingThis && draggingPlaceId && isOverThis
          ? "ring-2 ring-slate-900/10"
          : undefined,
        isReorderMode && !isEditing
          ? "cursor-grab active:cursor-grabbing"
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Click/hover area: cover the whole card except buttons (buttons are pointer-events-auto). */}
      {!isReorderMode && !isEditing && !isDraggingAny ? (
        <Link
          to={`/place/${favorite.placeId}`}
          aria-label={`상세 보기: ${favorite.alias ?? favorite.label}`}
          className="absolute inset-0 rounded-2xl transition-colors hover:bg-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/40"
          onClick={() => onSelect?.(favorite)}
        />
      ) : null}

      <div className="relative z-10 pointer-events-none">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold">
              {favorite.alias ?? favorite.label}
            </div>
            {favorite.alias ? (
              <div className="mt-0.5 text-[11px] text-slate-500">
                {favorite.label}
              </div>
            ) : null}
            <div className="mt-1 text-xs text-slate-600">
              {weatherQuery.isLoading
                ? "날씨 불러오는 중..."
                : weatherQuery.isError
                ? "연동 실패"
                : ""}
            </div>
            <div className="mt-3 text-sm font-medium text-slate-700">
              {weather ? (
                <>
                  최고 {weather.maxTempC}° · 최저 {weather.minTempC}°
                </>
              ) : (
                <>최고 - · 최저 -</>
              )}
            </div>
          </div>
          <div className="text-3xl font-semibold tracking-tight">
            {weather ? `${weather.currentTempC}°` : "-"}
          </div>
        </div>
      </div>

      {!isReorderMode ? (
        <div className="relative z-10 mt-3 flex items-center justify-between gap-2 pointer-events-auto">
          {isEditing ? (
            <div
              ref={aliasWrapRef}
              className="relative flex min-w-0 flex-1 items-center gap-2"
            >
              <input
                value={draftAlias}
                onChange={(e) => setDraftAlias(e.target.value)}
                placeholder="별칭"
                className="h-9 w-full min-w-0 rounded-lg border border-black/10 bg-black/[0.03] pl-3 pr-9 text-sm text-slate-900 placeholder:text-slate-500 outline-none"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    saveAndClose();
                  } else if (e.key === "Escape") {
                    setDraftAlias(favorite.alias ?? "");
                    setIsEditing(false);
                  }
                }}
                onBlur={saveAndClose}
              />
              {draftAlias.trim().length > 0 ? (
                <button
                  type="button"
                  aria-label="별칭 지우기"
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-slate-500 hover:bg-black/[0.06] hover:text-slate-700"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setDraftAlias("");
                  }}
                >
                  <svg
                    viewBox="0 0 20 20"
                    width="14"
                    height="14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 5l10 10M15 5L5 15"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              ) : null}
            </div>
          ) : (
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-xs font-medium text-slate-700 hover:bg-black/10"
              onClick={() => {
                setDraftAlias(favorite.alias ?? "");
                setIsEditing(true);
              }}
            >
              {favorite.alias && favorite.alias.trim().length > 0
                ? "별칭 수정"
                : "별칭"}
            </button>
          )}
          {!isEditing ? (
            <button
              type="button"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-black/10 bg-black/5 px-3 text-xs font-medium text-slate-700 hover:bg-black/10"
              onClick={() => onRemove?.(favorite.placeId)}
            >
              삭제
            </button>
          ) : null}
        </div>
      ) : (
        <div className="relative z-10 mt-3 text-xs font-medium text-slate-500">
          카드 전체를 드래그해서 순서를 바꿔요.
        </div>
      )}
    </Card>
  );
}

export function FavoritesList({
  favorites,
  selectedPlaceId,
  onSelect,
  onRemove,
  onUpdateAlias,
  onReorder,
}: FavoritesListProps) {
  const dragRef = useRef<{
    placeId: string;
    pointerId: number;
    handleEl: HTMLElement | null;
    moved: boolean;
    startClientX: number;
    startClientY: number;
  } | null>(null);
  const uxRef = useRef<{
    userSelect?: string;
    webkitUserSelect?: string;
  } | null>(null);
  const overPlaceIdRef = useRef<string | null>(null);
  const cleanupDragRef = useRef<(() => void) | null>(null);

  const [draggingPlaceId, setDraggingPlaceId] = useState<string | null>(null);
  const [overPlaceId, setOverPlaceId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);

  const isDraggingAny = draggingPlaceId !== null;

  const stopReorderMode = useCallback(() => {
    cleanupDragRef.current?.();
    cleanupDragRef.current = null;
    dragRef.current = null;
    overPlaceIdRef.current = null;
    setDraggingPlaceId(null);
    setOverPlaceId(null);
    setIsReorderMode(false);
  }, []);

  const onReorderPointerDown = useCallback(
    (e: React.PointerEvent, placeId: string) => {
      if (!isReorderMode) return;
      if (!onReorder) return;
      if (favorites.length < 2) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;

      e.preventDefault();
      e.stopPropagation();

      // Clean up any previous drag listeners.
      cleanupDragRef.current?.();
      cleanupDragRef.current = null;

      const bodyStyle = document.body.style;
      uxRef.current = {
        userSelect: bodyStyle.userSelect,
        webkitUserSelect: (
          bodyStyle as CSSStyleDeclaration & {
            webkitUserSelect?: string;
          }
        ).webkitUserSelect,
      };
      bodyStyle.userSelect = "none";
      (
        bodyStyle as CSSStyleDeclaration & { webkitUserSelect?: string }
      ).webkitUserSelect = "none";

      const handleEl = e.currentTarget as HTMLElement;
      try {
        handleEl.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      dragRef.current = {
        placeId,
        pointerId: e.pointerId,
        handleEl,
        moved: false,
        startClientX: e.clientX,
        startClientY: e.clientY,
      };
      overPlaceIdRef.current = placeId;
      setDraggingPlaceId(placeId);
      setOverPlaceId(placeId);

      const onMove = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (ev.pointerId !== drag.pointerId) return;
        ev.preventDefault();

        const dx = ev.clientX - drag.startClientX;
        const dy = ev.clientY - drag.startClientY;
        if (!drag.moved && Math.abs(dx) + Math.abs(dy) > 4) {
          drag.moved = true;
        }

        const el = document.elementFromPoint(
          ev.clientX,
          ev.clientY
        ) as HTMLElement | null;
        const card = el?.closest?.(
          "[data-favorite-card='true']"
        ) as HTMLElement | null;
        const over = card?.dataset.placeid ?? null;
        if (!over) return;
        if (overPlaceIdRef.current === over) return;

        overPlaceIdRef.current = over;
        setOverPlaceId(over);
      };

      const finish = (ev: PointerEvent) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (ev.pointerId !== drag.pointerId) return;
        ev.preventDefault();

        const fromIndex = favorites.findIndex(
          (f) => f.placeId === drag.placeId
        );
        const overId = overPlaceIdRef.current ?? drag.placeId;
        const toIndex = favorites.findIndex((f) => f.placeId === overId);

        if (
          drag.moved &&
          fromIndex >= 0 &&
          toIndex >= 0 &&
          fromIndex !== toIndex
        ) {
          onReorder(drag.placeId, toIndex);
        }

        try {
          drag.handleEl?.releasePointerCapture(drag.pointerId);
        } catch {
          // ignore
        }

        dragRef.current = null;
        overPlaceIdRef.current = null;
        setDraggingPlaceId(null);
        setOverPlaceId(null);

        const prev = uxRef.current;
        if (prev) {
          const bodyStyle2 = document.body.style;
          bodyStyle2.userSelect = prev.userSelect ?? "";
          (
            bodyStyle2 as CSSStyleDeclaration & { webkitUserSelect?: string }
          ).webkitUserSelect = prev.webkitUserSelect ?? "";
          uxRef.current = null;
        }

        cleanupDragRef.current?.();
        cleanupDragRef.current = null;
      };

      document.addEventListener("pointermove", onMove, true);
      document.addEventListener("pointerup", finish, true);
      document.addEventListener("pointercancel", finish, true);
      cleanupDragRef.current = () => {
        document.removeEventListener("pointermove", onMove, true);
        document.removeEventListener("pointerup", finish, true);
        document.removeEventListener("pointercancel", finish, true);
      };
    },
    [favorites, isReorderMode, onReorder]
  );

  useEffect(() => {
    return () => {
      cleanupDragRef.current?.();
      cleanupDragRef.current = null;
    };
  }, []);

  return (
    <section className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <SectionTitle
          title="Favorites"
          subtitle="최대 6개"
          className="min-w-0 flex-1"
        />
        {favorites.length >= 2 ? (
          <button
            type="button"
            className={[
              "inline-flex h-9 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 text-xs font-semibold text-white/90 hover:bg-white/15",
              isReorderMode ? "ring-2 ring-white/10" : undefined,
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={() => {
              if (isReorderMode) stopReorderMode();
              else setIsReorderMode(true);
            }}
          >
            {isReorderMode ? "완료" : "순서 편집"}
          </button>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {favorites.length === 0 ? (
          <div className="sm:col-span-2">
            <EmptyState
              title="즐겨찾기가 비어있어요"
              description="검색으로 추가해보세요."
            />
          </div>
        ) : (
          favorites.map((fav) => (
            <FavoriteCard
              key={fav.placeId}
              favorite={fav}
              isSelected={selectedPlaceId === fav.placeId}
              isReorderMode={isReorderMode}
              isDraggingAny={isDraggingAny}
              draggingPlaceId={draggingPlaceId}
              overPlaceId={overPlaceId}
              onReorderPointerDown={onReorderPointerDown}
              onSelect={onSelect}
              onRemove={onRemove}
              onUpdateAlias={onUpdateAlias}
            />
          ))
        )}
      </div>
    </section>
  );
}
