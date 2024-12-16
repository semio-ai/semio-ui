import {
  ReactNode,
  useMemo,
  createContext,
  useContext,
  useState,
  useCallback,
  memo,
  MouseEventHandler,
} from "react";
import { animated, useTransition, SpringValue } from "@react-spring/web";
import { clsx } from "clsx";
import { IconX } from "@tabler/icons-react";
import { Button } from "./buttons/button";
import { Size, Variant } from "./types";
import { getBasicTextColor, getGradient, getSeparatorStyle } from "./style-functions";

type SpringProperties = Record<string, SpringValue>;

export interface ToastState {
  toasts: ToastData[];
  addToast: (toast: ToastData) => void;
  clear: () => void;
  // Utilities
  refMap: WeakMap<object, any>;
  cancelMap: WeakMap<object, any>;
}

export const ToastContext = createContext<ToastState>({
  toasts: [],
  addToast: () => {},
  clear: () => {},
  refMap: new WeakMap(),
  cancelMap: new WeakMap(),
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

function Toast({
  data,
  life,
  style,
}: {
  data: ToastData;
  life: SpringValue<string>;
  style?: SpringProperties;
}) {
  const { refMap, cancelMap } = useContext(ToastContext);
  const [clicked, setClicked] = useState(false);

  const onClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    if (typeof data.dismiss === "object") {
      data.dismiss.onClick(data);
    }
    if (!clicked && cancelMap.has(data) && life.get() !== "0%") cancelMap.get(data)();
    setClicked(true);
  };
  return (
    <animated.div
      className={clsx("box-border relative overflow-hidden w-[30ch] pointer-events-auto")}
      style={style}
    >
      <div
        className={clsx(
          "overflow-hidden min-h-11 mt-3 items-center",
          "bg-neutral-50/50 dark:bg-neutral-950/50 backdrop-blur-lg shadow-md",
        )}
        ref={(ref: HTMLDivElement) => ref && refMap.set(data, ref)}
      >
        <animated.div
          className={clsx(
            "absolute top-0 left-0 right-0 w-auto h-0.5",
            typeof data.dismiss === "object" ? "opacity-100" : "opacity-40",
            typeof data.dismiss === "object"
              ? getSeparatorStyle(data.variant)
              : getGradient(data.variant),
          )}
        />
        <animated.div
          style={{ right: life }}
          className={clsx("absolute top-0 left-0 w-auto h-0.5", getGradient(data.variant))}
        />
        <div
          className={clsx(
            "bg-neutral-50/50 dark:bg-neutral-950/50",
            "flex flex-row h-11 px-2 justify-between items-center",
          )}
        >
          <p className={clsx("text-[15px]", getBasicTextColor(data.variant))}>{data.title}</p>
          <Button
            size={Size.Sm}
            onClick={onClick}
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
        </div>
        <div className={clsx(data.content !== "" && "p-3", "overflow-hidden")}>
          <p
            className={clsx(
              getBasicTextColor(Variant.Default),
              "transition-transform text-opacity-75 text-sm mb-3",
            )}
          >
            {data.content}
          </p>
        </div>
      </div>
    </animated.div>
  );
}

export interface ToastContainerProps {
  config?: {
    tension: number;
    friction: number;
    precision: number;
  };
  timeout?: number;
  children?: ReactNode;
}

function InnerToastManager({
  config = { tension: 125, friction: 20, precision: 0.1 },
  timeout = 3000,
  children,
}: ToastContainerProps) {
  const refMap = useMemo(() => new WeakMap(), []);
  const cancelMap = useMemo(() => new WeakMap(), []);
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const transitions = useTransition(toasts, {
    from: { opacity: 0, height: "auto", translateX: 500, life: "100%" },
    keys: (item) => item.id,
    enter: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({ opacity: 1, height: refMap.get(item).offsetHeight });
      await next({ life: "0%", translateX: 0 });
    },
    leave: [{ opacity: 0, translateX: 500, height: 0 }],
    onRest: (_result, _ctrl, item) => {
      setToasts((state) =>
        state.filter((i) => {
          return i.id !== item.id;
        }),
      );
    },
    config: (item, _index, phase) => (key) =>
      phase === "enter" && key === "life"
        ? {
            duration:
              typeof item.dismiss === "object"
                ? Number.POSITIVE_INFINITY
                : (item.dismiss ?? timeout),
          }
        : config,
  });

  const addToast = useCallback(
    (toast: ToastData) => {
      setToasts((prevToasts: ToastData[]) => [...prevToasts, toast]);
    },
    [setToasts],
  );

  const clear = useCallback(() => setToasts([]), [setToasts]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, clear, refMap, cancelMap }}>
      <div
        className={clsx(
          "fixed z-[1000] w-[0_auto] top-[30px] m-[0_auto] left-[30px] right-[30px]",
          "flex flex-col pointer-events-none items-end",
        )}
      >
        {transitions(({ life, ...style }, data) => (
          <Toast data={data} style={style} life={life} />
        ))}
      </div>
      {children}
    </ToastContext.Provider>
  );
}

export const ToastManager = memo(InnerToastManager);
