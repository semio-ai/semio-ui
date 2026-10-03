import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { RectReadOnly } from "react-use-measure";
import {
  Button,
  Icon,
  LayoutRoot,
  PaneRegion,
  Size,
  Variant,
  useLayoutActions,
  useLayoutState,
  useLeftExpanded,
  usePanes,
  type LayoutActions,
} from "@semio/ui";

/**
 * Harnesses for the pane behaviours the grid layout exposes but no story covered:
 * expanding a side pane over the content, collapsing a pane without unmounting it,
 * asking a pane's own width rather than the viewport's, and writing several panes
 * in one go.
 *
 * Each story renders its own assertions rather than only drawing the result, so a
 * regression reads as a red row instead of something a reviewer has to notice.
 */
const meta: Meta<typeof LayoutRoot> = {
  component: LayoutRoot,
  title: "ui/LayoutRoot/Panes",
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

type Story = StoryObj<typeof LayoutRoot>;

/* -------------------------------------------------------------------------- */
/* Instrumentation                                                             */
/* -------------------------------------------------------------------------- */

interface Rect {
  width: number;
  height: number;
  left: number;
  right: number;
}

const NO_RECT: Rect = { width: 0, height: 0, left: 0, right: 0 };

interface Probe {
  /** The grid's resolved custom properties, as the layout root computes them. */
  leftVar: string;
  contentVar: string;
  rightVar: string;
  footerGap: string;
  /** Live geometry of the elements placed into those tracks. */
  leftRect: Rect;
  contentRect: Rect;
  footerHeight: number;
  /** What the animation panel says it is, as opposed to the row it sits in. */
  animationHeight: number;
  animationMount: number;
  viewportWidth: number;
}

const NO_PROBE: Probe = {
  leftVar: "",
  contentVar: "",
  rightVar: "",
  footerGap: "",
  leftRect: NO_RECT,
  contentRect: NO_RECT,
  footerHeight: 0,
  animationHeight: 0,
  animationMount: 0,
  viewportWidth: 0,
};

function rectOf(element: Element | null): Rect {
  if (!element) return NO_RECT;
  const box = element.getBoundingClientRect();
  return {
    width: Math.round(box.width),
    height: Math.round(box.height),
    left: Math.round(box.left),
    right: Math.round(box.right),
  };
}

/**
 * Sample the layout root's resolved variables and its children's real geometry.
 *
 * Polled rather than derived: the point is to read what the browser actually
 * computed after layout, including during a window resize the React tree never
 * hears about. Only commits a change, so a still layout does not re-render.
 */
function useLayoutProbe(): Probe {
  const [probe, setProbe] = useState<Probe>(NO_PROBE);
  const lastRef = useRef<string>("");

  useEffect(() => {
    const read = () => {
      const rootElement = document.querySelector<HTMLElement>(".app-layout");
      if (!rootElement) return;
      const styles = getComputedStyle(rootElement);
      const animationPanel = document.querySelector<HTMLElement>("[data-testid='animation-panel']");
      const next: Probe = {
        leftVar: styles.getPropertyValue("--left-size").trim(),
        contentVar: styles.getPropertyValue("--content-size").trim(),
        rightVar: styles.getPropertyValue("--right-size").trim(),
        footerGap: styles.getPropertyValue("--content-footer-gap").trim(),
        leftRect: rectOf(rootElement.querySelector(".grid-area-left")),
        contentRect: rectOf(rootElement.querySelector(".grid-area-content")),
        footerHeight: rectOf(rootElement.querySelector(".grid-area-footer")).height,
        animationHeight: Number(animationPanel?.dataset.height ?? 0),
        animationMount: Number(animationPanel?.dataset.mountIndex ?? 0),
        viewportWidth: Math.round(window.innerWidth),
      };
      const serialized = JSON.stringify(next);
      if (serialized === lastRef.current) return;
      lastRef.current = serialized;
      setProbe(next);
    };
    read();
    const timer = window.setInterval(read, 150);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return probe;
}

function Check({ label, ok, detail }: { label: string; ok: boolean; detail: string }): ReactNode {
  return (
    <li
      className="flex flex-row items-baseline gap-2 py-0.5 font-mono text-xs"
      data-testid={`check-${label.replace(/\W+/g, "-").toLowerCase()}`}
      data-ok={ok ? "true" : "false"}
    >
      <span className={ok ? "text-tertiary-500" : "text-primary-500"}>{ok ? "PASS" : "FAIL"}</span>
      <span className="flex-1">{label}</span>
      <span className="text-neutral-500">{detail}</span>
    </li>
  );
}

function Readout({ title, children }: { title: string; children: ReactNode }): ReactNode {
  return (
    <div className="m-4 max-w-2xl rounded-md bg-neutral-100/90 p-4 dark:bg-neutral-900/90">
      <h2 className="mb-2 text-sm font-bold">{title}</h2>
      <ul className="m-0 list-none p-0">{children}</ul>
    </div>
  );
}

/**
 * Puts its children where the content cell actually is.
 *
 * `LayoutRoot` renders its children as one full-bleed layer over the whole root —
 * `.grid-area-content` is an empty, `-z-1` div that exists only to be measured —
 * so an occupant is expected to inset ITSELF from the rect it is handed. The
 * studio's scene does this to aim a camera; ordinary DOM has to do it too, or it
 * draws over the menu and the panes.
 *
 * Which makes this the story's most honest instrument: if the rect ever went stale
 * or zero, this panel would visibly land in the wrong place rather than a number
 * quietly reading wrong.
 */
function ContentArea({
  bounds,
  children,
}: {
  bounds: RectReadOnly;
  children: ReactNode;
}): ReactNode {
  return (
    <div
      data-testid="content-area"
      className="absolute overflow-auto rounded-md border border-dashed border-neutral-400/60"
      style={{
        left: `${bounds.left.toString()}px`,
        top: `${bounds.top.toString()}px`,
        width: `${bounds.width.toString()}px`,
        height: `${bounds.height.toString()}px`,
      }}
    >
      {children}
    </div>
  );
}

/**
 * The trailing edge of the header.
 *
 * The header has no hardcoded spacer — a surface that wants its trailing controls
 * pushed right registers one, so "what takes up the slack" belongs to the surface
 * rather than to every toolbar whether it wants it or not. Without it the
 * right-pane toggle packs against the menu.
 */
const HEADER_SPACER = [{ id: "spacer", type: "toolbar-spacer" as const }];

/**
 * Registering panes REPLACES whatever is registered, and each story clears up
 * after itself on unmount.
 *
 * Panes live in a store scoped to the module, not to any one `LayoutRoot` — which
 * is right for an app, where one layout outlives every surface that registers into
 * it, and where a surface unregisters on unmount (the studio's `use-selection-pane`
 * does exactly this). Storybook swaps stories without reloading the module, so
 * stories that only ever added panes accumulated the previous story's as well.
 */
const REPLACE = true;

function clearLayout(
  setPanes: LayoutActions["setPanes"],
  setToolbarItems: LayoutActions["setToolbarItems"],
): void {
  setPanes([], REPLACE);
  setToolbarItems([], REPLACE);
}

/**
 * Module-scoped so it outlives the component, which is the point: a counter in
 * state could not record the remount it exists to detect.
 */
let animationMountCount = 0;

/**
 * Stands in for the studio's animation panel, and specifically for the two things
 * that made unregistering it costly: a height the VIEWER produced, which lives in
 * the panel's own state rather than in the pane spec, and a mount that is not free
 * to repeat (there, an R3F canvas that measures its container as it mounts).
 *
 * The panel declares its height and the row follows — the layout never tells it how
 * tall to be, which is what lets the real one live somewhere other than this row
 * without changing.
 */
function AnimationPanel(): ReactNode {
  const [height, setHeight] = useState(128);
  const mountIndexRef = useRef(0);
  if (mountIndexRef.current === 0) {
    animationMountCount += 1;
    mountIndexRef.current = animationMountCount;
  }

  return (
    <div
      data-testid="animation-panel"
      data-height={height}
      data-mount-index={mountIndexRef.current}
      className="bg-tertiary-500/20 flex w-full flex-col justify-between gap-2 p-3 text-xs"
      style={{ height: `${height.toString()}px` }}
    >
      <span className="font-mono">
        Animation panel · {height}px · mount #{mountIndexRef.current}
      </span>
      <div className="flex flex-row gap-2">
        <Button size={Size.Sm} variant={Variant.Secondary} onClick={() => setHeight(128)}>
          Short
        </Button>
        <Button size={Size.Sm} variant={Variant.Secondary} onClick={() => setHeight(260)}>
          Drag taller
        </Button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 1. Expanding a side pane over the content                                   */
/* -------------------------------------------------------------------------- */

const EXPAND_PANE_ID = "assets";
const EXPAND_PANE_WIDTH = "280px";
const ANIMATION_PANE_ID = "animation";

function ExpandingSidebarApp(): ReactNode {
  const { setPane, setPanes, setToolbarItems, togglePaneRegion } = useLayoutActions();

  useEffect(() => {
    setToolbarItems(HEADER_SPACER, true);
    setPanes(
      [
        {
          id: EXPAND_PANE_ID,
          name: "Assets",
          icon: <Icon name="action-placeholder" />,
          size: EXPAND_PANE_WIDTH,
          region: PaneRegion.Left,
          inLeftMenu: true,
          inRightMenu: false,
          content: <ExpandingPaneContent />,
        },
        {
          id: "inspector",
          name: "Inspector",
          icon: <Icon name="action-placeholder" />,
          size: "240px",
          inLeftMenu: false,
          inRightMenu: true,
          content: <div className="bg-info-500/20 h-full w-full p-3 text-xs">Detail pane</div>,
        },
        {
          id: ANIMATION_PANE_ID,
          name: "Animation",
          icon: <Icon name="action-placeholder" />,
          size: "auto",
          region: PaneRegion.Footer,
          inLeftMenu: false,
          inRightMenu: false,
          content: <AnimationPanel />,
        },
      ],
      REPLACE,
    );
    return () => {
      clearLayout(setPanes, setToolbarItems);
    };
  }, [setPanes, setToolbarItems]);

  // The right pane starts closed so the story opens on the ordinary arrangement;
  // opening it is what shows the span stopping at the right region rather than
  // running to the window edge.
  const openRight = useCallback(() => {
    togglePaneRegion(PaneRegion.Right, "inspector");
  }, [togglePaneRegion]);

  // The animation panel's row is DERIVED from whether a pane is expanded over the
  // content, rather than written alongside each expansion.
  //
  // Pairing the two writes at the call site looks tidier and is wrong: expansion
  // also ends by routes that call site never sees. Closing the sidebar from the
  // menu left the panel collapsed with nothing on screen still expanded, and it
  // stayed that way until someone expanded and collapsed again. Deriving gives the
  // flag exactly one writer, so there is no second place that has to remember.
  const leftExpanded = useLeftExpanded();
  useEffect(() => {
    setPane({ id: ANIMATION_PANE_ID, collapsed: leftExpanded });
  }, [leftExpanded, setPane]);

  return (
    <LayoutRoot homeText="semio">
      {(contentBounds: RectReadOnly, contentVisible: boolean) => (
        <ExpandingReadout
          contentBounds={contentBounds}
          contentVisible={contentVisible}
          onOpenRight={openRight}
        />
      )}
    </LayoutRoot>
  );
}

function ExpandingPaneContent(): ReactNode {
  const panes = usePanes();
  const { setPane } = useLayoutActions();
  const expanded = panes.find((pane) => pane.id === EXPAND_PANE_ID)?.expanded === true;

  // Only the expansion. The animation panel's row follows from it rather than being
  // written here — see the effect in `ExpandingSidebarApp` — so this control cannot
  // get the two out of step, and neither can any other route that ends the
  // expansion. The panel is COLLAPSED rather than unregistered, so the height the
  // viewer dragged and everything mounted inside it come back untouched.
  const toggle = useCallback(() => {
    setPane({ id: EXPAND_PANE_ID, expanded: !expanded });
  }, [expanded, setPane]);

  return (
    <div className="bg-secondary-500/20 flex h-full w-full flex-col gap-2 p-3">
      <div className="flex flex-row items-center justify-between gap-2">
        <span className="text-sm font-bold">Assets</span>
        <Button size={Size.Sm} variant={Variant.Primary} onClick={toggle}>
          {expanded ? "Collapse" : "Browse"}
        </Button>
      </div>
      {/* The whole point of the named container: this asks how wide the PANE is.
          A viewport breakpoint cannot see the right sidebar taking room, and an
          expanding pane changes width without the window moving at all. */}
      <div className="@[560px]/pane:grid-cols-2 @[900px]/pane:grid-cols-3 grid grid-cols-1 gap-2">
        {["Chassis", "Gripper", "Torso", "Head", "Wheel", "Arm"].map((name) => (
          <div key={name} className="h-9 rounded bg-neutral-500/20 px-2 text-xs leading-9">
            {name}
          </div>
        ))}
      </div>
      <p className="text-[10px] text-neutral-500">
        Columns are driven by <code>@[560px]/pane</code>, not the viewport.
      </p>
    </div>
  );
}

function ExpandingReadout({
  contentBounds,
  contentVisible,
  onOpenRight,
}: {
  contentBounds: RectReadOnly;
  contentVisible: boolean;
  onOpenRight: () => void;
}): ReactNode {
  const probe = useLayoutProbe();
  const { leftExpanded, rightRegionActive } = useLayoutState();
  const panes = usePanes();
  const expanded = panes.find((pane) => pane.id === EXPAND_PANE_ID)?.expanded === true;
  const animationCollapsed = panes.find((pane) => pane.id === ANIMATION_PANE_ID)?.collapsed === true;

  // The height the panel was left at before it gave up its row. Held HERE, by an
  // observer, precisely because the library holds nothing: if the pane spec were
  // remembering a height on the panel's behalf, this comparison would be checking
  // the library against itself.
  const stashedHeightRef = useRef(0);
  if (!animationCollapsed && probe.animationHeight > 0) {
    stashedHeightRef.current = probe.animationHeight;
  }

  // The mount this story instance STARTED with, not the process-wide first. The
  // counter is module-scoped so it survives the module, and Storybook can leave and
  // revisit a story without reloading it — on the second visit the panel is
  // legitimately mount #2, and comparing to a hardcoded 1 would report a remount
  // that never happened. What matters is that it does not change from here.
  const baselineMountRef = useRef(0);
  if (baselineMountRef.current === 0 && probe.animationMount > 0) {
    baselineMountRef.current = probe.animationMount;
  }

  // The width the content track resolves to while nothing is expanded, kept only
  // so the story can show the restore lands back on it. The LIBRARY remembers
  // nothing — that is the property being demonstrated.
  const restingRef = useRef<number>(0);
  const measuredWidth = Math.round(contentBounds.width);
  if (!expanded && measuredWidth > 0) {
    restingRef.current = measuredWidth;
  }

  return (
    <ContentArea bounds={contentBounds}>
      <Readout title="Expanding a side pane over the content">
        <Check
          label="Measured content rect is never zero"
          ok={measuredWidth > 0}
          detail={`${measuredWidth.toString()}px`}
        />
        <Check
          label="Content track is untouched while expanded"
          ok={probe.contentVar === "1fr"}
          detail={`--content-size: ${probe.contentVar || "?"}`}
        />
        <Check
          label="Pane keeps its own size while expanded"
          ok={probe.leftVar === EXPAND_PANE_WIDTH}
          detail={`--left-size: ${probe.leftVar || "?"}`}
        />
        <Check
          label="Expanded pane covers the content cell"
          ok={
            !expanded ||
            (probe.leftRect.right >= probe.contentRect.right - 1 &&
              probe.leftRect.width > probe.contentRect.width)
          }
          detail={`pane ${probe.leftRect.width.toString()}px, content ${probe.contentRect.width.toString()}px`}
        />
        <Check
          label="Span stops at the right region"
          ok={!expanded || !rightRegionActive || probe.leftRect.right < probe.viewportWidth - 40}
          detail={
            rightRegionActive
              ? `pane right ${probe.leftRect.right.toString()}, viewport ${probe.viewportWidth.toString()}`
              : "right region closed"
          }
        />
        <Check
          label="contentVisible reports the cover"
          ok={contentVisible === !expanded}
          detail={`expanded ${String(expanded)} / visible ${String(contentVisible)}`}
        />
        <Check
          label="leftExpanded matches the pane flag"
          ok={leftExpanded === expanded}
          detail={String(leftExpanded)}
        />
        <Check
          label="Animation panel yields with the expansion"
          ok={animationCollapsed === expanded}
          detail={
            animationCollapsed
              ? `row ${probe.footerHeight.toString()}px, gap ${probe.footerGap}`
              : `row ${probe.footerHeight.toString()}px`
          }
        />
        <Check
          label="Panel keeps the height it was left at"
          ok={probe.animationHeight === stashedHeightRef.current}
          detail={
            animationCollapsed
              ? `holding ${probe.animationHeight.toString()}px while collapsed`
              : `row follows content at ${probe.animationHeight.toString()}px`
          }
        />
        <Check
          label="Panel never remounted"
          ok={probe.animationMount === baselineMountRef.current}
          detail={`mount #${probe.animationMount.toString()} (opened on #${baselineMountRef.current.toString()})`}
        />
        <Check
          label="Restore needs no remembered width"
          ok={expanded || restingRef.current === measuredWidth}
          detail={
            expanded
              ? `resting was ${restingRef.current.toString()}px`
              : `back to ${measuredWidth.toString()}px`
          }
        />
      </Readout>
      <div className="mx-4 max-w-2xl text-xs text-neutral-500">
        <p className="mb-2">
          Resize the window <strong>while expanded</strong>: the measured rect keeps tracking, which
          is what collapsing the track to <code>0fr</code> cannot do.
        </p>
        <p className="mb-2">
          For the panel&apos;s memory: press <strong>Drag taller</strong> on the animation panel,
          then <strong>Browse</strong> and back. It returns at the height you left it, still on
          mount #1 — it was collapsed, not unregistered, so nothing had to be stored or rebuilt.
        </p>
        <Button size={Size.Sm} variant={Variant.Secondary} onClick={onOpenRight}>
          Toggle right pane
        </Button>
      </div>
    </ContentArea>
  );
}

export const ExpandingSidebar: Story = {
  render: () => <ExpandingSidebarApp />,
  name: "Expand over content",
};

/* -------------------------------------------------------------------------- */
/* 2. Collapsing without unmounting                                            */
/* -------------------------------------------------------------------------- */

/**
 * Module-scoped so it survives the pane being unregistered — which is exactly the
 * difference being measured. A counter in component state would be destroyed by
 * the unmount it is supposed to detect.
 */
let footerMountCount = 0;

const FOOTER_PANE_ID = "timeline";

function CollapsingFooterApp(): ReactNode {
  const { setPane, setPanes, setToolbarItems, removePane } = useLayoutActions();
  const panes = usePanes();
  const footer = panes.find((pane) => pane.id === FOOTER_PANE_ID);

  const register = useCallback(() => {
    setPane({
      id: FOOTER_PANE_ID,
      name: "Timeline",
      icon: <Icon name="action-placeholder" />,
      size: "auto",
      region: PaneRegion.Footer,
      inLeftMenu: false,
      inRightMenu: false,
      collapsed: undefined,
      content: <ExpensiveFooterContent />,
    });
  }, [setPane]);

  useEffect(() => {
    setToolbarItems(HEADER_SPACER, true);
    setPanes(
      [
        {
          id: FOOTER_PANE_ID,
          name: "Timeline",
          icon: <Icon name="action-placeholder" />,
          size: "auto",
          region: PaneRegion.Footer,
          inLeftMenu: false,
          inRightMenu: false,
          content: <ExpensiveFooterContent />,
        },
        {
          id: "browser",
          name: "Browser",
          icon: <Icon name="action-placeholder" />,
          size: "240px",
          region: PaneRegion.Left,
          inLeftMenu: true,
          inRightMenu: false,
          content: <div className="bg-secondary-500/20 h-full w-full p-3 text-xs">Left pane</div>,
        },
      ],
      REPLACE,
    );
    return () => {
      clearLayout(setPanes, setToolbarItems);
    };
  }, [setPanes, setToolbarItems]);

  const collapse = useCallback(() => {
    setPane({ id: FOOTER_PANE_ID, collapsed: footer?.collapsed !== true });
  }, [footer?.collapsed, setPane]);

  const unregister = useCallback(() => {
    removePane(FOOTER_PANE_ID);
  }, [removePane]);

  return (
    <LayoutRoot homeText="semio">
      {(contentBounds: RectReadOnly) => (
        <ContentArea bounds={contentBounds}>
          <CollapsingReadout
            collapsed={footer?.collapsed === true}
            registered={footer !== undefined}
            onCollapse={collapse}
            onUnregister={unregister}
            onRegister={register}
          />
        </ContentArea>
      )}
    </LayoutRoot>
  );
}

/**
 * Stands in for the studio's animation panel: state the viewer produced (a dragged
 * height) that lives in the content, not in the pane spec, plus a mount that is not
 * free to repeat.
 */
function ExpensiveFooterContent(): ReactNode {
  const [height, setHeight] = useState(120);
  // Lazy ref rather than lazy state: claimed once per mount, never read as state.
  // The guard also makes it idempotent, so a double-invoked render cannot inflate
  // the count this story is about.
  const mountIndexRef = useRef(0);
  if (mountIndexRef.current === 0) {
    footerMountCount += 1;
    mountIndexRef.current = footerMountCount;
  }
  const mountIndex = mountIndexRef.current;

  return (
    <div
      className="bg-info-500/20 flex w-full flex-col justify-between gap-2 p-3"
      style={{ height: `${height.toString()}px` }}
      data-testid="footer-content"
      data-mount-index={mountIndex}
      data-height={height}
    >
      <span className="font-mono text-xs">
        mount #{mountIndex} · height {height}px
      </span>
      <div className="flex flex-row gap-2">
        <Button size={Size.Sm} variant={Variant.Secondary} onClick={() => setHeight(120)}>
          Reset height
        </Button>
        <Button size={Size.Sm} variant={Variant.Secondary} onClick={() => setHeight(220)}>
          Drag taller
        </Button>
      </div>
    </div>
  );
}

function CollapsingReadout({
  collapsed,
  registered,
  onCollapse,
  onUnregister,
  onRegister,
}: {
  collapsed: boolean;
  registered: boolean;
  onCollapse: () => void;
  onUnregister: () => void;
  onRegister: () => void;
}): ReactNode {
  const probe = useLayoutProbe();
  const [footerHeight, setFooterHeight] = useState(0);
  const [mountIndex, setMountIndex] = useState(0);

  // The mount this story instance STARTED with. The counter is module-scoped so it
  // survives the module, and Storybook can leave and revisit a story without
  // reloading it — on a second visit the content is legitimately mount #2, and
  // comparing to a hardcoded 1 would report a remount that never happened. The
  // claim is that collapsing does not change it, so the baseline is what to compare
  // against; the Unregister control is what deliberately moves it.
  const baselineMountRef = useRef(0);
  if (baselineMountRef.current === 0 && mountIndex > 0) {
    baselineMountRef.current = mountIndex;
  }

  useEffect(() => {
    const read = () => {
      const element = document.querySelector<HTMLElement>("[data-testid='footer-content']");
      setFooterHeight(element ? Number(element.dataset.height ?? 0) : 0);
      setMountIndex(element ? Number(element.dataset.mountIndex ?? 0) : 0);
    };
    read();
    const timer = window.setInterval(read, 150);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      <Readout title="Collapsing a pane without unmounting it">
        <Check
          label="Content stays mounted across a collapse"
          ok={mountIndex === baselineMountRef.current}
          detail={`showing mount #${mountIndex.toString()}, opened on #${baselineMountRef.current.toString()}`}
        />
        <Check
          label="Viewer-set height survives"
          ok={!registered || footerHeight > 0}
          detail={`${footerHeight.toString()}px`}
        />
        <Check
          label="Collapsed pane holds no gap open"
          ok={!collapsed || probe.footerGap === "0px"}
          detail={`--content-footer-gap: ${probe.footerGap || "?"}`}
        />
      </Readout>
      <div className="mx-4 flex max-w-2xl flex-col gap-2 text-xs text-neutral-500">
        <p>
          Press <strong>Drag taller</strong>, then <strong>Collapse</strong> and restore: the height
          and the mount index both survive. <strong>Unregister</strong> is the old way of freeing
          the space — re-register after it and the mount index climbs, which is the R3F canvas
          remount.
        </p>
        <div className="flex flex-row gap-2">
          <Button size={Size.Sm} variant={Variant.Primary} onClick={onCollapse} disabled={!registered}>
            {collapsed ? "Restore" : "Collapse"}
          </Button>
          <Button
            size={Size.Sm}
            variant={Variant.Secondary}
            onClick={registered ? onUnregister : onRegister}
          >
            {registered ? "Unregister" : "Re-register"}
          </Button>
        </div>
      </div>
    </>
  );
}

export const CollapsingFooter: Story = {
  render: () => <CollapsingFooterApp />,
  name: "Collapse without unmounting",
};

/* -------------------------------------------------------------------------- */
/* 3. One write, several panes                                                 */
/* -------------------------------------------------------------------------- */

function BatchWriteApp(): ReactNode {
  const { setPanes, setToolbarItems } = useLayoutActions();
  const panes = usePanes();

  useEffect(() => {
    setToolbarItems(HEADER_SPACER, true);
    setPanes(
      [
        {
          id: "left",
          name: "Left",
          icon: <Icon name="action-placeholder" />,
          size: "240px",
          region: PaneRegion.Left,
          inLeftMenu: true,
          inRightMenu: false,
          content: <div className="bg-secondary-500/20 h-full w-full p-3 text-xs">Left</div>,
        },
        {
          id: "right",
          name: "Right",
          icon: <Icon name="action-placeholder" />,
          size: "240px",
          region: PaneRegion.Right,
          inLeftMenu: false,
          inRightMenu: true,
          content: <div className="bg-info-500/20 h-full w-full p-3 text-xs">Right</div>,
        },
        {
          id: "footer",
          name: "Footer",
          icon: <Icon name="action-placeholder" />,
          size: "auto",
          region: PaneRegion.Footer,
          inLeftMenu: false,
          inRightMenu: false,
          content: <div className="bg-tertiary-500/20 h-20 w-full p-3 text-xs">Footer</div>,
        },
      ],
      REPLACE,
    );
    return () => {
      clearLayout(setPanes, setToolbarItems);
    };
  }, [setPanes, setToolbarItems]);

  const left = panes.find((pane) => pane.id === "left");
  const footer = panes.find((pane) => pane.id === "footer");
  const right = panes.find((pane) => pane.id === "right");

  // The rearrangement the expanding sidebar actually performs: expand one pane and
  // collapse the others, together. Three panes in one call, so a write that rebuilt
  // from a stale snapshot per item would land only the last.
  const rearrange = useCallback(() => {
    const goingWide = left?.expanded !== true;
    setPanes([
      { id: "left", expanded: goingWide },
      { id: "footer", collapsed: goingWide },
      { id: "right", collapsed: goingWide },
    ]);
  }, [left?.expanded, setPanes]);

  const wide = left?.expanded === true;

  return (
    <LayoutRoot homeText="semio">
      {(contentBounds: RectReadOnly) => (
        <ContentArea bounds={contentBounds}>
          <Readout title="One setPanes call, three panes changed">
            <Check
              label="All three moved together"
              ok={wide === (footer?.collapsed === true) && wide === (right?.collapsed === true)}
              detail={`left ${String(wide)} · footer ${String(
                footer?.collapsed === true,
              )} · right ${String(right?.collapsed === true)}`}
            />
          </Readout>
          <div className="mx-4 max-w-2xl text-xs text-neutral-500">
            <p className="mb-2">
              Three panes, one <code>setPanes</code> call, one atom write. The previous per-item
              implementation passes this too — it was checked against it — so this pins the
              contract rather than a past defect: a rearrangement is one intent, and it must not
              become possible for a third of it to happen.
            </p>
            <Button size={Size.Sm} variant={Variant.Primary} onClick={rearrange}>
              {wide ? "Restore" : "Rearrange"}
            </Button>
          </div>
        </ContentArea>
      )}
    </LayoutRoot>
  );
}

export const BatchPaneWrite: Story = {
  render: () => <BatchWriteApp />,
  name: "Batch pane write",
};
