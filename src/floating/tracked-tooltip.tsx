import { clsx } from "clsx";
import {
  flip,
  FloatingPortal,
  offset,
  ReferenceType,
  type VirtualElement,
  ContextData,
  shift,
  useFloating,
  useMergeRefs,
} from "@floating-ui/react";
import {
  forwardRef,
  type ReactNode,
  type RefObject,
  type ForwardedRef,
  CSSProperties,
  useCallback,
  useState,
} from "react";
import { Variant } from "../types";

type FloatingResults = ReturnType<typeof useFloating>;
interface ElementRefs {
  triggerRef: ((instance: Element | VirtualElement | null) => void) | null;
  floatingRef: ((instance: Element | VirtualElement | null) => void) | null;
}

interface TrackedTooltipResult extends FloatingResults {
  elementRefs: ElementRefs;
  updateHoverState: (x: number | undefined, y: number | undefined, hovering: boolean) => void;
}

export function useTrackedTooltip(
  triggerRef: RefObject<ReferenceType | null>,
  floatingRef: RefObject<ReferenceType | null>,
  side: "top" | "right" | "bottom" | "left",
  axis: "x" | "y" | "both",
  sideOffset = 4,
): TrackedTooltipResult {
  const [hoveringState, setHoveringState] = useState(false);
  const floating = useFloating({
    placement: side,
    middleware: [offset(sideOffset), flip({ padding: 5 }), shift({ padding: 5 })],
  });

  const triggerMergedRef = useMergeRefs([floating.refs.setReference, triggerRef]);
  const floatingMergedRef = useMergeRefs([floating.refs.setFloating, floatingRef]);

  const context = floating.context;

  const updateHoverState = useCallback(
    (x: number | undefined, y: number | undefined, hovering: boolean) => {
      floating.refs.setPositionReference(
        createVirtualElement(context.elements.domReference, {
          axis,
          x: x ?? context.x,
          y: y ?? context.y,
          dataRef: context.dataRef,
          pointerType: undefined,
        }),
      );
      setHoveringState(hovering);
    },
    [context, axis, floating.refs],
  );

  return {
    ...floating,
    elementRefs: {
      triggerRef: triggerMergedRef,
      floatingRef: floatingMergedRef,
    },
    context: { ...context, open: hoveringState },
    updateHoverState,
  };
}

export interface TrackedTooltipProps {
  children: ReactNode;
  containerStyles: CSSProperties;
  variant?: Variant;
  open?: boolean;
}

const TrackedTooltip = forwardRef(
  (
    { children, containerStyles, variant = Variant.Default, open = false }: TrackedTooltipProps,
    ref: ForwardedRef<HTMLDivElement>,
  ) => {
    if (!open) return null;

    return (
      <FloatingPortal>
        <div
          ref={ref}
          style={{
            ...containerStyles,
          }}
          className={clsx(
            "responsive overflow-clip",
            variant,
            "card select-none inline-flex items-center",
            "pointer-events-none",
            "variant-static-text",
          )}
        >
          {children}
        </div>
      </FloatingPortal>
    );
  },
);

TrackedTooltip.displayName = "TrackedTooltip";

export { TrackedTooltip };

function createVirtualElement(
  domElement: Element | null | undefined,
  data: {
    axis: "x" | "y" | "both";
    dataRef: React.MutableRefObject<ContextData>;
    pointerType: string | undefined;
    x: number | null;
    y: number | null;
  },
) {
  let offsetX: number | null = null;
  let offsetY: number | null = null;
  let isAutoUpdateEvent = false;

  return {
    contextElement: domElement || undefined,
    getBoundingClientRect() {
      const domRect = domElement?.getBoundingClientRect() || {
        width: 0,
        height: 0,
        x: 0,
        y: 0,
      };

      const isXAxis = data.axis === "x" || data.axis === "both";
      const isYAxis = data.axis === "y" || data.axis === "both";
      const canTrackCursorOnAutoUpdate =
        ["mouseenter", "mousemove"].includes(data.dataRef.current.openEvent?.type || "") &&
        data.pointerType !== "touch";

      let width = domRect.width;
      let height = domRect.height;
      let x = domRect.x;
      let y = domRect.y;

      if (offsetX === null && data.x && isXAxis) {
        offsetX = domRect.x - data.x;
      }

      if (offsetY === null && data.y && isYAxis) {
        offsetY = domRect.y - data.y;
      }

      x -= offsetX || 0;
      y -= offsetY || 0;
      width = 0;
      height = 0;

      if (!isAutoUpdateEvent || canTrackCursorOnAutoUpdate) {
        width = data.axis === "y" ? domRect.width : 0;
        height = data.axis === "x" ? domRect.height : 0;
        x = isXAxis && data.x !== null ? data.x : x;
        y = isYAxis && data.y !== null ? data.y : y;
      } else if (isAutoUpdateEvent && !canTrackCursorOnAutoUpdate) {
        height = data.axis === "x" ? domRect.height : height;
        width = data.axis === "y" ? domRect.width : width;
      }

      isAutoUpdateEvent = true;

      return {
        width,
        height,
        x,
        y,
        top: y,
        right: x + width,
        bottom: y + height,
        left: x,
      };
    },
  };
}
