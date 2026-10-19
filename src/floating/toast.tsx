import { ReactNode, createContext, useContext, useState, useCallback, memo, useRef } from "react";
import { AnimatePresence, useAnimationFrame, motion, useSpring } from "motion/react";
import { Toast as RadixToast } from "radix-ui";
import { clsx } from "clsx";
import { Button } from "../buttons/button";
import { Size, Variant } from "../types";
import { ProgressCircle } from "../feedback/progress";
import { Icon, type IconName } from "../icons/registry";

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
  variant?: Variant;
  dismiss?:
    | {
        label: string;
        onClick: (data: ToastData) => void;
      }
    | number;
}

function InnerToast({ data }: { data: ToastData }) {
  const width = 320;
  const margin = 16;

  const { removeToast } = useContext(ToastContext);
  const [paused, setPaused] = useState(false);

  const pauseState = useRef<{ paused: boolean; accumulatedTime: number }>({
    paused: false,
    accumulatedTime: 0,
  });

  const duration = typeof data.dismiss === "number" ? data.dismiss : 4000;
  const action = typeof data.dismiss === "object" ? data.dismiss : undefined;

  const completionSpring = useSpring(0);

  useAnimationFrame((_time, delta) => {
    if (!paused) {
      pauseState.current.accumulatedTime = delta + pauseState.current.accumulatedTime;
      const percent = Math.min(1, Math.max(0, pauseState.current.accumulatedTime / duration));
      completionSpring.set(percent);
      if (percent >= 1) {
        removeToast(data.id);
      }
    }
  });

  // The transport pauses on hover; otherwise show the variant's status glyph (if
  // it has one). Computed here rather than inline so the registry key narrows.
  const statusIcon = data.variant ? STATUS_ICONS[data.variant] : undefined;
  const toastIcon = paused ? (
    <Icon name="player-pause" />
  ) : statusIcon ? (
    <Icon name={statusIcon} />
  ) : null;

  return (
    <RadixToast.Root
      asChild
      forceMount
      duration={duration}
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
        <RadixToast.Description
          className={clsx(data.content ? "p-3" : "hidden", "overflow-hidden")}
        >
          <p className={clsx("mb-3 text-sm text-neutral-700 dark:text-neutral-300")}>
            {data.content}
          </p>
        </RadixToast.Description>
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
      setToasts((prevToasts: ToastData[]) => prevToasts.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  const clear = useCallback(() => setToasts([]), [setToasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, updateToast, removeToast, clear }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        <RadixToast.Viewport
          className={clsx(
            "pointer-events-none fixed top-4 right-4 z-2147483647 flex w-80 flex-col-reverse gap-3 max-sm:top-20",
            // "pointer-events-none fixed top-0 right-0  m-0 flex w-[390px]",
            // "max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)]",
            // "outline-hidden [--viewport-padding:_60px]",
          )}
        />
        <AnimatePresence>
          {toasts.map((toast) => (
            <Toast key={toast.id} data={toast} />
          ))}
          {children}
        </AnimatePresence>
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export const ToastManager = memo(InnerToastManager);
