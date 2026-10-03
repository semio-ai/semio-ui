import { useEffect, useState } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { PaneRegion, Size } from "../types";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { Icon } from "../icons/registry";
import { Combobox } from "../inputs/combobox";
import { Button } from "../buttons/button";
import { LayoutRoot } from "../layouts/layout/root";
// The claim is about PAINT ORDER, so the real compiled stylesheet is mandatory: without it
// `z-1` and `card-transparent`'s `backdrop-filter` do not exist, everything stacks in tree
// order, and the assertions could only agree with themselves.
import "../test-stylesheet";
import { Dropdown } from "./dropdown";
import { Modal } from "./modal";
import { TooltipHost } from "./tooltip-3d/tooltip-host";
import { useTooltipStore } from "./tooltip-3d/store";

/**
 * A portalled overlay must paint over the app chrome even when the host sets no `z-index`
 * on it.
 *
 * Overlays here portal to the end of `<body>` and carry no `z-index`, so they land at
 * `auto` in the root stacking context — which loses to **any** positive `z-index` that
 * reaches the same context. The app chrome does use positive values: a side pane's close
 * button is `z-1`. What keeps the overlay on top is that the button's `z-1` never reaches
 * the root context, because `card-transparent` puts a `backdrop-filter` on the pane
 * surface it sits in, and that establishes a stacking context which confines it.
 *
 * **That containment is the whole guarantee, and nothing about it is local.** Removing the
 * `backdrop-filter` from `.card-transparent` promotes that button above `Modal`, `Dialog`
 * and every popup in the package at once — measured, not assumed. There is no type error,
 * no failing behavioural test, and a screenshot of the common case still looks right,
 * because most chrome does not overlap most popups.
 *
 * Measured by hit test rather than by reading CSS: `elementsFromPoint` reports what
 * actually paints at a pixel, which is the question.
 *
 * Two things make a naive version of this test pass when the guarantee is broken, and both
 * are guarded below:
 *
 * - **A pane arrives through `AnimatePresence`, and motion's transient `transform` on the
 *   pane surface confines the `z-1` all by itself.** So a measurement taken while the pane
 *   is still animating reports the overlay winning for a reason that expires. Every
 *   measurement here waits for that transform to clear first.
 * - **`expect.poll` succeeds on the first sample that satisfies it**, which is exactly the
 *   transient window. So the paint claims assert across a run of frames instead.
 */

const DESKTOP = { width: 1280, height: 800 } as const;

const PANE_ICON = <Icon name="action-placeholder" />;

const CLOSE_BUTTON = '.grid-area-right button[aria-label="Close panel"]';

const OPTIONS = [
  { value: "alpha", label: "Alpha" },
  { value: "beta", label: "Beta" },
  { value: "gamma", label: "Gamma" },
];

/**
 * Registers one Right-region pane and exposes a toggle. Right specifically: it is the
 * region whose pane renders the `z-1` "Close panel" button everything here stacks against.
 *
 * A sibling of `LayoutRoot`, so the toggle stays clickable once a pane is open.
 */
function PaneHarness({ paneContent }: { paneContent?: React.ReactNode }) {
  const { setPanes, togglePaneRegion } = useLayoutActions();

  useEffect(() => {
    setPanes(
      [
        {
          id: "right-pane",
          name: "Right Pane",
          icon: PANE_ICON,
          size: "320px",
          inLeftMenu: false,
          inRightMenu: true,
          content: paneContent ?? <p>Right pane body</p>,
        },
      ],
      true,
    );
  }, [setPanes, paneContent]);

  return (
    <div className="fixed top-0 left-0 z-50 flex gap-2">
      <button type="button" onClick={() => togglePaneRegion(PaneRegion.Right, "right-pane")}>
        toggle right
      </button>
    </div>
  );
}

function closeButton(): HTMLElement | null {
  return document.querySelector<HTMLElement>(CLOSE_BUTTON);
}

/** The `.card-transparent` pane surface the close button is absolutely positioned in. */
function paneSurface(): HTMLElement {
  return closeButton()!.parentElement!;
}

function centreOf(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
}

/**
 * Where something sits in the paint order at a point: `0` is frontmost, `Infinity` means
 * it is not there at all.
 *
 * `elementsFromPoint` returns the whole stack under a pixel, topmost first — so asking
 * whether an element is *present* in it answers nothing (everything overlapping the point
 * is present, front and back alike). Comparing two indices is the actual question.
 *
 * It is hit-test order rather than pure paint order, because `pointer-events: none`
 * elements are omitted. Nothing measured here sets that, so the two coincide; an overlay
 * that did set it would need a different instrument.
 */
function depthAt(point: { x: number; y: number }, matches: (el: Element) => boolean): number {
  const stack = document.elementsFromPoint(point.x, point.y);
  const index = stack.findIndex(matches);
  return index === -1 ? Infinity : index;
}

/**
 * Makes `el` and its ancestors hit-testable for the duration of `probe`, then puts them
 * back.
 *
 * Needed because a non-interactive tooltip is `pointer-events: none` by design, and
 * `elementsFromPoint` omits such elements — so the hit test reports it as absent rather
 * than as behind or in front. `pointer-events` has no effect on **painting**, so
 * overriding it does not alter the order being measured; it only lets the instrument see
 * an order that is already there.
 */
function whileHitTestable<T>(el: HTMLElement, stopAt: HTMLElement, probe: () => T): T {
  const touched: { el: HTMLElement; prev: string }[] = [];
  for (let node: HTMLElement | null = el; node && node !== stopAt; node = node.parentElement) {
    touched.push({ el: node, prev: node.style.pointerEvents });
    node.style.pointerEvents = "auto";
  }
  try {
    return probe();
  } finally {
    for (const { el: node, prev } of touched) node.style.pointerEvents = prev;
  }
}

function bySelector(selector: string): (el: Element) => boolean {
  return (el) => el.matches(selector) || el.closest(selector) !== null;
}

/** The `<body>`-level wrapper a portalled overlay was rendered into. */
function portalRootOf(selector: string): HTMLElement {
  return document.querySelector(selector)!.closest<HTMLElement>("body > div")!;
}

/**
 * Holds a claim to a run of animation frames rather than one sample.
 *
 * `expect.poll` is the wrong instrument for these: it stops at the first sample that
 * satisfies, and the samples that satisfy for the wrong reason are the early ones.
 */
async function heldForFrames(frames: number, claim: () => boolean): Promise<boolean> {
  for (let i = 0; i < frames; i += 1) {
    if (!claim()) return false;
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
  }
  return true;
}

/**
 * Waits until an element's box stops moving, and returns it.
 *
 * `Tooltip3D` positions itself through floating-ui *after* mount: `floatingStyles` starts
 * at `left: 0; top: 0`, so a probe taken on the first frame lands at the viewport origin,
 * nowhere near what the tooltip is anchored to. Two identical consecutive frames, at a
 * position floating-ui has actually written, is the settled state.
 */
async function settledRect(el: () => HTMLElement): Promise<DOMRect> {
  let previous = el().getBoundingClientRect();
  for (let i = 0; i < 180; i += 1) {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    const next = el().getBoundingClientRect();
    const stopped = next.left === previous.left && next.top === previous.top;
    if (stopped && (next.left > 0 || next.top > 0)) return next;
    previous = next;
  }
  throw new Error("element never settled to a position");
}

/**
 * Opens the right pane and waits for its entry animation to finish.
 *
 * `transform: none` on the pane surface is the settled state: while motion is running,
 * that transform is itself a stacking context, and it would confine the close button's
 * `z-1` regardless of whether `.card-transparent` still does.
 */
async function openRightPaneAndSettle() {
  await userEvent.click(page.getByRole("button", { name: "toggle right" }));
  await expect.poll(closeButton).not.toBeNull();
  await expect.poll(() => getComputedStyle(paneSurface()).transform).toBe("none");
}

/**
 * A `Modal` covers the whole viewport, so the close button is definitionally underneath it
 * — no positioner geometry to arrange, and the overlap is the one a host actually hits.
 *
 * Run in both themes, though the two cannot fail differently as things stand:
 * `.card-transparent` applies its `backdrop-filter` unconditionally, and the dark variant
 * reaches only the background colour. The parameterisation is here because the surface
 * classes *do* resolve per theme, so a theme-conditional filter is a change that would
 * otherwise be invisible — and it is the kind of change nothing else would catch.
 */
for (const theme of ["light", "dark"] as const) {
  test(`a modal with no z-index paints over a side pane's z-1 close button (${theme})`, async () => {
    await page.viewport(DESKTOP.width, DESKTOP.height);
    document.documentElement.classList.toggle("dark", theme === "dark");

    const { rerender } = await render(
      <>
        <PaneHarness />
        <LayoutRoot />
      </>,
    );
    await openRightPaneAndSettle();

    // Control: with no overlay, the button is frontmost at the probe point. Without it, a
    // probe that had drifted off the button would report the modal winning against nothing.
    const probe = centreOf(closeButton()!);
    expect(depthAt(probe, bySelector(CLOSE_BUTTON))).toBe(0);

    // The mechanism, asserted as itself so a failure says why rather than only that the
    // modal lost. `backdrop-filter` specifically — not "some ancestor establishes a
    // stacking context", which motion's transient transform satisfies too.
    expect(Number(getComputedStyle(closeButton()!).zIndex)).toBeGreaterThan(0);
    expect(getComputedStyle(paneSurface()).backdropFilter).not.toBe("none");

    rerender(
      <>
        <PaneHarness />
        <LayoutRoot />
        <Modal open title="Over the pane" onStateChange={() => {}}>
          <p>body</p>
        </Modal>
      </>,
    );
    await expect.poll(() => document.querySelector("[role=dialog]")).not.toBeNull();

    // The modal's backdrop and viewport are `fixed inset-0` with no `z-index`, and must
    // still paint in front of the close button — on every frame, not just one.
    const modalPortal = portalRootOf("[role=dialog]");
    expect(
      await heldForFrames(12, () => {
        const overlay = depthAt(probe, (el) => modalPortal.contains(el));
        const button = depthAt(probe, bySelector(CLOSE_BUTTON));
        // Both must be present, or the comparison is vacuous: an absent button would
        // satisfy `overlay < button` while proving nothing.
        return overlay < button && Number.isFinite(button);
      }),
    ).toBe(true);
  });
}

/**
 * The popup surface rather than a full-viewport backdrop: a `Dropdown` triggered from
 * inside the pane opens over the pane's own surface.
 *
 * A weaker claim than the modal's, and worth being exact about: the pane surface is itself
 * at `z-index: auto`, so what this pins is that the popup is neither clipped by the pane
 * it opens from nor painted inside it — not that `auto` beats a positive value. The modal
 * tests are what carry that, because the close button is the only positive `z-index` in
 * play; and `apps/studio`'s suite carries the general form, by asserting nothing in the
 * app reaches the root stacking context with one.
 */
test("a dropdown with no z-index paints over the pane surface it opens from", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  document.documentElement.classList.remove("dark");

  await render(
    <>
      <PaneHarness
        paneContent={
          <div className="p-12">
            <Dropdown trigger={<Button size={Size.Md}>open menu</Button>}>
              <div data-testid="menu-body" className="h-40">
                menu body
              </div>
            </Dropdown>
          </div>
        }
      />
      <LayoutRoot />
    </>,
  );
  await openRightPaneAndSettle();

  await userEvent.click(page.getByRole("button", { name: "open menu" }));
  const body = () => document.querySelector<HTMLElement>('[data-testid="menu-body"]');
  await expect.poll(body).not.toBeNull();
  await expect.poll(() => getComputedStyle(body()!.closest("[role=menu]")!).transform).toBe("none");

  // Control: the pane surface is genuinely behind the probe point, so the popup is being
  // measured against something rather than against empty space.
  const probe = centreOf(body()!);
  const surface = paneSurface();
  expect(depthAt(probe, (el) => el === surface)).not.toBe(Infinity);

  expect(
    await heldForFrames(
      12,
      () => depthAt(probe, bySelector("[role=menu]")) < depthAt(probe, (el) => el === surface),
    ),
  ).toBe(true);
});

/**
 * The same, weaker, claim for `Combobox`, whose Positioner is the element that carried a
 * hardcoded `z-50`. With it gone the popup stacks exactly as `Dropdown` does. That the
 * `z-index` is actually absent is pinned separately below; this one would stay green with
 * the `z-50` restored, because a popup already in front does not care.
 */
test("a combobox popup with no z-index paints over the pane surface it opens from", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  document.documentElement.classList.remove("dark");

  await render(
    <>
      <PaneHarness
        paneContent={
          <div className="p-12">
            <Combobox options={OPTIONS} value="alpha" onChange={() => {}} />
          </div>
        }
      />
      <LayoutRoot />
    </>,
  );
  await openRightPaneAndSettle();

  await userEvent.click(page.getByRole("button", { name: "Toggle options" }));
  const popup = () => document.querySelector<HTMLElement>("[role=listbox]");
  await expect.poll(popup).not.toBeNull();
  await expect.poll(() => getComputedStyle(popup()!).transform).toBe("none");

  const probe = centreOf(popup()!);
  const surface = paneSurface();
  expect(depthAt(probe, (el) => el === surface)).not.toBe(Infinity);

  expect(
    await heldForFrames(
      12,
      () => depthAt(probe, bySelector("[role=listbox]")) < depthAt(probe, (el) => el === surface),
    ),
  ).toBe(true);
});

/**
 * The seam this API adds: an overlay handed a `portalContainer` renders inside it rather
 * than at the end of `<body>`.
 *
 * Asserted on DOM ancestry, not on paint — where the overlay stacks once it is in the
 * host's element is the host's business, which is the entire point of the prop.
 */
test("portalContainer moves an overlay's portal into the host's element", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);

  function Host() {
    const [container, setContainer] = useState<HTMLDivElement | null>(null);
    return (
      <>
        <div ref={setContainer} data-testid="host-container" />
        <Dropdown trigger={<Button size={Size.Md}>open menu</Button>} portalContainer={container}>
          <div data-testid="menu-body">menu body</div>
        </Dropdown>
      </>
    );
  }

  await render(<Host />);
  await userEvent.click(page.getByRole("button", { name: "open menu" }));

  const body = () => document.querySelector<HTMLElement>('[data-testid="menu-body"]');
  await expect.poll(body).not.toBeNull();

  const host = document.querySelector<HTMLElement>('[data-testid="host-container"]')!;
  expect(host.contains(body()!)).toBe(true);

  // Control: the same component with no `portalContainer` lands OUTSIDE that element, as
  // a `<body>`-level sibling. Without it this test says only that a container was used,
  // not that it changed anything — and `host.contains(document.body)` would have been
  // false whatever the prop did, since `host` is itself inside `<body>`.
  // Dismiss the first menu before opening the control's: Radix puts a `DismissableLayer`
  // over the page while a menu is open, and it swallows the click rather than passing it
  // through — the second click would time out on an element that is visible and enabled.
  await userEvent.keyboard("{Escape}");
  await expect.poll(body).toBeNull();

  await render(
    <Dropdown trigger={<Button size={Size.Md}>open default</Button>}>
      <div data-testid="default-menu-body">menu body</div>
    </Dropdown>,
  );
  await userEvent.click(page.getByRole("button", { name: "open default" }));
  const defaultBody = () =>
    document.querySelector<HTMLElement>('[data-testid="default-menu-body"]');
  await expect.poll(defaultBody).not.toBeNull();
  expect(host.contains(defaultBody()!)).toBe(false);
  expect(defaultBody()!.closest("body > div")?.parentElement).toBe(document.body);
});

/**
 * The Combobox popup's removal, pinned as itself.
 *
 * Not a stacking claim: the assertions above cover whether `auto` is sufficient, and both
 * the presence and the absence of a `z-50` satisfy those, because a popup already in front
 * does not care. What a test can pin is the contract — nothing in this popup's portal
 * subtree carries a `z-index` — so re-adding one reddens here and reads as the
 * consumer-visible change it is rather than landing as a tidy-up.
 *
 * `Tooltip3D`'s removal needs no equivalent: it is pinned by the ordering assertion in the
 * 3D test below, which goes red with the `z-50` restored because at 50 the tooltip beats
 * the modal.
 */
test("the Combobox popup's portal subtree carries no z-index", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);

  await render(
    <div className="p-8">
      <Combobox options={OPTIONS} value="alpha" onChange={() => {}} open />
    </div>,
  );
  const popup = () => document.querySelector<HTMLElement>("[role=listbox]");
  await expect.poll(popup).not.toBeNull();

  // Every element from the list up to the portal root, rather than "the Positioner" by
  // name: which element base-ui positions, and how many sit between it and `role=listbox`,
  // is base-ui's business and moves between versions. What this package owns is that it
  // puts a `z-index` on none of them — so a value re-added anywhere in the subtree reddens
  // here, including on the Popup, where it would be inert and easy to mistake for
  // equivalent.
  const portalRoot = popup()!.closest("body > div")!;
  const withZIndex: string[] = [];
  for (let node: Element | null = popup(); node && node !== portalRoot; node = node.parentElement) {
    if (getComputedStyle(node).zIndex !== "auto") {
      withZIndex.push(`${node.tagName.toLowerCase()}=${getComputedStyle(node).zIndex}`);
    }
  }
  expect(withZIndex).toEqual([]);

  // Control: the walk really did traverse the popup's subtree, so an empty result means
  // "nothing carries one" rather than "the loop never ran".
  expect(portalRoot.contains(popup()!)).toBe(true);
  expect(popup()!.parentElement).not.toBe(portalRoot);
});

/**
 * `Tooltip3D` is the one overlay here that does **not** portal to `<body>`: it renders into
 * the `TooltipHost` container, as that host's last child. So its stacking is a question
 * about the app's own subtree rather than about body order, and it gets its own
 * measurement.
 *
 * Arranged the way `apps/studio` arranges it — `TooltipHost` wrapping the whole app — so
 * the container the tooltip lands in is the one the app actually gives it.
 *
 * Two claims, and only the first is a guarantee the library owes:
 *
 * - **It paints over the app chrome underneath it**, which is what a tooltip is for.
 * - **It does not paint over a `<body>`-level overlay.** With a `z-index: 50` it did: a
 *   canvas tooltip covered an open `Modal`, because 50 beat the modal's `auto` from inside
 *   the app subtree. At `auto` it loses to anything portalled after the app, which is the
 *   ordering a modal should win. That is a behaviour change rather than a regression, and
 *   it is asserted here so it stays a deliberate one.
 */
test("a 3D tooltip paints over the app chrome, and under a body-level modal", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  document.documentElement.classList.remove("dark");

  const { rerender } = await render(
    <>
      <PaneHarness />
      <TooltipHost className="h-full w-full">
        <LayoutRoot />
      </TooltipHost>
    </>,
  );
  await openRightPaneAndSettle();

  const anchorPoint = centreOf(closeButton()!);

  const store = useTooltipStore.getState();
  store.registerAnchor({
    id: "probe-anchor",
    content: <span data-testid="tooltip-3d-body">tip</span>,
    positioning: { side: "bottom", offset: 0 },
    // `screenPosition` rather than `updateAnchorPosition`: the store reads this one
    // synchronously and in preference to the bounding-box positions, which are batched
    // through a rAF.
    screenPosition: { x: anchorPoint.x, y: anchorPoint.y, width: 32, height: 32 },
  });
  store.showTooltip("probe-anchor", "test");

  const tip = () => document.querySelector<HTMLElement>('[data-testid="tooltip-3d-body"]')!;
  await expect.poll(() => document.querySelector('[data-testid="tooltip-3d-body"]')).not.toBeNull();

  try {
    // It lands in the host container, not at the end of `<body>`.
    const host = document.querySelector<HTMLElement>(".h-full.w-full")!;
    expect(host.contains(tip())).toBe(true);

    // Probed at the tooltip's settled centre. Before floating-ui has positioned it that
    // centre is the viewport origin, which is over neither the pane nor anything else this
    // test means to compare against.
    const rect = await settledRect(tip);
    const tipProbe = {
      x: Math.round(rect.left + rect.width / 2),
      y: Math.round(rect.top + rect.height / 2),
    };

    // Control: the tooltip really is over the pane surface, so "in front" is a comparison
    // and not a statement about empty space.
    const surface = paneSurface();
    expect(whileHitTestable(tip(), host, () => depthAt(tipProbe, (el) => el === surface))).not.toBe(
      Infinity,
    );

    expect(
      await heldForFrames(
        12,
        () => whileHitTestable(tip(), host, () => depthAt(tipProbe, (el) => el === tip())) === 0,
      ),
    ).toBe(true);

    // Now under a `<body>`-level modal, whose backdrop covers the whole viewport.
    rerender(
      <>
        <PaneHarness />
        <TooltipHost className="h-full w-full">
          <LayoutRoot />
        </TooltipHost>
        <Modal open title="Over the tooltip" onStateChange={() => {}}>
          <p>body</p>
        </Modal>
      </>,
    );
    await expect.poll(() => document.querySelector("[role=dialog]")).not.toBeNull();

    const modalPortal = portalRootOf("[role=dialog]");
    expect(
      await heldForFrames(12, () =>
        whileHitTestable(tip(), host, () => {
          const modalDepth = depthAt(tipProbe, (el) => modalPortal.contains(el));
          const tipDepth = depthAt(tipProbe, (el) => el === tip());
          // Both must be present, or the comparison is vacuous.
          return modalDepth < tipDepth && Number.isFinite(tipDepth);
        }),
      ),
    ).toBe(true);
  } finally {
    // The store is module-scoped, so a leaked anchor would show up in whatever test runs
    // next rather than in this one.
    store.hideTooltip("probe-anchor", "test");
    store.unregisterAnchor("probe-anchor");
  }
});
