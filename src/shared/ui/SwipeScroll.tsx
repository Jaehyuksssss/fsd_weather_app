import type { HTMLAttributes, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SwipeScrollProps = {
  children: ReactNode;
  /**
   * 스크롤 영역 "위"에 렌더할 컨텐츠(헤더 등).
   * 이 영역도 드래그 스와이프(스크롤) 시작점으로 동작한다.
   */
  top?: ReactNode;
  /**
   * top 영역 클래스
   */
  topClassName?: string;
  /**
   * 드래그(스와이프) 히트영역을 넓히기 위한 래퍼 클래스.
   * (예: Card 안에서 헤더+스크롤을 한 덩어리로 드래그 가능하게)
   */
  containerClassName?: string;
  /**
   * 좌/우 화살표 버튼 표시 여부.
   * 스크롤 시작/끝에서는 자동으로 disabled 처리된다.
   */
  showArrows?: boolean;
  /**
   * 컨테이너 클래스 (스크롤 영역)
   */
  className?: string;
  /**
   * 드래그 중 텍스트 선택 방지 등 UX 개선 옵션.
   */
  dragClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "children">;

type DragState = {
  pointerId: number;
  startClientX: number;
  startScrollLeft: number;
  moved: boolean;
};

export function SwipeScroll({
  children,
  top,
  topClassName,
  containerClassName,
  showArrows = false,
  className,
  dragClassName,
  ...props
}: SwipeScrollProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const uxRef = useRef<{
    userSelect?: string;
    webkitUserSelect?: string;
  } | null>(null);

  const [edges, setEdges] = useState<{
    atStart: boolean;
    atEnd: boolean;
  }>({ atStart: true, atEnd: false });

  const wrapperClassName = useMemo(
    () =>
      ["relative cursor-grab active:cursor-grabbing", containerClassName]
        .filter(Boolean)
        .join(" "),
    [containerClassName]
  );

  const scrollerClassName = useMemo(
    () =>
      ["no-scrollbar overflow-x-auto", "touch-pan-x", className]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  const updateEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft;

    // Threshold for rounding/zoom/snap quirks:
    // visually "at start/end" can still be a few px off.
    const EPS = 8;
    const atStart = left <= EPS;
    const atEnd = left >= max - EPS;

    setEdges((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd
        ? prev
        : { atStart, atEnd }
    );
  }, []);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(160, Math.floor(el.clientWidth * 0.85));
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!showArrows) return;
    updateEdges();
    const raf = window.requestAnimationFrame(() => updateEdges());

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => updateEdges();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      window.cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateEdges);
    };
  }, [showArrows, updateEdges]);

  return (
    <div
      className={wrapperClassName}
      style={{ touchAction: "pan-y", WebkitTapHighlightColor: "transparent" }}
      onPointerDown={(e) => {
        const scroller = scrollRef.current;
        if (!scroller) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        const target = e.target as HTMLElement | null;
        if (
          target?.closest?.("a,button,input,textarea,select,[role='button']")
        ) {
          return;
        }

        // Prevent text selection highlight (blue) while dragging.
        e.preventDefault();
        const bodyStyle = document.body.style;
        uxRef.current = {
          userSelect: bodyStyle.userSelect,
          webkitUserSelect: (
            bodyStyle as CSSStyleDeclaration & { webkitUserSelect?: string }
          ).webkitUserSelect,
        };
        bodyStyle.userSelect = "none";
        (
          bodyStyle as CSSStyleDeclaration & { webkitUserSelect?: string }
        ).webkitUserSelect = "none";

        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        dragRef.current = {
          pointerId: e.pointerId,
          startClientX: e.clientX,
          startScrollLeft: scroller.scrollLeft,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const scroller = scrollRef.current;
        const drag = dragRef.current;
        if (!scroller || !drag) return;
        if (drag.pointerId !== e.pointerId) return;

        e.preventDefault();
        const dx = e.clientX - drag.startClientX;
        if (Math.abs(dx) > 4) drag.moved = true;
        scroller.scrollLeft = drag.startScrollLeft - dx;
      }}
      onPointerUp={(e) => {
        const drag = dragRef.current;
        if (!drag) return;
        if (drag.pointerId !== e.pointerId) return;
        dragRef.current = null;

        const prev = uxRef.current;
        if (prev) {
          const bodyStyle = document.body.style;
          bodyStyle.userSelect = prev.userSelect ?? "";
          (
            bodyStyle as CSSStyleDeclaration & { webkitUserSelect?: string }
          ).webkitUserSelect = prev.webkitUserSelect ?? "";
          uxRef.current = null;
        }
        try {
          (e.currentTarget as HTMLDivElement).releasePointerCapture(
            e.pointerId
          );
        } catch {
          // ignore
        }
      }}
      onPointerCancel={() => {
        dragRef.current = null;
        const prev = uxRef.current;
        if (prev) {
          const bodyStyle = document.body.style;
          bodyStyle.userSelect = prev.userSelect ?? "";
          (
            bodyStyle as CSSStyleDeclaration & { webkitUserSelect?: string }
          ).webkitUserSelect = prev.webkitUserSelect ?? "";
          uxRef.current = null;
        }
      }}
      onClickCapture={(e) => {
        // 드래그로 넘기는 중에 하위 버튼/링크 click이 발동되는 것 방지
        if (dragRef.current?.moved) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      {...props}
    >
      {top || showArrows ? (
        <div
          className={["flex items-center justify-between gap-2", topClassName]
            .filter(Boolean)
            .join(" ")}
        >
          {showArrows ? (
            <button
              type="button"
              className={[
                "grid h-7 w-7 place-items-center rounded-lg border border-black/10 bg-black/[0.03] text-slate-700",
                edges.atStart
                  ? "cursor-not-allowed opacity-45"
                  : "hover:bg-black/[0.06]",
              ].join(" ")}
              disabled={edges.atStart}
              onClick={() => scrollByDir(-1)}
              aria-label="왼쪽으로"
            >
              <img
                src={
                  edges.atStart
                    ? "/icon_arrow_left_disabled.svg"
                    : "/icon_arrow_left_active.svg"
                }
                alt=""
                className="h-5 w-5"
                draggable={false}
              />
            </button>
          ) : (
            <span aria-hidden="true" className="h-7 w-7" />
          )}

          <div className="min-w-0 flex-1">{top}</div>

          {showArrows ? (
            <button
              type="button"
              className={[
                "grid h-7 w-7 place-items-center rounded-lg border border-black/10 bg-black/[0.03] text-slate-700",
                edges.atEnd
                  ? "cursor-not-allowed opacity-45"
                  : "hover:bg-black/[0.06]",
              ].join(" ")}
              disabled={edges.atEnd}
              onClick={() => scrollByDir(1)}
              aria-label="오른쪽으로"
            >
              <img
                src={
                  edges.atEnd
                    ? "/icon_arrow_right_disabled.svg"
                    : "/icon_arrow_right_active.svg"
                }
                alt=""
                className="h-5 w-5"
                draggable={false}
              />
            </button>
          ) : (
            <span aria-hidden="true" className="h-7 w-7" />
          )}
        </div>
      ) : null}

      <div className="relative">
        <div
          ref={scrollRef}
          className={scrollerClassName}
          style={{ touchAction: "pan-x" }}
        >
          <div className={dragClassName}>{children}</div>
        </div>
      </div>
    </div>
  );
}
