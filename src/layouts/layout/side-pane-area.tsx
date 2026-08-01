import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { clsx } from "clsx";
import { HeaderButton } from "../../buttons/header-button";
import { PaneRegion, PaneSpec, Size, Variant } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";

/**
 * The regions that dock beside the content when there is width for it. These are
 * the ones that have to go somewhere else when there is not.
 *
 * The footer is not one of them: it is a full-width strip under the content at
 * every size already, so it has no arrangement to adapt.
 */
const SIDE_REGIONS: readonly PaneRegion[] = [PaneRegion.Left, PaneRegion.Right];

function isOpenSidePane(pane: PaneSpec): boolean {
  return (
    pane.region !== undefined &&
    SIDE_REGIONS.includes(pane.region) &&
    pane.content !== undefined &&
    !pane.shouldClose
  );
}

/**
 * Every open side pane, oldest first — the back-stack, with the last entry showing.
 *
 * Order has to be remembered because nothing in `PaneSpec` records it: the pane
 * array is keyed by registration, not by when a pane was opened, and a pane can be
 * opened from any of several places (the menu, the header toggle, a selection). So
 * the ids accumulate across renders — surviving ids keep their position, newly
 * opened ones are appended.
 *
 * Computed during render rather than in an effect because the answer has to be
 * right for the first paint of a newly opened pane, or it appears underneath the
 * one it is replacing for a frame. Safe here: it is a pure function of the previous
 * order and the current ids, so re-running it lands on the same answer.
 *
 * Call this in ONE place and pass the result down. Two independent callers would
 * each keep their own ref and could disagree about which pane is on top.
 */
export function useSidePaneStack(): PaneSpec[] {
  const panes = usePanes();
  const open = panes.filter(isOpenSidePane);
  const openIds = open.map((pane) => pane.id);

  const orderRef = useRef<string[]>([]);
  const next = [
    ...orderRef.current.filter((id) => openIds.includes(id)),
    ...openIds.filter((id) => !orderRef.current.includes(id)),
  ];
  const unchanged =
    next.length === orderRef.current.length && next.every((id, i) => id === orderRef.current[i]);
  if (!unchanged) orderRef.current = next;

  return orderRef.current
    .map((id) => open.find((pane) => pane.id === id))
    .filter((pane): pane is PaneSpec => pane !== undefined);
}

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
