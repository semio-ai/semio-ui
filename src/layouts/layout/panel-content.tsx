import { AnimatePresence, motion, TargetAndTransition } from "motion/react";
import { IconChevronRightPipe } from "@tabler/icons-react";
import { clsx } from "clsx";
import { HeaderButton } from "../../buttons/header-button";
import { PaneRegion, Size, Variant } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes, useDesktopState } from "../../hooks/layout-atoms";

export function PanelContent({ region }: { region: PaneRegion }) {
  const panes = usePanes();
  const desktop = useDesktopState();
  const { completePanesClose, togglePaneRegion } = useLayoutActions();

  return (
    <AnimatePresence mode="wait" onExitComplete={completePanesClose}>
      {panes.map((pane) => {
        if (
          pane.region === region &&
          pane.content &&
          !pane.shouldClose &&
          !(!desktop && pane.region === PaneRegion.Right)
        ) {
          const variants = getVariants(
            !desktop ? PaneRegion.Footer : region,
            pane?.size === "full",
          );
          return (
            <motion.div
              // layout
              key={pane.id}
              initial={variants[0]}
              animate={variants[1]}
              exit={variants[0]}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className={clsx(
                "relative w-full pointer-events-auto",
                "responsive card-transparent h-full rounded-md overflow-clip",
              )}
            >
              {pane.region === PaneRegion.Right && (
                <HeaderButton
                  className={clsx("absolute top-1 right-1 z-1")}
                  variant={Variant.Default}
                  size={Size.Md}
                  label="Toggle Menu"
                  icon={
                    <IconChevronRightPipe
                      className={clsx(
                        "transition-transform w-3/5 h-3/5 ease-in-out duration-100",
                        !pane.shouldClose ? "rotate-360" : "rotate-180",
                      )}
                    />
                  }
                  onClick={() => {
                    togglePaneRegion(PaneRegion.Right, pane.id, pane.preventClose);
                  }}
                />
              )}
              {pane.content}
            </motion.div>
          );
        } else return null;
      })}
    </AnimatePresence>
  );
}

function getVariants(
  region: PaneRegion,
  full: boolean,
): [TargetAndTransition, TargetAndTransition] {
  if (full) {
    return [
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1 },
    ];
  }
  switch (region) {
    case PaneRegion.Left:
      return [
        { opacity: 0, x: -50 },
        { opacity: 1, x: 0 },
      ];
    case PaneRegion.Right:
      return [
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0 },
      ];
    case PaneRegion.Footer:
      return [
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0 },
      ];
  }
}
