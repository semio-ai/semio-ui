import { AnimatePresence, motion, TargetAndTransition } from "motion/react";
import { clsx } from "clsx";
import { HeaderButton } from "../../buttons/header-button";
import { PaneRegion, Size, Variant } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";

/**
 * One region's panes, in a track of their own.
 *
 * That is every region on a viewport wide enough to dock the side ones, plus the
 * footer region at any width. Narrower, the side regions share a single row and
 * are rendered by `SidePaneArea` instead — which is why the mobile special-casing
 * that used to live here is gone, along with the filter that dropped Right-region
 * panes rather than rehoming them.
 */
export function PanelContent({ region }: { region: PaneRegion }) {
  const panes = usePanes();
  const { completePanesClose, togglePaneRegion } = useLayoutActions();

  return (
    <AnimatePresence mode="wait" onExitComplete={completePanesClose}>
      {panes.map((pane) => {
        if (pane.region === region && pane.content && !pane.shouldClose) {
          // A pane taking the content area's space slides in from nowhere in
          // particular, so it scales instead — whether it got there by spanning
          // (`expanded`) or by collapsing the content track (`size: "full"`).
          const variants = getVariants(region, pane.expanded === true || pane.size === "full");
          return (
            <motion.div
              // layout
              key={pane.id}
              initial={variants[0]}
              animate={variants[1]}
              exit={variants[0]}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              // Collapsed: no size, no hit target, not announced — but still
              // rendered, so its state and anything expensive inside it survive.
              // Set inline rather than as a utility class so it beats the sizing
              // classes below deterministically, whatever order they emit in.
              style={pane.collapsed ? { height: 0, width: 0 } : undefined}
              aria-hidden={pane.collapsed ? true : undefined}
              inert={pane.collapsed ? true : undefined}
              className={clsx(
                "relative w-full",
                pane.collapsed ? "pointer-events-none" : "pointer-events-auto",
                "responsive card-transparent h-full overflow-clip rounded-md",
                // Every pane is a query container, NAMED so nested containers in
                // pane content stay unambiguous: `@[800px]/pane:` asks about the
                // pane's own width. That is the only correct question for a pane
                // deciding its internal layout — the viewport `desktop:`
                // breakpoint cannot see a right sidebar taking half the room, and
                // a pane that can expand changes width without the window moving.
                "@container/pane",
              )}
            >
              {pane.region === PaneRegion.Right && (
                <HeaderButton
                  className={clsx("absolute top-1 right-1 z-1")}
                  variant={Variant.Default}
                  size={Size.Md}
                  label="Close panel"
                  icon={
                    <Icon
                      name="sidebar-toggle"
                      className={clsx(
                        "transition-transform duration-100 ease-in-out",
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
