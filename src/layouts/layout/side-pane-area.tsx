import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { HeaderButton } from "../../buttons/header-button";
import { PaneRegion, PaneSpec, Size, Variant } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { Icon } from "../../icons/registry";

/**
 * The size the side row should take: whatever the pane currently showing asks for.
 *
 * Mirrors `leftWidthAtom`/`rightWidthAtom` for the one-row case — `0fr` collapses
 * the row when nothing is open, `1fr` lets a `full` pane take the space the content
 * gives up.
 */
export function sidePaneSize(stack: PaneSpec[]): string {
  const showing = stack[stack.length - 1];
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

  return (
    <AnimatePresence onExitComplete={completePanesClose}>
      {panes.map((pane, index) => {
        const isTop = index === panes.length - 1;
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
            data-testid="side-pane"
            data-pane-id={pane.id}
            data-pane-showing={isTop ? "" : undefined}
            className={clsx(
              // Absolute so the stack occupies one box rather than several rows;
              // the container is the positioned ancestor.
              "absolute inset-0",
              "responsive card-transparent h-full w-full overflow-clip rounded-md",
              isTop ? "pointer-events-auto" : "pointer-events-none invisible",
            )}
          >
            {pane.region === PaneRegion.Right && (
              // `close`, not the docked pane's `sidebar-toggle`. That glyph is a
              // chevron-into-a-bar pointing sideways — it reads as "fold this back
              // against the edge it came from", which is what a docked pane does
              // and the opposite of what happens here: this pane rose from the
              // bottom of a full-width row, and dismissing it is not a fold in any
              // direction. Nothing rotates for the same reason.
              <HeaderButton
                className={clsx("absolute top-1 right-1 z-1")}
                variant={Variant.Default}
                size={Size.Md}
                label="Close panel"
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
