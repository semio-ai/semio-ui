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
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import {
  AnimatePresence,
  useAnimationFrame,
  motion,
  useMotionValue,
  type HTMLMotionProps,
} from "motion/react";
import { createPortal } from "react-dom";
import { Toast as BaseToast, type ToastObject } from "@base-ui/react/toast";
import { DismissableLayer } from "radix-ui/internal";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Size, Variant } from "../types";
import { ProgressCircle } from "../feedback/progress";
import { Icon, type IconName } from "../icons/registry";
import { ActionMenu, type ActionMenuSpec, type ActionMenuFeedback } from "./action-menu";
import { registerToastRetainedState } from "./toast-retained-state";

/** The longest delay `setTimeout` honours: a longer one, `Infinity` among them, fires at once. */
const LONGEST_TIMEOUT = 2 ** 31 - 1;

function subscribeToVisibility(onChange: () => void) {
  document.addEventListener("visibilitychange", onChange);
  return () => document.removeEventListener("visibilitychange", onChange);
}

/** Whether the page is hidden, a background tab for instance. */
function useDocumentHidden(): boolean {
  return useSyncExternalStore(
    subscribeToVisibility,
    () => document.hidden,
    () => false,
  );
}

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

enum ToastCopyState {
  Idle = "idle",
  Copying = "copying",
  Copied = "copied",
  Failed = "failed",
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

/** The previous list while its items are the same objects in the same order. */
function useStableList<T>(list: T[]): T[] {
  const previous = useRef(list);
  const same =
    previous.current.length === list.length &&
    previous.current.every((item, index) => item === list[index]);
  if (!same) previous.current = list;
  return previous.current;
}

/** Counts mounted toasts, including those still running their exit animation. */
const ToastMountContext = createContext({ onMount: () => {}, onUnmount: () => {} });

function InnerToast({
  toast,
  generation,
  menuPortalContainer,
  isCurrentGeneration,
}: {
  toast: ToastObject<ToastData>;
  generation: number;
  menuPortalContainer: HTMLElement | null;
  isCurrentGeneration: (id: string, generation: number) => boolean;
}) {
  // The root and both clocks use this generation's store snapshot, including its
  // ending state while Motion retains the root after the store releases it.
  const data = toast.data!;
  const { removeToast, toasts: listed } = useContext(ToastContext);
  // Layout animation restacks the toasts when one arrives, leaves or changes what it
  // shows. A swipe re-renders the toast as it moves, and a layout animation then
  // would pull it back toward where it was, so only the stack's content triggers one.
  const stackLayout = JSON.stringify(
    listed.map(({ id, title, content, variant, dismiss, clipboardContent, actionMenu }) => [
      id,
      title,
      content,
      clipboardContent,
      actionMenu,
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
  const [copyState, setCopyState] = useState(ToastCopyState.Idle);
  const [menuOpen, setMenuOpen] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<ActionMenuFeedback>();
  const hasClipboardContent = data.clipboardContent !== undefined && !data.actionMenu;
  /** Someone is using the toast: its menu is open, or an action or a copy is in flight. */
  const held = menuOpen || actionBusy || copyState === ToastCopyState.Copying;
  // Both clocks wait for a visible page, including for a toast first added in a
  // background tab. The viewport owns hover/focus and window-blur pauses.
  const documentHidden = useDocumentHidden();
  const isPaused = paused || held || documentHidden;
  const [swipeStarted, setSwipeStarted] = useState(false);

  const pauseState = useRef<{ accumulatedTime: number }>({
    accumulatedTime: 0,
  });

  /** Wall time counted by the timeout, independently of Motion's capped frame delta. */
  const wallElapsed = useRef(0);
  const duration =
    typeof data.dismiss === "number"
      ? data.dismiss
      : hasClipboardContent || data.actionMenu
        ? 10000
        : 4000;

  const completion = useMotionValue(0);

  /**
   * Whether this toast has asked to be removed. It asks once, and its clock stops
   * while it leaves.
   *
   * A closing toast stays rendered while it leaves. Closing a toast that Base UI has
   * already marked ending still gives its store a new list, so a request per frame
   * would be a store change per frame. Motion's layout projection runs frame
   * callbacks from a microtask after each render, so that becomes a request per
   * render; inside a discrete event (an `input`, a `pointerdown`) React renders each
   * update in the next microtask, and the page never reaches another task.
   * `removeToast` also ignores a toast that is no longer active.
   */
  const removalRequested = useRef(false);
  const leaving = toast.transitionStatus === "ending";
  const expire = useCallback(() => {
    if (!isCurrentGeneration(data.id, generation) || removalRequested.current) return;
    removalRequested.current = true;
    removeToast(data.id);
  }, [removeToast, data.id, generation, isCurrentGeneration]);

  // Callbacks retain the generation that started their work. The synchronous
  // record invalidates them as soon as an id is replaced, even before a render.
  const receiveFeedback = (feedback: ActionMenuFeedback | undefined) => {
    if (!isCurrentGeneration(data.id, generation)) return;
    setActionFeedback(feedback);
    if (!feedback) return;
    // Feedback needs a full reading interval after the action releases its hold.
    pauseState.current.accumulatedTime = 0;
    wallElapsed.current = 0;
    completion.set(0);
  };
  const copyDetails = async () => {
    if (data.clipboardContent === undefined || !isCurrentGeneration(data.id, generation)) return;
    setCopyState(ToastCopyState.Copying);
    try {
      await navigator.clipboard.writeText(data.clipboardContent);
      if (!isCurrentGeneration(data.id, generation)) return;
      setCopyState(ToastCopyState.Copied);
    } catch {
      if (!isCurrentGeneration(data.id, generation)) return;
      setCopyState(ToastCopyState.Failed);
    }
  };

  // Every `addToast` is a new notification, including one under the id of a toast
  // that is still leaving, which comes back as this same component. Its interval
  // starts over.
  const firstGeneration = useRef(generation);
  useEffect(() => {
    if (generation === firstGeneration.current) return;
    firstGeneration.current = generation;
    removalRequested.current = false;
    pauseState.current.accumulatedTime = 0;
    wallElapsed.current = 0;
    completion.set(0);
    setSwipeStarted(false);
    setCopyState(ToastCopyState.Idle);
    setMenuOpen(false);
    setActionBusy(false);
    setActionFeedback(undefined);
  }, [generation, completion]);

  useAnimationFrame((_time, delta) => {
    if (
      !isCurrentGeneration(data.id, generation) ||
      isPaused ||
      leaving ||
      removalRequested.current
    ) {
      return;
    }
    pauseState.current.accumulatedTime = delta + pauseState.current.accumulatedTime;
    const percent = Math.min(1, Math.max(0, pauseState.current.accumulatedTime / duration));
    completion.set(percent);
    if (percent >= 1) expire();
  });

  // Motion caps a frame's delta, so a timeout over the remaining wall time ends
  // the toast on time even on a slow page. Both clocks stop while paused, held,
  // hidden or leaving. Each generation restarts them; Base UI's timeout is off,
  // so the store cannot expire a notification on a separate schedule. Intervals
  // longer than a timeout can hold, including Infinity, use only the frame clock.
  useEffect(() => {
    if (leaving || isPaused || removalRequested.current || duration > LONGEST_TIMEOUT) return;
    const armedAt = performance.now();
    const timer = window.setTimeout(expire, duration - wallElapsed.current);
    return () => {
      window.clearTimeout(timer);
      if (isCurrentGeneration(data.id, generation)) {
        wallElapsed.current += performance.now() - armedAt;
      }
    };
  }, [generation, leaving, isPaused, duration, expire, data.id, isCurrentGeneration]);

  // The transport shows a pause glyph while paused; otherwise the status glyph (if
  // it has one). Computed here rather than inline so the registry key narrows.
  const statusIcon = data.variant ? STATUS_ICONS[data.variant] : undefined;
  const toastIcon = isPaused ? (
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
            "pointer-events-auto relative box-border w-full select-none",
            "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
            "data-[swipe=end]:animate-toastSwipeOut",
            "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
            data.variant,
            "card-overlay variant-scope",
          )}
          initial={{ x: OFFSCREEN_X }}
          // A closing toast starts leaving as soon as Base UI marks it ending, while it
          // is still rendered for Base UI's store to let go of it (see `rendered`).
          animate={state.transitionStatus === "ending" ? LEAVING : { x: 0 }}
          exit={LEAVING}
          transition={{ type: "tween", duration: 0.2, ease: "easeInOut" }}
        />
      )}
    >
      <ToastAnnounce key={generation} data={data} />
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
        {/* Controls, including events bubbling through the menu portal, must not
            start the toast's Base UI swipe gesture. */}
        <div
          className="flex shrink-0 items-center gap-2"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {data.actionMenu && (
            <ActionMenu
              key={generation}
              menu={data.actionMenu}
              portalContainer={menuPortalContainer}
              iconOnly
              variant={data.variant}
              onOpenChange={(open) => {
                if (isCurrentGeneration(data.id, generation)) setMenuOpen(open);
              }}
              onBusyChange={(busy) => {
                if (isCurrentGeneration(data.id, generation)) setActionBusy(busy);
              }}
              onFeedback={receiveFeedback}
            />
          )}
          {hasClipboardContent && (
            <Button
              size={Size.Sm}
              variant={data.variant}
              visuals="inverted-border"
              leftIcon={copyState === ToastCopyState.Copied ? "copy-complete" : "copy"}
              altText="Copy details"
              title={copyState === ToastCopyState.Copied ? "Copied" : "Copy details"}
              disabled={copyState === ToastCopyState.Copying}
              onClick={() => void copyDetails()}
            />
          )}
          <BaseToast.Close
            onClick={(event) => {
              // A leaving toast is already closed; closing it again would only give the
              // store a new list.
              if (leaving) {
                event.preventBaseUIHandler();
                return;
              }
              // Base UI composes this action before its own close handler.
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
      </div>
      <BaseToast.Description
        render={<div />}
        className={clsx(data.content ? "p-3" : "hidden", "overflow-hidden")}
      >
        <p className="text-sm text-neutral-700 dark:text-neutral-300">{data.content}</p>
      </BaseToast.Description>
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
            copyState === ToastCopyState.Failed
              ? "block px-3 pb-3 text-xs text-neutral-700 dark:text-neutral-300"
              : "sr-only"
          }
        >
          {copyState === ToastCopyState.Failed
            ? "Could not copy. Try again."
            : copyState === ToastCopyState.Copied
              ? "Details copied to clipboard."
              : null}
        </span>
      )}
    </BaseToast.Root>
  );
}

/** A toast's width plus the viewport's margin: just past the right edge. */
const OFFSCREEN_X = 320 + 16;

/** Where a toast goes as it closes: out to the right, fading. */
const LEAVING = {
  opacity: 0,
  zIndex: -1,
  x: OFFSCREEN_X,
  transition: {
    opacity: {
      duration: 0.2,
    },
  },
};

const Toast = memo(InnerToast);

export interface ToastContainerProps {
  children?: ReactNode;
}

/** The public context adapts Base UI's store; the toast's two clocks own expiry. */
function ToastContainer({ children }: ToastContainerProps) {
  const { toasts: managedToasts, add, update, close } = BaseToast.useToastManager<ToastData>();
  const viewportRef = useRef<HTMLOListElement | null>(null);
  const [menuPortalContainer, setMenuPortalContainer] = useState<HTMLLIElement | null>(null);
  const registerMenuContainer = useCallback((node: HTMLLIElement | null) => {
    // Retain the host through ref detaches so a provider update cannot cause a loop.
    if (node) setMenuPortalContainer(node);
  }, []);
  const windowBlurred = useRef(false);
  const hovered = useRef(false);
  // Base UI's close/remove callbacks track closed entries still in its store,
  // including an id added and closed before the next render. Active entries live
  // in currentToasts; neither check depends on the render snapshot.
  const closedStoreIds = useRef(new Set<string>());
  const currentToasts = useRef(new Map<string, ToastData>());
  /** Live generation metadata lasts until both the active record and store entry are gone. */
  const generations = useRef(new Map<string, number>());
  const nextGeneration = useRef(0);
  /** A renamed notification keeps its place while its old root finishes leaving. */
  const positions = useRef(new Map<string, number>());
  const nextPosition = useRef(0);
  const [paused, setPaused] = useState(false);
  const syncPaused = useCallback(
    () =>
      setPaused(
        hovered.current ||
          !!viewportRef.current?.contains(document.activeElement) ||
          windowBlurred.current,
      ),
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
      if (event.key === "F8" && viewportRef.current?.querySelector("li[data-state]")) {
        event.preventDefault();
        viewportRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const hasManagedOrMountedToasts = mounted > 0 || managedToasts.length > 0;
  useEffect(() => {
    if (!hasManagedOrMountedToasts) return;
    // F6 is the browser's own pane shortcut, and Radix's toasts bound F8 alone. Base
    // UI's viewport takes F6 (with any modifiers) on window, in the bubble phase, with
    // no option to turn it off. This capture-phase listener stops the same keydowns
    // first, without preventing the browser's default. The viewport needs no F6
    // event either: its local keydown handler only handles Shift+Tab.
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F6") {
        event.stopPropagation();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [hasManagedOrMountedToasts]);

  useEffect(() => {
    // Document focus events are the single focus-pause mechanism. Reading the
    // active element also releases focus pauses when disabled controls omit blur.
    document.addEventListener("focusin", syncPaused);
    document.addEventListener("focusout", syncPaused);
    return () => {
      document.removeEventListener("focusin", syncPaused);
      document.removeEventListener("focusout", syncPaused);
    };
  }, [syncPaused]);

  useEffect(() => {
    for (const id of generations.current.keys()) {
      if (closedStoreIds.current.has(id) || currentToasts.current.has(id)) continue;
      generations.current.delete(id);
      positions.current.delete(id);
    }
  }, [managedToasts]);

  const hasToasts = mounted > 0;
  useEffect(() => {
    if (!hasToasts) return;
    // A node removed under the pointer, such as a selected action menu item,
    // sends no leave event to its ancestors. Track targets at the document:
    // engines differ in how :hover updates are ordered against pointer events.
    const setHovered = (value: boolean) => {
      if (hovered.current === value) return;
      hovered.current = value;
      syncPaused();
    };
    const handlePointerOver = (event: PointerEvent) => {
      setHovered(event.target instanceof Node && !!viewportRef.current?.contains(event.target));
    };
    const handlePointerOut = (event: PointerEvent) => {
      if (event.relatedTarget === null) setHovered(false);
    };
    document.addEventListener("pointerover", handlePointerOver, true);
    document.addEventListener("pointerout", handlePointerOut, true);
    return () => {
      document.removeEventListener("pointerover", handlePointerOver, true);
      document.removeEventListener("pointerout", handlePointerOut, true);
      setHovered(false);
    };
  }, [hasToasts, syncPaused]);

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

  const listToast = useCallback(
    (data: ToastData, position: number) => {
      positions.current.set(data.id, position);
      const generation = ++nextGeneration.current;
      generations.current.set(data.id, generation);
      currentToasts.current.set(data.id, data);
      closedStoreIds.current.delete(data.id);
      add({
        id: data.id,
        title: data.title,
        data,
        timeout: 0,
        onClose: () => {
          if (generations.current.get(data.id) !== generation) return;
          closedStoreIds.current.add(data.id);
          currentToasts.current.delete(data.id);
        },
        onRemove: () => {
          if (generations.current.get(data.id) !== generation) return;
          closedStoreIds.current.delete(data.id);
        },
      });
    },
    [add],
  );
  const addToast = useCallback(
    (data: ToastData) => {
      const position = currentToasts.current.has(data.id)
        ? positions.current.get(data.id)!
        : nextPosition.current++;
      listToast(data, position);
    },
    [listToast],
  );
  const updateToast = useCallback(
    (id: string, data: Partial<ToastData>) => {
      const current = currentToasts.current.get(id);
      if (!current) return;
      const next = { ...current, ...data };
      if (next.id !== id) {
        // Data, the synchronous record and Base UI must share the same key. A new
        // id is a new notification with its own clocks and announcement, in place.
        const position = positions.current.get(id)!;
        currentToasts.current.delete(id);
        close(id);
        listToast(next, position);
        return;
      }
      currentToasts.current.set(id, next);
      update(id, { data: next, title: next.title });
    },
    [update, close, listToast],
  );
  const isCurrentGeneration = useCallback(
    (id: string, generation: number) =>
      currentToasts.current.has(id) && generations.current.get(id) === generation,
    [],
  );
  // Only an active toast is closed. Base UI's `close` of a toast it has already marked
  // ending still gives its store a new list, re-rendering every subscriber for a
  // change that changes nothing.
  const removeToast = useCallback(
    (id: string) => {
      if (!currentToasts.current.delete(id)) return;
      close(id);
    },
    [close],
  );
  const clear = useCallback(() => {
    if (currentToasts.current.size === 0) return;
    currentToasts.current.clear();
    close();
  }, [close]);
  // The store changes while a toast leaves (its height, its removal) without the active
  // list changing; consumers re-render only when the list itself does.
  const orderedToasts = [...managedToasts].sort((a, b) => {
    const aPosition = positions.current.get(a.id) ?? Number.MAX_SAFE_INTEGER;
    const bPosition = positions.current.get(b.id) ?? Number.MAX_SAFE_INTEGER;
    return aPosition - bPosition || a.id.localeCompare(b.id);
  });
  const toasts = useStableList(
    orderedToasts
      .filter((toast) => toast.transitionStatus !== "ending")
      .map((toast) => toast.data!),
  );
  const context = useMemo(
    () => ({ toasts, addToast, updateToast, removeToast, clear }),
    [toasts, addToast, updateToast, removeToast, clear],
  );
  registerToastRetainedState(context, () => ({
    generations: generations.current.size,
    positions: positions.current.size,
  }));
  // A closing toast stays rendered until Base UI's store removes it, with `animate`
  // already taking it towards `LEAVING`. Base UI removes a dismissed toast from its
  // store from the toast's own root, once that root stops animating; a root that
  // unmounted first would leave the toast in the store for good, keeping Base UI's
  // window listeners and focus guards active. After the store removes it, `exit`
  // targets the same values.
  const rendered = orderedToasts;

  return (
    <ToastContext.Provider value={context}>
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
                  className="pointer-events-none fixed top-4 right-4 z-2147483647 flex w-80 max-w-[calc(100vw-2rem)] flex-col-reverse gap-3 max-sm:top-20"
                >
                  <AnimatePresence>
                    {rendered.map((toast) => (
                      <Toast
                        key={toast.id}
                        toast={toast}
                        menuPortalContainer={menuPortalContainer}
                        generation={generations.current.get(toast.id) ?? 0}
                        isCurrentGeneration={isCurrentGeneration}
                      />
                    ))}
                  </AnimatePresence>
                  {/* A presentational li preserves the list's child semantics. Fixed
                      positioning excludes the host from flex layout; its z-index
                      stays inside the list and paints menus above the toasts.
                      Dropdown stops Escape in Radix's document capture listener,
                      giving the menu its own dismissal before the toast. */}
                  <li
                    role="presentation"
                    ref={registerMenuContainer}
                    className="pointer-events-auto fixed z-2147483647"
                  />
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
