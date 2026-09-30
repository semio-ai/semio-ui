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
          const collapsed = pane.collapsed === true;
          // Collapsing gives up space along ONE axis — the footer's height, a side
          // pane's width — and looks like leaving while it does it.
          //
          // Expressed as an animation target rather than an inline size, so it runs
          // on the same transition the pane already enters and exits on. Zeroing the
          // size inline instead made collapsing the one way out of a region that
          // snapped, while unregistering — the thing collapsing replaces — still
          // animated. Same intent, visibly different, which reads as a glitch rather
          // than a choice.
          //
          // Collapsing gives up space along ONE axis — the footer's height, a side
          // pane's width — and it animates, because it stands in for unregistering
          // and has to read as the same act. Zeroing the size outright made the one
          // way out of a region that snapped while every other one animated.
          //
          // Motion rather than a CSS transition, and `auto` rather than `100%`, for
          // the footer: its row is sized by the pane's own content, so `h-full`
          // resolves to `auto` — and CSS cannot interpolate `auto` to a length,
          // which is why declaring a transition on it silently does nothing. Motion
          // measures the element and tweens between pixels. A side pane's track is
          // definite, so `100%` is a real length there.
          const axis = region === PaneRegion.Footer ? "height" : "width";
          const openSize = region === PaneRegion.Footer ? "auto" : "100%";
          const target = collapsed
            ? { ...variants[0], [axis]: 0 }
            : { ...variants[1], [axis]: openSize };
          return (
            <motion.div
              // layout
              key={pane.id}
              initial={variants[0]}
              animate={target}
              exit={variants[0]}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              // Unreachable from the moment it is asked to collapse, rather than when
              // the animation lands: it is on its way out either way, and something
              // already fading should not still be focusable.
              aria-hidden={collapsed ? true : undefined}
              inert={collapsed ? true : undefined}
              className={clsx(
                "relative w-full",
                collapsed ? "pointer-events-none" : "pointer-events-auto",
                "variant-scope card-transparent h-full overflow-clip rounded-md",
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
                  label="Close inspector"
                  icon={<Icon name="close" />}
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
