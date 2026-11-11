/**
 * Tooltip, Popover and canvas click behavior in both themes. The shared harness
 * captures these observations for comparison with the next implementation.
 */
import { type ReactNode, useEffect, useState } from "react";
import { beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../buttons/button";
import { Modal } from "../floating/modal";
import { Popover } from "../floating/popover";
import { Tooltip } from "../floating/tooltip";
import { useTooltipStore } from "../floating/tooltip-3d/store";
import { TooltipHost } from "../floating/tooltip-3d/tooltip-host";
import { TooltipProvider } from "../floating/tooltip-3d/tooltip-provider";
import { Theme } from "../types";
import { type Measurements, focusName, parityHarness, required, role, settle } from "./harness";
import baseline from "./tooltip-popover-parity.baseline.json";

enum State {
  TooltipPointer = "Tooltip by pointer",
  TooltipKeyboard = "Tooltip by keyboard",
  TooltipAriaDisabled = "Tooltip on an aria-disabled trigger",
  PopoverPointer = "Popover by pointer",
  PopoverKeyboard = "Popover by keyboard",
  PopoverInModal = "Popover inside a Modal",
  CanvasClickPopover = "Canvas click popover",
  Placement = "Arrow and viewport-edge placement",
}

enum Side {
  Top = "top",
  Right = "right",
  Bottom = "bottom",
  Left = "left",
}

const verify = parityHarness({
  baseline: baseline as Record<string, Measurements>,
  baselinePath: "src/parity/tooltip-popover-parity.baseline.json",
  expectedCount: Object.values(State).length * 2,
});

const ATTRIBUTES = [
  "aria-describedby",
  "aria-expanded",
  "aria-haspopup",
  "aria-controls",
  "data-state",
] as const;
const REFERENCES = new Set<string>(["aria-describedby", "aria-controls"]);
const POINT = { x: 120, y: 120 };
const CANVAS_ID = "tooltip-popover-parity-canvas";

const tooltipSurface = () => document.querySelector('.tooltip-content[data-state$="open"]');
const popoverSurface = () => document.querySelector('.popover-content[data-state="open"]');
// The canvas content's role is an observation, so locating it uses its styled surface.
const canvasSurface = () => document.querySelector('.card-overlay[data-state="open"]');
type FindSurface = () => Element | null;

function visible(element: Element) {
  const rect = element.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

/** Generated IDs record presence and their targets, keeping captures repeatable. */
function triggerFacts(result: Measurements, name: string, trigger: Element) {
  result[name] = Object.fromEntries(
    ATTRIBUTES.map((attribute) => [
      attribute,
      trigger.hasAttribute(attribute)
        ? REFERENCES.has(attribute)
          ? "(present)"
          : trigger.getAttribute(attribute)!
        : "(none)",
    ]),
  );
  for (const attribute of REFERENCES) {
    const ids = (trigger.getAttribute(attribute) ?? "").split(/\s+/).filter(Boolean);
    result[`${name} ${attribute}`] = {
      present: trigger.hasAttribute(attribute),
      count: ids.length,
    };
    ids.forEach((id, index) => {
      const target = document.getElementById(id);
      result[`${name} ${attribute} reference ${String(index + 1)}`] = {
        resolves: !!target,
        role: target?.getAttribute("role") ?? "(none)",
        text: target?.textContent ?? "",
      };
    });
  }
}

function openFacts(result: Measurements, name: string, trigger: Element, popup: Element) {
  triggerFacts(result, `${name} trigger`, trigger);
  const tooltips = Array.from(document.querySelectorAll('[role="tooltip"]'));
  result[`${name} tooltip roles`] = { count: tooltips.length };
  tooltips.forEach((tooltip, index) => {
    result[`${name} tooltip role ${String(index + 1)}`] = {
      text: tooltip.textContent ?? "",
      visible: visible(tooltip),
    };
  });
  result[`${name} surface`] = {
    role: popup.getAttribute("role") ?? "(none)",
    ariaModal: popup.getAttribute("aria-modal") ?? "(none)",
    dataState: popup.getAttribute("data-state") ?? "(none)",
    dataSide: popup.getAttribute("data-side") ?? "(none)",
    dataAlign: popup.getAttribute("data-align") ?? "(none)",
    focus: focusName(),
  };
  let positioned: Element | null = popup;
  while (positioned && !["fixed", "absolute"].includes(getComputedStyle(positioned).position))
    positioned = positioned.parentElement;
  result[`${name} positioned element`] = positioned
    ? {
        present: true,
        position: getComputedStyle(positioned).position,
        zIndex: getComputedStyle(positioned).zIndex,
      }
    : { present: false };
}

function hiddenState(element: Element) {
  return {
    ariaHidden: element.getAttribute("aria-hidden") ?? "(none)",
    inert: element.hasAttribute("inert"),
  };
}

function relative(result: Measurements, popup: Element, host: Element) {
  const rect = popup.getBoundingClientRect();
  const container = host.getBoundingClientRect();
  const round = (value: number) => Math.round(value * 2) / 2;
  result["surface relative to canvas anchor"] = {
    left: round(rect.left - (container.left + POINT.x)),
    top: round(rect.top - (container.top + POINT.y)),
    width: round(rect.width),
    height: round(rect.height),
  };
}

async function press(key: string) {
  await userEvent.keyboard(key);
  await settle();
  return focusName();
}

const delay = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

async function waitForSurface(find: FindSurface) {
  await expect
    .poll(() => {
      const popup = find();
      return !!popup && visible(popup);
    })
    .toBe(true);
  await settle();
  return required(find());
}

/** Re-check after each Escape before starting an independent opening. */
async function closeSurface(find: FindSurface) {
  for (let attempt = 0; attempt < 3 && find(); attempt++) await press("{Escape}");
  await expect.poll(() => !!find()).toBe(false);
  await settle();
}

async function keyboardOpen(
  result: Measurements,
  name: string,
  trigger: Element,
  find: FindSurface,
) {
  (trigger as HTMLElement).focus();
  await userEvent.keyboard("{Enter}");
  const popup = await waitForSurface(find);
  openFacts(result, name, trigger, popup);
  return popup;
}

async function tabThrough(
  result: Measurements,
  popup: Element,
  find: FindSurface,
  modalOpen?: () => boolean,
) {
  for (let step = 1; step <= 4; step++) {
    const focus = await press("{Tab}");
    const inside = popup.contains(document.activeElement);
    result[`Tab ${String(step)}`] = {
      focus,
      open: !!find(),
      inside,
      ...(modalOpen ? { modalOpen: modalOpen() } : {}),
    };
    if (!inside) break;
  }
}

function Anchor({ children }: { children: ReactNode }) {
  return <div style={{ position: "fixed", left: 400, top: 200, width: 240 }}>{children}</div>;
}

function Controls({ children }: { children: ReactNode }) {
  const [clicks, setClicks] = useState(0);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: 16 }}>
      <Button>Before</Button>
      {children}
      {/* Keep the outside action below the popup so a real pointer press reaches it. */}
      <div style={{ marginTop: 220 }}>
        <Button onClick={() => setClicks((count) => count + 1)}>Outside</Button>
        <output aria-label="Outside clicks">{clicks}</output>
      </div>
    </div>
  );
}

function TooltipFixture({ ariaDisabled = false }: { ariaDisabled?: boolean }) {
  return (
    <Anchor>
      <Controls>
        <Tooltip content="Helpful explanation">
          {ariaDisabled ? (
            <span role="button" tabIndex={0} aria-disabled="true">
              Tooltip target
            </span>
          ) : (
            <Button>Tooltip target</Button>
          )}
        </Tooltip>
      </Controls>
    </Anchor>
  );
}

function PopoverContent() {
  return (
    <>
      <p>Popover content</p>
      <Button>First action</Button>
      <Button>Second action</Button>
    </>
  );
}

function PopoverControls() {
  return (
    <Controls>
      <Popover trigger={<Button>Open popover</Button>}>
        <PopoverContent />
      </Popover>
    </Controls>
  );
}

function ModalFixture() {
  const [open, setOpen] = useState(false);
  return (
    <Anchor>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onStateChange={setOpen} title="Popover modal">
        <PopoverControls />
      </Modal>
    </Anchor>
  );
}

function CanvasTrigger() {
  useEffect(() => {
    const store = useTooltipStore.getState();
    store.registerAnchor({
      id: CANVAS_ID,
      content: <PopoverContent />,
      interactive: true,
      mode: "click",
      positioning: {},
      screenPosition: POINT,
    });
    return () => store.unregisterAnchor(CANVAS_ID);
  }, []);
  return (
    <Button onClick={() => useTooltipStore.getState().showTooltip(CANVAS_ID, "click")}>
      Open canvas popover
    </Button>
  );
}

function CanvasFixture() {
  return (
    <Anchor>
      <TooltipProvider>
        <TooltipHost style={{ position: "relative", width: 240 }}>
          <Controls>
            <CanvasTrigger />
          </Controls>
        </TooltipHost>
      </TooltipProvider>
    </Anchor>
  );
}

/**
 * Where a popup and its arrow sit relative to the trigger: the arrow's centre against the
 * trigger's, and the popup's top-left corner against the trigger's, in CSS pixels. Each side
 * places the arrow differently, so every side is its own record.
 */
function placement(result: Measurements, name: string, trigger: Element, popup: Element) {
  // `|| 0` turns a negative zero into zero, which is what the JSON baseline stores.
  const round = (value: number) => Math.round(value * 2) / 2 || 0;
  const t = trigger.getBoundingClientRect();
  const a = required(popup.querySelector("svg")).getBoundingClientRect();
  const p = popup.getBoundingClientRect();
  result[name] = {
    side: popup.getAttribute("data-side") ?? "(none)",
    arrowX: round(a.x + a.width / 2 - (t.x + t.width / 2)),
    arrowY: round(a.y + a.height / 2 - (t.y + t.height / 2)),
    popupX: round(p.x - t.x),
    popupY: round(p.y - t.y),
    gapToViewportRight: round(window.innerWidth - p.right),
  };
}

enum Spot {
  Centre = "centre",
  BottomEdge = "bottom edge",
  RightEdge = "right edge",
}

/** Places its children in the viewport: centred, or against its bottom or right edge. */
function Placed({ spot, children }: { spot: Spot; children: ReactNode }) {
  const align = {
    [Spot.Centre]: { alignItems: "center", justifyContent: "center" },
    [Spot.BottomEdge]: { alignItems: "end", justifyContent: "center" },
    [Spot.RightEdge]: { alignItems: "center", justifyContent: "end" },
  }[spot];
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", gap: 8, ...align }}>{children}</div>
  );
}

/** Renders a fixture, opens its popup, records its placement, and unmounts it. */
async function placeOnce(
  result: Measurements,
  name: string,
  fixture: ReactNode,
  triggerName: string,
  find: FindSurface,
) {
  const { unmount } = await render(fixture);
  const trigger = role("button", triggerName).element();
  if (find === tooltipSurface) {
    role("button", "Before").element().focus();
    await userEvent.keyboard("{Tab}");
  } else {
    await userEvent.click(trigger);
  }
  const popup = await waitForSurface(find);
  // The entrance slides the popup, so it is measured where it comes to rest.
  await Promise.all(popup.getAnimations({ subtree: true }).map((animation) => animation.finished));
  placement(result, name, trigger, popup);
  unmount();
  await settle();
}

for (const theme of [Theme.Light, Theme.Dark]) {
  describe(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    test(
      State.TooltipPointer,
      async () => {
        await render(<TooltipFixture />);
        const result: Measurements = {};
        const trigger = role("button", "Tooltip target").element();
        await userEvent.hover(trigger);
        await delay(400);
        result["first hover at 400 ms"] = { open: !!tooltipSurface() };
        const popup = await waitForSurface(tooltipSurface);
        openFacts(result, "first hover", trigger, popup);

        await userEvent.hover(popup);
        await settle();
        result["pointer on surface"] = { open: !!tooltipSurface() };
        await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
        await delay(100);
        result["pointer away at 100 ms"] = { open: !!tooltipSurface() };

        // Straight back onto the trigger, inside the window in which a tooltip that has just
        // closed reopens without the hover delay.
        await userEvent.hover(trigger);
        await delay(150);
        result["second hover at 150 ms"] = { open: !!tooltipSurface() };
        if (tooltipSurface())
          openFacts(result, "second hover", trigger, required(tooltipSurface()));
        await userEvent.click(trigger);
        await settle();
        result["trigger press"] = { open: !!tooltipSurface(), focus: focusName() };
        verify(theme, State.TooltipPointer, result);
      },
      15_000,
    );

    test(
      State.TooltipKeyboard,
      async () => {
        await render(<TooltipFixture />);
        const result: Measurements = {};
        const trigger = role("button", "Tooltip target").element();
        role("button", "Before").element().focus();
        await userEvent.keyboard("{Tab}");
        await delay(150);
        result["first focus at 150 ms"] = { open: !!tooltipSurface() };
        openFacts(result, "first focus", trigger, await waitForSurface(tooltipSurface));

        result["first Escape"] = { focus: await press("{Escape}"), open: !!tooltipSurface() };
        triggerFacts(result, "after first Escape trigger", trigger);
        result["second Escape"] = { focus: await press("{Escape}"), open: !!tooltipSurface() };
        await press("{Tab}");
        await closeSurface(tooltipSurface);
        await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
        await delay(150);
        result["return focus at 150 ms"] = { open: !!tooltipSurface(), focus: focusName() };
        if (tooltipSurface())
          openFacts(result, "return focus", trigger, required(tooltipSurface()));

        await press("{Tab}");
        await closeSurface(tooltipSurface);
        // Past the instant-reopen window, so what follows records whether focus that arrives
        // by a pointer press opens the tooltip, not whether a recent close skips the delay.
        await delay(800);
        await userEvent.click(trigger);
        await delay(150);
        result["pointer focus at 150 ms"] = { open: !!tooltipSurface(), focus: focusName() };
        if (tooltipSurface())
          openFacts(result, "pointer focus", trigger, required(tooltipSurface()));
        verify(theme, State.TooltipKeyboard, result);
      },
      15_000,
    );

    test(
      State.TooltipAriaDisabled,
      async () => {
        await render(<TooltipFixture ariaDisabled />);
        const result: Measurements = {};
        const trigger = role("button", "Tooltip target").element();
        role("button", "Before").element().focus();
        await userEvent.keyboard("{Tab}");
        openFacts(result, "keyboard open", trigger, await waitForSurface(tooltipSurface));
        // Force allows the browser to deliver the press to the aria-disabled span.
        await userEvent.click(trigger, { force: true });
        await settle();
        result["disabled trigger press"] = { open: !!tooltipSurface(), focus: focusName() };
        verify(theme, State.TooltipAriaDisabled, result);
      },
      15_000,
    );

    test(
      State.PopoverPointer,
      async () => {
        await render(
          <Anchor>
            <PopoverControls />
          </Anchor>,
        );
        const result: Measurements = {};
        const trigger = role("button", "Open popover").element();
        const outside = role("button", "Outside").element();
        const counter = role("status", "Outside clicks").element();
        const bodyChild = required(outside.closest("body > div"));
        await userEvent.click(trigger);
        openFacts(result, "pointer open", trigger, await waitForSurface(popoverSurface));
        result["Outside while open"] = hiddenState(outside);
        result["Outside body ancestor while open"] = hiddenState(bodyChild);
        await userEvent.click(page.getByText("Popover content", { exact: true }));
        await settle();
        result["paragraph press"] = { open: !!popoverSurface() };
        await userEvent.click(outside, { force: true });
        await settle();
        result["outside press"] = {
          counter: counter.textContent ?? "",
          open: !!popoverSurface(),
          focus: focusName(),
        };

        await closeSurface(popoverSurface);
        await userEvent.click(trigger);
        openFacts(result, "reopened", trigger, await waitForSurface(popoverSurface));
        await userEvent.click(trigger);
        await settle();
        result["trigger toggle"] = { open: !!popoverSurface(), focus: focusName() };
        verify(theme, State.PopoverPointer, result);
      },
      15_000,
    );

    test(
      State.PopoverKeyboard,
      async () => {
        await render(
          <Anchor>
            <PopoverControls />
          </Anchor>,
        );
        const result: Measurements = {};
        const trigger = role("button", "Open popover").element();
        const popup = await keyboardOpen(result, "Enter open", trigger, popoverSurface);
        await tabThrough(result, popup, popoverSurface);

        await closeSurface(popoverSurface);
        await keyboardOpen(result, "Escape opening", trigger, popoverSurface);
        result.Escape = { focus: await press("{Escape}"), open: !!popoverSurface() };

        await closeSurface(popoverSurface);
        await keyboardOpen(result, "reverse Tab opening", trigger, popoverSurface);
        result["Shift+Tab"] = {
          focus: await press("{Shift>}{Tab}{/Shift}"),
          open: !!popoverSurface(),
        };
        verify(theme, State.PopoverKeyboard, result);
      },
      15_000,
    );

    test(
      State.PopoverInModal,
      async () => {
        await render(<ModalFixture />);
        const result: Measurements = {};
        // Read mounted open state even when another surface hides the dialog from AT.
        const modalOpen = () => !!document.querySelector('.card[role="dialog"]:not([data-closed])');
        async function openInModal(name: string) {
          await closeSurface(popoverSurface);
          if (!modalOpen()) {
            await userEvent.click(role("button", "Open modal"));
            await expect.element(role("dialog", "Popover modal")).toBeVisible();
            await settle();
          }
          return keyboardOpen(
            result,
            name,
            role("button", "Open popover").element(),
            popoverSurface,
          );
        }
        const popup = await openInModal("Enter open");
        result["modal after popover opens"] = { open: modalOpen() };
        await tabThrough(result, popup, popoverSurface, modalOpen);

        await openInModal("Escape opening");
        result["first Escape"] = {
          focus: await press("{Escape}"),
          popoverOpen: !!popoverSurface(),
          modalOpen: modalOpen(),
        };
        result["second Escape"] = {
          focus: await press("{Escape}"),
          popoverOpen: !!popoverSurface(),
          modalOpen: modalOpen(),
        };
        verify(theme, State.PopoverInModal, result);
      },
      15_000,
    );

    test(
      State.CanvasClickPopover,
      async () => {
        await render(<CanvasFixture />);
        const result: Measurements = {};
        const trigger = role("button", "Open canvas popover").element();
        const host = required(trigger.parentElement?.parentElement);
        const outside = role("button", "Outside").element();
        const counter = role("status", "Outside clicks").element();
        const popup = await keyboardOpen(result, "Enter open", trigger, canvasSurface);
        relative(result, popup, host);
        result["Outside while open"] = hiddenState(outside);
        await tabThrough(result, popup, canvasSurface);

        await closeSurface(canvasSurface);
        await keyboardOpen(result, "Escape opening", trigger, canvasSurface);
        result.Escape = { focus: await press("{Escape}"), open: !!canvasSurface() };

        await closeSurface(canvasSurface);
        await keyboardOpen(result, "outside press opening", trigger, canvasSurface);
        await userEvent.click(outside, { force: true });
        await settle();
        result["outside press"] = {
          counter: counter.textContent ?? "",
          open: !!canvasSurface(),
          focus: focusName(),
        };
        verify(theme, State.CanvasClickPopover, result);
      },
      15_000,
    );

    test(
      State.Placement,
      async () => {
        const result: Measurements = {};
        const tooltip = (spot: Spot, side: Side) => (
          <Placed spot={spot}>
            <Button>Before</Button>
            <Tooltip content="Helpful explanation" side={side}>
              <Button>Tooltip target</Button>
            </Tooltip>
          </Placed>
        );
        const popover = (spot: Spot) => (
          <Placed spot={spot}>
            <Popover trigger={<Button>Open popover</Button>}>
              <p>Popover content</p>
            </Popover>
          </Placed>
        );
        for (const side of Object.values(Side))
          await placeOnce(
            result,
            `tooltip ${side}`,
            tooltip(Spot.Centre, side),
            "Tooltip target",
            tooltipSurface,
          );
        // Against the right edge, a top tooltip is pushed back inside the viewport.
        await placeOnce(
          result,
          "tooltip top at the right edge",
          tooltip(Spot.RightEdge, Side.Top),
          "Tooltip target",
          tooltipSurface,
        );
        await placeOnce(result, "popover", popover(Spot.Centre), "Open popover", popoverSurface);
        // Against the bottom edge, a popover opens upward.
        await placeOnce(
          result,
          "popover at the bottom edge",
          popover(Spot.BottomEdge),
          "Open popover",
          popoverSurface,
        );
        await placeOnce(
          result,
          "popover at the right edge",
          popover(Spot.RightEdge),
          "Open popover",
          popoverSurface,
        );
        verify(theme, State.Placement, result);
      },
      20_000,
    );
  });
}
