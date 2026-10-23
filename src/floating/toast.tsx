import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  memo,
  useRef,
} from "react";
import { AnimatePresence, useAnimationFrame, useIsPresent, motion, useSpring } from "motion/react";
import { Toast as RadixToast } from "radix-ui";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Size, Variant } from "../types";
import { ProgressCircle } from "../feedback/progress";
import { Icon, type IconName } from "../icons/registry";
import { ActionMenu, type ActionMenuSpec, type ActionMenuFeedback } from "./action-menu";

/**
 * Variants that have a status glyph mapped to its registry key. Other variants
 * (primary/secondary/…) are absent and show no status icon — matching the old
 * `IconVariant`, which returned `null` for them. Typing the values as `IconName`
 * means a bad key here is a build error, and the lookup avoids constructing a
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
  /** Exact text copied by the optional Copy details action. The caller formats and redacts it. */
  clipboardContent?: string;
  /** Explicit menu takes precedence over the clipboard shortcut. */
  actionMenu?: ActionMenuSpec;
  variant?: Variant;
  dismiss?:
    | {
        label: string;
        onClick: (data: ToastData) => void;
      }
    | number;
}

function InnerToast({
  data,
  menuPortalContainer,
}: {
  data: ToastData;
  menuPortalContainer: HTMLElement | null;
}) {
  const width = 320;
  const margin = 16;

  const { removeToast } = useContext(ToastContext);
  const [paused, setPaused] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionMenuFeedback>();
  const hasClipboardContent = data.clipboardContent !== undefined && !data.actionMenu;
  /** Someone is using the toast: its menu is open, or an action or a copy is in flight. */
  const held = menuOpen || actionBusy || copyState === "copying";
  const isPaused = paused || held;
  const receiveFeedback = (feedback: ActionMenuFeedback | undefined) => {
    setActionFeedback(feedback);
    if (!feedback) return;
    pauseState.current.accumulatedTime = 0;
    wallElapsed.current = 0;
  };

  const copyDetails = async () => {
    if (data.clipboardContent === undefined) return;
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(data.clipboardContent);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const pauseState = useRef<{ paused: boolean; accumulatedTime: number }>({
    paused: false,
    accumulatedTime: 0,
  });
  /** Wall time the interval has run, which the wall clock below counts down from. */
  const wallElapsed = useRef(0);

  const duration =
    typeof data.dismiss === "number"
      ? data.dismiss
      : hasClipboardContent || data.actionMenu
        ? 10000
        : 4000;
  const action = typeof data.dismiss === "object" ? data.dismiss : undefined;

  const completionSpring = useSpring(0);

  /**
   * Whether this toast has asked to be removed. It asks once.
   *
   * The frame callback keeps running while the toast plays its exit animation,
   * and every removal request is a state change of the toast manager. Motion's
   * layout projection runs frame callbacks from a microtask after each render, so
   * a request per frame becomes a request per render; inside a discrete event
   * (an `input`, a `pointerdown`) React renders each of those updates in the next
   * microtask, and the page never reaches another task again.
   */
  const removalRequested = useRef(false);
  const expire = useCallback(() => {
    if (removalRequested.current) return;
    removalRequested.current = true;
    removeToast(data.id);
  }, [removeToast, data.id]);

  // A toast added again under the same id while it is still leaving comes back as
  // this same component. It is a new notification, so its interval starts over.
  const isPresent = useIsPresent();
  useEffect(() => {
    if (!isPresent) return;
    removalRequested.current = false;
    pauseState.current.accumulatedTime = 0;
    wallElapsed.current = 0;
  }, [isPresent]);

  useAnimationFrame((_time, delta) => {
    if (isPaused || removalRequested.current) return;
    pauseState.current.accumulatedTime = delta + pauseState.current.accumulatedTime;
    const percent = Math.min(1, Math.max(0, pauseState.current.accumulatedTime / duration));
    completionSpring.set(percent);
    if (percent >= 1) expire();
  });

  // The wall clock. The frame clock above lags wall time when frames are slow or
  // paused (Motion caps a frame's delta), so a timeout over the rest of the
  // interval ends the toast on time regardless. It stops whenever the frame clock
  // does: while Radix pauses the toasts (focus or the pointer in them, the window
  // in the background) and while the toast is held.
  useEffect(() => {
    if (!isPresent || isPaused) return;
    const armedAt = performance.now();
    const timer = window.setTimeout(expire, duration - wallElapsed.current);
    return () => {
      window.clearTimeout(timer);
      wallElapsed.current += performance.now() - armedAt;
    };
  }, [isPresent, isPaused, duration, expire]);

  // The transport pauses on hover; otherwise show the variant's status glyph (if
  // it has one). Computed here rather than inline so the registry key narrows.
  const statusIcon = data.variant ? STATUS_ICONS[data.variant] : undefined;
  const toastIcon = isPaused ? (
    <Icon name="player-pause" />
  ) : statusIcon ? (
    <Icon name={statusIcon} />
  ) : null;

  return (
    <RadixToast.Root
      asChild
      forceMount
      // The toast's own clocks above end it, so Radix arms no timer. Radix's timer
      // cannot be held while someone uses the toast: a viewport resume re-arms it
      // from Radix's own remaining time whatever `duration` says, and holding it
      // through `open` only mutes its close while that remaining time still runs
      // down, so the toast closes the moment Radix next resumes after the hold.
      // `open` follows the toast's presence: a toast added again under its id while
      // it leaves is this same Root, and comes back open, so its close button,
      // Escape and swipe reach `onOpenChange` again.
      open={isPresent}
      duration={Infinity}
      className={clsx()}
      onOpenChange={() => {
        removeToast(data.id);
      }}
      onPause={() => {
        pauseState.current.paused = true;
        setPaused(true);
      }}
      onResume={() => {
        pauseState.current.paused = false;
        setPaused(false);
      }}
    >
      <motion.li
        layout
        className={clsx(
          "items-center overflow-hidden",
          "pointer-events-auto relative box-border w-full select-none",
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
      >
        <div
          className={clsx(
            "relative bg-neutral-50/50 dark:bg-neutral-950/50",
            "flex min-h-11 flex-row items-center justify-between gap-2 px-2 py-1.5",
          )}
        >
          <RadixToast.Title
            className={clsx(
              "flex min-w-0 flex-row items-center gap-3 text-[15px]",
              data.variant,
              "variant-static-text variant-scope",
            )}
          >
            <span className="flex shrink-0">
              <ProgressCircle
                size={Size.Xs}
                progress={completionSpring}
                variant={data.variant}
                icon={toastIcon}
              />
            </span>
            <span className="min-w-0 wrap-break-word">{data.title}</span>
          </RadixToast.Title>
          <div className="flex shrink-0 items-center gap-2">
            {data.actionMenu && (
              <ActionMenu
                menu={data.actionMenu}
                portalContainer={menuPortalContainer}
                iconOnly
                variant={data.variant}
                onOpenChange={setMenuOpen}
                onBusyChange={setActionBusy}
                onFeedback={receiveFeedback}
              />
            )}
            {hasClipboardContent && (
              <Button
                size={Size.Sm}
                variant={data.variant}
                visuals="inverted-border"
                leftIcon={copyState === "copied" ? "copy-complete" : "copy"}
                altText="Copy details"
                title={copyState === "copied" ? "Copied" : "Copy details"}
                disabled={copyState === "copying"}
                onClick={() => void copyDetails()}
              />
            )}
            {/* An action toast's button runs the action, then closes the toast: `Close`
                hands its own click handler to this button through `asChild`, and the
                merged handler calls the button's `onClick` before closing. */}
            <RadixToast.Close asChild>
              <Button
                size={Size.Sm}
                className="shrink-0"
                onClick={action ? () => action.onClick(data) : undefined}
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
            </RadixToast.Close>
          </div>
        </div>
        <RadixToast.Description
          className={clsx(data.content ? "p-3" : "hidden", "overflow-hidden")}
        >
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{data.content}</p>
        </RadixToast.Description>
        <span
          role="status"
          className={
            actionFeedback
              ? "block px-3 pb-3 text-xs text-neutral-700 dark:text-neutral-300"
              : "sr-only"
          }
        >
          {actionFeedback?.message ?? null}
        </span>
        {hasClipboardContent && (
          <span
            role="status"
            className={
              copyState === "failed"
                ? "block px-3 pb-3 text-xs text-neutral-700 dark:text-neutral-300"
                : "sr-only"
            }
          >
            {copyState === "failed"
              ? "Could not copy. Try again."
              : copyState === "copied"
                ? "Details copied to clipboard."
                : null}
          </span>
        )}
      </motion.li>
    </RadixToast.Root>
  );
}

const Toast = memo(InnerToast);

export interface ToastContainerProps {
  children?: ReactNode;
}

function InnerToastManager({ children }: ToastContainerProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const [menuPortalContainer, setMenuPortalContainer] = useState<HTMLOListElement | null>(null);
  const registerMenuContainer = useCallback((node: HTMLOListElement | null) => {
    // Composed viewport refs may detach during provider updates. Keep the host
    // until a replacement mounts so a detach cannot trigger another provider update.
    if (node) setMenuPortalContainer(node);
  }, []);

  const addToast = useCallback(
    (toast: ToastData) => {
      setToasts((prevToasts: ToastData[]) => [...prevToasts, toast]);
    },
    [setToasts],
  );

  const updateToast = useCallback(
    (id: string, data: Partial<ToastData>) => {
      setToasts((prevToasts: ToastData[]) =>
        prevToasts.map((toast) => (toast.id === id ? { ...toast, ...data } : toast)),
      );
    },
    [setToasts],
  );

  const removeToast = useCallback(
    (id: string) => {
      // The same array when the toast is already gone: a new one would re-render
      // every toast consumer for a removal that changes nothing.
      setToasts((prevToasts: ToastData[]) =>
        prevToasts.some((toast) => toast.id === id)
          ? prevToasts.filter((toast) => toast.id !== id)
          : prevToasts,
      );
    },
    [setToasts],
  );

  const clear = useCallback(() => setToasts([]), [setToasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast, clear }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        <RadixToast.Viewport
          ref={registerMenuContainer}
          className={clsx(
            "pointer-events-none fixed top-4 right-4 z-2147483647 flex w-80 max-w-[calc(100vw-2rem)] flex-col-reverse gap-3 max-sm:top-20",
            // "pointer-events-none fixed top-0 right-0  m-0 flex w-[390px]",
            // "max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)]",
            // "outline-hidden [--viewport-padding:_60px]",
          )}
        />
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} data={toast} menuPortalContainer={menuPortalContainer} />
          ))}
        </AnimatePresence>
        {children}
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export const ToastManager = memo(InnerToastManager);
