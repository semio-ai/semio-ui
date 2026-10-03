import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { HeaderButton } from "../../buttons/header-button";
import { PaneRegion, PaneSpec, Size, Variant } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { Icon } from "../../icons/registry";
import { paneCloseLabel } from "./pane-control-labels";

/**
 * The topmost pane actually taking space — the newest one that has not collapsed.
 *
 * A collapsed pane stays in the stack because it stays MOUNTED, which is the whole
 * point of collapsing rather than unregistering. It must not be what the row shows
 * or sizes itself from, though: taking the last entry unconditionally let a pane
 * that had given up its space keep the row at its old size and stay interactive —
 * the docked regions' behaviour inverted, since `leftWidthAtom`/`rightWidthAtom`
 * exclude collapsed panes.
 */
export function showingSidePane(stack: PaneSpec[]): PaneSpec | undefined {
  for (let index = stack.length - 1; index >= 0; index--) {
    if (stack[index].collapsed !== true) return stack[index];
  }
  return undefined;
}

/**
 * The size the side row should take: whatever the pane currently showing asks for.
 *
 * Mirrors `leftWidthAtom`/`rightWidthAtom` for the one-row case — `0fr` collapses
 * the row when nothing is open, or when everything open has collapsed; `1fr` lets a
 * `full` pane take the space the content gives up.
 */
export function sidePaneSize(stack: PaneSpec[]): string {
  const showing = showingSidePane(stack);
  if (!showing) return "0fr";
  if (showing.size === "full") return "1fr";
  return typeof showing.size === "string" ? showing.size : `${showing.size}px`;
}

/**
 * The side regions sharing one row, for viewports too narrow to dock them.
 *
 * Docked, Left and Right are concurrent — each has its own track beside the
 * content. There is no width for that on a phone, but a pane that is simply
 * dropped there changes what the app can *do* by screen size rather than how it
 * looks. So both regions render into the same row here and concurrency collapses
 * into a stack: the most recently opened pane is the one showing, opening another
 * covers it, and closing that one reveals it again.
 *
 * Panes under the top stay mounted — hidden, not unmounted — so going back to one
 * returns it as it was left, scroll position and internal navigation included.
 *
 * Deliberately the same presentation the Left region already had at this width: a
 * plain panel in its own row, with the content above it and the menu bar and footer
 * below. No scrim and no added header — the pane fills the row exactly as it fills
 * its dock, and the panes that carry a close control docked carry the same one here.
 */
export function SidePaneArea({ panes }: { panes: PaneSpec[] }) {
  const { completePanesClose, togglePaneRegion } = useLayoutActions();

  const showing = showingSidePane(panes);

  return (
    <AnimatePresence onExitComplete={completePanesClose}>
      {panes.map((pane) => {
        // By identity, not by position: a collapsed pane can sit above the one
        // showing and must not become it.
        const isTop = pane.id === showing?.id;
        return (
          <motion.div
            key={pane.id}
            // Rises from the bottom, the direction this row sits in relative to the
            // content — the same variant the footer region uses, and the one this
            // width already used before the region shared the row.
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            aria-hidden={!isTop}
            inert={isTop ? undefined : true}
            data-testid="side-pane"
            data-pane-id={pane.id}
            data-pane-showing={isTop ? "" : undefined}
            className={clsx(
              // Absolute so the stack occupies one box rather than several rows;
              // the container is the positioned ancestor.
              "absolute inset-0",
              "variant-scope card-transparent h-full w-full overflow-clip rounded-md",
              isTop ? "pointer-events-auto" : "pointer-events-none invisible",
              // The same named container the docked wrapper declares. Without it a
              // pane's `@[…]/pane:` rules would resolve against whatever container
              // happened to be above it — so pane content would silently change
              // layout as the viewport crossed the breakpoint, which is exactly what
              // asking about the pane's own width is meant to avoid.
              "@container/pane",
            )}
          >
            {pane.region === PaneRegion.Right && (
              <HeaderButton
                className={clsx("absolute top-1 right-1 z-1")}
                variant={Variant.Default}
                size={Size.Md}
                label={paneCloseLabel(pane)}
                icon={<Icon name="close" />}
                onClick={() => {
                  togglePaneRegion(PaneRegion.Right, pane.id, pane.preventClose);
                }}
              />
            )}
            {pane.content}
          </motion.div>
        );
      })}
    </AnimatePresence>
  );
}
