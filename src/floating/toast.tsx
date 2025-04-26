import { ReactNode, createContext, useContext, useState, useCallback, memo, useRef } from "react";
import { AnimatePresence, useAnimationFrame, motion, useSpring } from "motion/react";
import * as RadixToast from "@radix-ui/react-toast";
import { clsx } from "clsx";
import { IconPlayerPause, IconX } from "@tabler/icons-react";
import { Button } from "../buttons/button";
import { Size, Variant } from "../types";
import { ProgressCircle } from "../progress";
import { IconVariant } from "../icons/variant";

export interface ToastState {
  toasts: ToastData[];
  addToast: (toast: ToastData) => void;
  removeToast: (id: string) => void;
  clear: () => void;
}

export const ToastContext = createContext<ToastState>({
  toasts: [],
  addToast: () => {},
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
          "overflow-hidden items-center",
          "box-border relative w-[30ch] pointer-events-auto select-none",
          "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
          "data-[swipe=end]:animate-toastSwipeOut",
          "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
          data.variant,
          "card",
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
            "bg-neutral-50/50 dark:bg-neutral-950/50 relative",
            "flex flex-row h-11 px-2 justify-between items-center",
          )}
        >
          <RadixToast.Title
            className={clsx(
              "text-[15px] flex-row flex items-center gap-3",
              data.variant,
              "variant-static-text",
            )}
          >
            <ProgressCircle
              size={Size.Xs}
              progress={completionSpring}
              variant={data.variant}
              icon={
                paused ? (
                  <IconPlayerPause className="w-3/4 h-3/4" />
                ) : (
                  <IconVariant variant={data.variant} className="w-3/4 h-3/4" />
                )
              }
            />
            {data.title}
          </RadixToast.Title>
          <RadixToast.Close asChild>
            <Button
              size={Size.Sm}
              // onClick={() => removeToast(data.id)}
              variant={data.variant}
              leftIcon={
                typeof data.dismiss !== "object" ? (
                  <IconX size={18} className="text-black" />
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
          <p className={clsx("dark:text-neutral-300 text-neutral-700 text-sm mb-3")}>
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

  const removeToast = useCallback(
    (id: string) => {
      setToasts((prevToasts: ToastData[]) => prevToasts.filter((toast) => toast.id !== id));
    },
    [setToasts],
  );

  const clear = useCallback(() => setToasts([]), [setToasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clear }}>
      <RadixToast.Provider swipeDirection="right" duration={4000}>
        <RadixToast.Viewport
          className={clsx(
            "max-sm:top-20 fixed top-4 right-4 flex w-80 flex-col-reverse gap-3 pointer-events-none z-2147483647",
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
