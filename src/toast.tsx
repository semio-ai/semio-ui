import {
  ReactNode,
  createContext,
  useContext,
  useState,
  useCallback,
  memo,
  CSSProperties,
  useEffect,
} from "react";
import { animated, useSpringValue } from "@react-spring/web";
import * as RadixToast from "@radix-ui/react-toast";
import useMeasure from "react-use-measure";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { Button } from "./buttons/button";
import { Size, Variant } from "./types";
import { getBasicTextColor, getGradient, getSeparatorStyle } from "./style-functions";

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
  config?: {
    tension: number;
    friction: number;
    precision: number;
  };
  timeout?: number;
  children?: ReactNode;
}

export interface ToastData {
  id: string;
  title: string;
  content: string;
  variant?: Variant;
  dismiss?:
    | {
        label: string;
        onClick: (data: ToastData) => void;
      }
    | number;
}

function InnerToast({ data }: { data: ToastData }) {
  const { removeToast } = useContext(ToastContext);
  const [ref, bounds] = useMeasure();

  const width = useSpringValue("0%", {
    config: {
      duration: 4000,
    },
  });

  useEffect(() => {
    void width.start("100%");
  }, [width]);

  return (
    <RadixToast.Root
      duration={4000}
      className={clsx(
        "box-border relative overflow-hidden w-[30ch] pointer-events-auto select-none",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[state=closed]:animate-toastSwipeOut data-[state=open]:animate-toastSlideIn data-[swipe=end]:animate-toastSwipeOut",
        "data-[state=closed]:h-0 data-[state=open]:h-[var(--radix-toast-height)] transition-[height_300ms_ease-out]",
        "data-[swipe=cancel]:transition-[transform_200ms_ease-out]",
      )}
      style={
        {
          "--radix-toast-height": `${bounds.height.toString()}px`,
        } as CSSProperties
      }
      onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => removeToast(data.id), 400);
        } else {
          console.log("Toast opened");
        }
      }}
      onPause={() => {
        width.pause();
      }}
      onResume={() => {
        width.resume();
      }}
    >
      <div
        ref={ref}
        className={clsx(
          "overflow-hidden items-center",
          "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg shadow-md",
        )}
      >
        <div
          className={clsx(
            "absolute top-0 left-0 right-0 w-auto h-0.5",
            typeof data.dismiss === "object" ? "opacity-100" : "opacity-40",
            typeof data.dismiss === "object"
              ? getSeparatorStyle(data.variant)
              : getGradient(data.variant),
          )}
        >
          <animated.div
            style={{
              width,
            }}
            className={clsx("absolute top-0 left-0 h-0.5", getGradient(data.variant))}
          />
        </div>
        <div
          className={clsx(
            "bg-neutral-50/50 dark:bg-neutral-950/50",
            "flex flex-row h-11 px-2 justify-between items-center",
          )}
        >
          <RadixToast.Title className={clsx("text-[15px]", getBasicTextColor(data.variant))}>
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
        <RadixToast.Description className={clsx(data.content !== "" && "p-3", "overflow-hidden")}>
          <p
            className={clsx(
              getBasicTextColor(Variant.Default),
              "transition-transform text-opacity-75 text-sm mb-3",
            )}
          >
            {data.content}
          </p>
        </RadixToast.Description>
      </div>
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
      <RadixToast.Provider swipeDirection="right">
        <RadixToast.Viewport
          className={clsx(
            "pointer-events-none fixed top-0 right-0 z-[2147483647] m-0 flex w-[390px]",
            "max-w-[100vw] list-none flex-col gap-2.5 p-[var(--viewport-padding)]",
            "outline-none [--viewport-padding:_60px]",
          )}
        />
        {toasts.map((toast) => (
          <Toast key={toast.id} data={toast} />
        ))}
        {children}
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

export const ToastManager = memo(InnerToastManager);
