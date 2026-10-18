import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  memo,
  useRef,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  useAnimationFrame,
  motion,
  useMotionValue,
  useIsPresent,
  type HTMLMotionProps,
} from "motion/react";
import { createPortal } from "react-dom";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { DismissableLayer } from "radix-ui/internal";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Size, Variant } from "../types";
import { ProgressCircle } from "../feedback/progress";
import { Icon, type IconName } from "../icons/registry";

/**
 * Variants that have a status glyph mapped to its registry key. Other variants
 * (primary/secondary/…) are absent and show no status icon. Typing the values as
 * `IconName` means a bad key here is a build error, and avoids constructing a
 * `status-${variant}` string that could name a key the registry doesn't have.
 */
const STATUS_ICONS: Partial<Record<Variant, IconName>> = {
  [Variant.Success]: "status-success",
  [Variant.Error]: "status-error",
  [Variant.Warning]: "status-warning",
  [Variant.Info]: "status-info",
};

export interface ToastState {
  toasts: ToastData[];
  addToast: (toast: ToastData) => void;
  updateToast: (id: string, data: Partial<ToastData>) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}

export const ToastContext = createContext<ToastState>({
  toasts: [],
  addToast: () => {},
  updateToast: () => {},
  removeToast: () => {},
  clear: () => {},
});

export interface ToastManagerProps {
  timeout?: number;
  children?: ReactNode;
}

export interface ToastData {
  id: string;
  title: string;
  content?: string;
  variant?: Variant;
  dismiss?:
    | {
        label: string;
        onClick: (data: ToastData) => void;
      }
    | number;
}

enum ToastSwipeState {
  Start = "start",
  Move = "move",
  End = "end",
  Cancel = "cancel",
}

/** A body sibling stays outside any ancestor a modal has already hidden. */
function ToastAnnounce({ data }: { data: ToastData }) {
  const [renderText, setRenderText] = useState(false);
  const [announced, setAnnounced] = useState(false);

  useLayoutEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => setRenderText(true));
    });
    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setAnnounced(true), 1000);
    return () => window.clearTimeout(timer);
  }, []);

  if (announced || typeof document === "undefined") return null;
  return createPortal(
    <span
      role="status"
      aria-live="assertive"
      aria-atomic
      style={{
        position: "absolute",
        border: 0,
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0, 0, 0, 0)",
        whiteSpace: "nowrap",
        wordWrap: "normal",
      }}
    >
      {/* Radix joins the toast's text nodes without punctuation and excludes Close. */}
      {renderText && (
        <>
          Notification {data.title}
          {data.content}
        </>
      )}
    </span>,
    document.body,
  );
}

const ToastPausedContext = createContext(false);

/** Counts mounted toasts, including those still running their exit animation. */
const ToastMountContext = createContext({ onMount: () => {}, onUnmount: () => {} });

function InnerToast({ data }: { data: ToastData }) {
  const width = 320;
  const margin = 16;

  const { removeToast, toasts: listed } = useContext(ToastContext);
  // Layout animation restacks the toasts when one arrives, leaves or changes what it
  // shows. A swipe re-renders the toast as it moves, and a layout animation then
  // would pull it back toward where it was, so only the stack's content triggers one.
  const stackLayout = JSON.stringify(
    listed.map(({ id, title, content, variant, dismiss }) => [
      id,
      title,
      content,
      variant,
      typeof dismiss === "object" ? dismiss.label : dismiss,
    ]),
  );
  const { onMount, onUnmount } = useContext(ToastMountContext);
  useEffect(() => {
    onMount();
    return onUnmount;
  }, [onMount, onUnmount]);
  const paused = useContext(ToastPausedContext);
  const { toasts } = BaseToast.useToastManager<ToastData>();
  const isPresent = useIsPresent();
  const toast = toasts.find((item) => item.id === data.id) ?? {
    id: data.id,
    data,
    transitionStatus: isPresent ? undefined : ("ending" as const),
  };
  const [swipeStarted, setSwipeStarted] = useState(false);

  const pauseState = useRef<{ accumulatedTime: number }>({
    accumulatedTime: 0,
  });

  const duration = typeof data.dismiss === "number" ? data.dismiss : 4000;

  const completion = useMotionValue(0);

  useAnimationFrame((_time, delta) => {
    if (!paused && isPresent) {
      pauseState.current.accumulatedTime = delta + pauseState.current.accumulatedTime;
      const percent = Math.min(1, Math.max(0, pauseState.current.accumulatedTime / duration));
      completion.set(percent);
      if (percent >= 1) {
        removeToast(data.id);
      }
    }
  });

  // The transport shows a pause glyph while paused; otherwise the status glyph (if
  // it has one). Computed here rather than inline so the registry key narrows.
  const statusIcon = data.variant ? STATUS_ICONS[data.variant] : undefined;
  const toastIcon = paused ? (
    <Icon name="player-pause" />
  ) : statusIcon ? (
    <Icon name={statusIcon} />
  ) : null;

  return (
    <BaseToast.Root
      toast={toast}
      swipeDirection="right"
      role={undefined}
      aria-modal={undefined}
      aria-labelledby={undefined}
      aria-describedby={undefined}
      aria-hidden={undefined}
      data-state={toast.transitionStatus === "ending" ? "closed" : "open"}
      onPointerDown={() => setSwipeStarted(true)}
      render={(props, state) => (
        <motion.li
          {...(props as HTMLMotionProps<"li">)}
          data-swipe={
            state.swiping
              ? state.swipeDirection
                ? ToastSwipeState.Move
                : ToastSwipeState.Start
              : state.transitionStatus === "ending" && state.swipeDirection
                ? ToastSwipeState.End
                : swipeStarted
                  ? ToastSwipeState.Cancel
                  : undefined
          }
          data-swipe-direction="right"
          style={
            {
              ...props.style,
              userSelect: "none",
              touchAction: "none",
              // CSS translate composes with Motion's entrance and exit transform.
              transform: undefined,
              ...(state.swiping && state.swipeDirection
                ? {
                    "--radix-toast-swipe-move-x": "var(--toast-swipe-movement-x)",
                    "--radix-toast-swipe-move-y": "var(--toast-swipe-movement-y)",
                  }
                : {}),
              ...(state.transitionStatus === "ending" && state.swipeDirection
                ? {
                    "--radix-toast-swipe-end-x": "var(--toast-swipe-movement-x)",
                    "--radix-toast-swipe-end-y": "var(--toast-swipe-movement-y)",
                  }
                : {}),
            } as CSSProperties
          }
          layout
          layoutDependency={stackLayout}
          className={clsx(
            "items-center overflow-hidden",
            "pointer-events-auto relative box-border w-[30ch] select-none",
            "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
            "data-[swipe=end]:animate-toastSwipeOut",
            "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
            data.variant,
            "card-overlay variant-scope",
          )}
          initial={{ x: width + margin }}
          animate={{ x: 0 }}
          exit={{
            opacity: 0,
            zIndex: -1,
            x: width + margin,
            transition: {
              opacity: {
                duration: 0.2,
              },
            },
          }}
          transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        />
      )}
    >
      <ToastAnnounce data={data} />
      <div
        className={clsx(
          "relative bg-neutral-50/50 dark:bg-neutral-950/50",
          "flex min-h-11 flex-row items-center justify-between gap-2 px-2 py-1.5",
        )}
      >
        <BaseToast.Title
          render={<div />}
          className={clsx(
            "flex min-w-0 flex-row items-center gap-3 text-[15px]",
            data.variant,
            "variant-static-text variant-scope",
          )}
        >
          <span className="flex shrink-0">
            <ProgressCircle
              size={Size.Xs}
              progress={completion}
              variant={data.variant}
              icon={toastIcon}
            />
          </span>
          <span className="min-w-0 wrap-break-word">{data.title}</span>
        </BaseToast.Title>
        <BaseToast.Close
          onClick={() => {
            if (typeof data.dismiss === "object") data.dismiss.onClick(data);
          }}
          render={(props) => (
            <Button
              {...props}
              tabIndex={undefined}
              aria-hidden={undefined}
              size={Size.Sm}
              className="shrink-0"
              variant={data.variant}
              leftIcon={
                typeof data.dismiss !== "object" ? (
                  <Icon name="close" className="text-black" />
                ) : undefined
              }
              altText={typeof data.dismiss === "object" ? data.dismiss.label : "dismiss"}
            >
              {typeof data.dismiss === "object" ? data.dismiss.label : undefined}
            </Button>
          )}
        />
      </div>
      <BaseToast.Description
        render={<div />}
        className={clsx(data.content ? "p-3" : "hidden", "overflow-hidden")}
      >
        <p className={clsx("mb-3 text-sm text-neutral-700 dark:text-neutral-300")}>
          {data.content}
        </p>
      </BaseToast.Description>
    </BaseToast.Root>
  );
}

const Toast = memo(InnerToast);

export interface ToastContainerProps {
  children?: ReactNode;
}

/** The public context adapts Base UI's store; the animation clock alone owns timeouts. */
function ToastContainer({ children }: ToastContainerProps) {
  const { toasts: managedToasts, add, update, close } = BaseToast.useToastManager<ToastData>();
  const viewportRef = useRef<HTMLOListElement | null>(null);
  const hovering = useRef(false);
  const focused = useRef(false);
  const windowBlurred = useRef(false);
  const currentToasts = useRef(new Map<string, ToastData>());
  const [paused, setPaused] = useState(false);
  const syncPaused = useCallback(
    () => setPaused(hovering.current || focused.current || windowBlurred.current),
    [],
  );
  const [mounted, setMounted] = useState(0);
  const mountCount = useMemo(
    () => ({
      onMount: () => setMounted((count) => count + 1),
      onUnmount: () => setMounted((count) => count - 1),
    }),
    [],
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F8" && viewportRef.current?.childElementCount) {
        event.preventDefault();
        viewportRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasToasts = mounted > 0;
  useEffect(() => {
    if (!hasToasts) return;
    const handleBlur = () => {
      windowBlurred.current = true;
      syncPaused();
    };
    const handleFocus = () => {
      windowBlurred.current = false;
      syncPaused();
    };
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
      windowBlurred.current = false;
      syncPaused();
    };
  }, [hasToasts, syncPaused]);

  const addToast = useCallback(
    (data: ToastData) => {
      currentToasts.current.set(data.id, data);
      add({
        id: data.id,
        title: data.title,
        data,
        timeout: 0,
        onClose: () => currentToasts.current.delete(data.id),
      });
    },
    [add],
  );
  const updateToast = useCallback(
    (id: string, data: Partial<ToastData>) => {
      const current = currentToasts.current.get(id);
      if (current) {
        const next = { ...current, ...data };
        currentToasts.current.set(id, next);
        update(id, { data: next, title: next.title });
      }
    },
    [update],
  );
  const removeToast = useCallback(
    (id: string) => {
      currentToasts.current.delete(id);
      close(id);
    },
    [close],
  );
  const clear = useCallback(() => {
    currentToasts.current.clear();
    close();
  }, [close]);
  const toasts = managedToasts
    .filter((toast) => toast.transitionStatus !== "ending")
    .map((toast) => toast.data!)
    .reverse();

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast, clear }}>
      <ToastPausedContext.Provider value={paused}>
        <ToastMountContext.Provider value={mountCount}>
          {/* Modal hiding exempts this live region, keeping toasts clickable after
            the separate body-portalled announcers have expired. */}
          <BaseToast.Portal aria-live="off">
            {/* Radix layers are still in use; replace this branch when those
                overlays move to Base UI so toast presses stay inside their layers. */}
            <DismissableLayer.Branch asChild>
              <div
                role="region"
                aria-label="Notifications (F8)"
                tabIndex={-1}
                // The region lets pointers through while any toast is mounted, including
                // one still running its exit animation.
                style={{ pointerEvents: mounted > 0 ? undefined : "none" }}
              >
                <BaseToast.Viewport
                  render={<ol ref={viewportRef} />}
                  role={undefined}
                  aria-live={undefined}
                  aria-label={undefined}
                  onMouseEnter={() => {
                    hovering.current = true;
                    syncPaused();
                  }}
                  onMouseLeave={() => {
                    hovering.current = false;
                    syncPaused();
                  }}
                  onFocus={() => {
                    focused.current = true;
                    syncPaused();
                  }}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                      focused.current = false;
                      syncPaused();
                    }
                  }}
                  className="pointer-events-none fixed top-4 right-4 z-2147483647 flex w-80 flex-col-reverse gap-3 max-sm:top-20"
                >
                  <AnimatePresence>
                    {toasts.map((toast) => (
                      <Toast key={toast.id} data={toast} />
                    ))}
                  </AnimatePresence>
                </BaseToast.Viewport>
              </div>
            </DismissableLayer.Branch>
          </BaseToast.Portal>
          {children}
        </ToastMountContext.Provider>
      </ToastPausedContext.Provider>
    </ToastContext.Provider>
  );
}

function InnerToastManager({ children }: ToastContainerProps) {
  return (
    <BaseToast.Provider timeout={0} limit={Infinity}>
      <ToastContainer>{children}</ToastContainer>
    </BaseToast.Provider>
  );
}

export const ToastManager = memo(InnerToastManager);
