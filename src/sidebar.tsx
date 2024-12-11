import { ReactNode, useMemo } from "react";
import { clsx } from "clsx";
import { useTransition, animated, easings } from "@react-spring/web";

export interface SidebarChild {
  title: string;
  key: string;
  content: ReactNode;
}

export interface SidebarProps {
  children: SidebarChild[];
  sidebar: string | null;
}

export function Sidebar({ children, sidebar }: SidebarProps) {
  const child = children.find((c) => c.key === sidebar);
  const cancelMap = useMemo(() => new WeakMap(), []);

  const transitions = useTransition(child ? [{ key: "key" }] : [], {
    from: { opacity: 0, width: 0 },
    keys: (item) => item.key,
    enter: (item) => async (next, cancel) => {
      cancelMap.set(item, cancel);
      await next({ opacity: 1, width: 256 });
    },
    leave: [{ opacity: 0, width: 0 }],
    config: { duration: 50, easing: easings.easeInOutCubic },
  });

  return (
    <div>
      {transitions((style, data) => (
        <animated.div
          key={data.key}
          style={style}
          className={clsx(
            "dark:bg-neutral-800 bg-neutral-200 transition-all",
            "duration-150 h-full overflow-x-hidden overflow-auto",
          )}
        >
          {child?.content}
        </animated.div>
      ))}
    </div>
  );
}
