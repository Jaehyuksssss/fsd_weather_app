import type { HTMLAttributes, ReactNode } from "react";
import { useMemo, useRef } from "react";

type SwipeScrollProps = {
  children: ReactNode;
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
  className,
  dragClassName,
  ...props
}: SwipeScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const baseClassName = useMemo(
    () =>
      [
        "no-scrollbar overflow-x-auto",
        "touch-pan-x",
        "cursor-grab active:cursor-grabbing",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  return (
    <div
      ref={ref}
      className={baseClassName}
      style={{ touchAction: "pan-x" }}
      onPointerDown={(e) => {
        const el = ref.current;
        if (!el) return;
        if (e.pointerType === "mouse" && e.button !== 0) return;

        el.setPointerCapture(e.pointerId);
        dragRef.current = {
          pointerId: e.pointerId,
          startClientX: e.clientX,
          startScrollLeft: el.scrollLeft,
          moved: false,
        };
      }}
      onPointerMove={(e) => {
        const el = ref.current;
        const drag = dragRef.current;
        if (!el || !drag) return;
        if (drag.pointerId !== e.pointerId) return;

        const dx = e.clientX - drag.startClientX;
        if (Math.abs(dx) > 4) drag.moved = true;
        el.scrollLeft = drag.startScrollLeft - dx;
      }}
      onPointerUp={(e) => {
        const el = ref.current;
        const drag = dragRef.current;
        if (!el || !drag) return;
        if (drag.pointerId !== e.pointerId) return;
        dragRef.current = null;
        try {
          el.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }}
      onPointerCancel={() => {
        dragRef.current = null;
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
      <div className={dragClassName}>{children}</div>
    </div>
  );
}


