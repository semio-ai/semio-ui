/**
 * Menu contracts, keyboard behavior, geometry and paint in both themes. Capture and
 * verification use the fixed font and viewport in `harness.ts`.
 * Generated identifiers and positioning-library wrappers are not consumer contracts.
 */
import { type ReactNode, useCallback, useEffect, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { Result } from "@semio/utils";
import { beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../buttons/button";
import { MenuButton } from "../buttons/menu-button";
import { MenuButtonProvider } from "../context/menu-button-context";
import { UiStoreProvider } from "../context/ui-store-provider";
import type { ActionMenuSpec } from "../floating/action-menu";
import { ContextMenu } from "../floating/context-menu";
import { Dropdown } from "../floating/dropdown";
import { Modal } from "../floating/modal";
import { SelectTree } from "../floating/select-tree";
import { ToastManager } from "../floating/toast";
import { TooltipHost } from "../floating/tooltip-3d/tooltip-host";
import { TooltipProvider } from "../floating/tooltip-3d/tooltip-provider";
import { useCanvasContextMenu } from "../floating/tooltip-3d/use-canvas-context-menu";
import { useAddToast } from "../hooks/use-add-toast";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { LayoutRoot } from "../layouts/layout/root";
import { NestedCheckbox } from "../nested-elements/checkbox";
import type { TreeOption } from "../nested-elements/checkbox-tree";
import { NestedItem } from "../nested-elements/item";
import { NestedLabel } from "../nested-elements/label";
import { NestedMenu } from "../nested-elements/menu";
import { NestedRadio } from "../nested-elements/radio";
import { NestedSelect } from "../nested-elements/select";
import { NestedSeparator } from "../nested-elements/separator";
import { NestedStatic } from "../nested-elements/static";
import { PaneRegion, Theme } from "../types";
import {
  type Measurements,
  firstAnimation,
  focusName,
  frame,
  measure,
  parityHarness,
  required,
  role,
  settle,
  surface,
  take,
} from "./harness";
import baseline from "./menu-parity.baseline.json";

enum State {
  DropdownItems = "Dropdown all item kinds",
  Selection = "Selection and span trigger",
  Context = "ContextMenu at a point",
  ModalPortal = "Dropdown portal inside Modal",
  Tree = "SelectTree tri-state parents",
  Multi = "NestedSelect multi",
  Canvas = "Canvas context menu",
  Navigation = "Layout navigation menus",
  Mobile = "Mobile NestedMenu",
  Toast = "Toast press with menu open",
  Exits = "Dropdown Tab and submenu Escape",
  Modality = "Dropdown and ContextMenu modality",
  ActionMenu = "ActionMenu in a toast",
}

enum Choice {
  Alpha = "alpha",
  Beta = "beta",
  Gamma = "gamma",
}

const verify = parityHarness({
  baseline: baseline as Record<string, Measurements>,
  baselinePath: "src/parity/menu-parity.baseline.json",
  expectedCount: Object.values(State).length * 2,
});

const FOCUS = [
  "outlineStyle",
  "outlineWidth",
  "outlineColor",
  "outlineOffset",
  "cursor",
  "pointerEvents",
] as const;
const MOTION = ["transform", "translate", "rotate", "scale"] as const;
const CONTRACT = [
  "role",
  "type",
  "tabindex",
  "disabled",
  "aria-checked",
  "aria-pressed",
  "aria-disabled",
  "aria-orientation",
  "aria-haspopup",
  "aria-expanded",
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
  "aria-hidden",
  "data-state",
  "data-disabled",
  "data-orientation",
  "data-highlighted",
  "data-side",
  "data-align",
] as const;
const REFERENCES = new Set<string>(["aria-controls", "aria-describedby", "aria-labelledby"]);
const REASON = "Ask the owner for Editor access";
const RADIO_REASON = "Only an owner can choose Gamma";
const POINT = { x: 440, y: 280 };
const ok = Result.Ok;

function contract(result: Measurements, name: string, element: Element) {
  result[name] = {
    tag: element.tagName.toLowerCase(),
    text: element.textContent ?? "",
    ...Object.fromEntries(
      CONTRACT.map((attribute) => [
        attribute,
        element.hasAttribute(attribute)
          ? REFERENCES.has(attribute)
            ? "(present)"
            : element.getAttribute(attribute)!
          : "(none)",
      ]),
    ),
  };
}

function pin(result: Measurements, name: string, element: Element) {
  take(result, name, element, [...FOCUS, ...MOTION]);
  contract(result, `${name} contract`, element);
}

function hiddenState(element: Element) {
  return {
    ariaHidden: element.getAttribute("aria-hidden") ?? "(none)",
    inert: element.hasAttribute("inert"),
  };
}

function disclosurePanel(result: Measurements, name: string, trigger: Element) {
  const panel = document.getElementById(trigger.getAttribute("aria-controls") ?? "");
  if (panel) pin(result, name, panel);
  else result[name] = { present: false };
}

function relative(
  result: Measurements,
  name: string,
  popup: Element,
  point: { x: number; y: number },
) {
  const rect = popup.getBoundingClientRect();
  result[name] = {
    x: Math.round((rect.x - point.x) * 2) / 2,
    y: Math.round((rect.y - point.y) * 2) / 2,
  };
}

function description(result: Measurements, name: string, item: Element) {
  const sources = (item.getAttribute("aria-describedby") ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => required(document.getElementById(id)));
  // The permanent hidden reason is independent of the tooltip's temporary description.
  result[name] = {
    text: sources
      .filter((element) => element.hasAttribute("hidden"))
      .map((element) => element.textContent ?? "")
      .join(" "),
    hidden: sources.some((element) => element.hasAttribute("hidden")),
  };
}

const menus = () => Array.from(document.querySelectorAll<HTMLElement>('[role="menu"]'));
const openMenu = () => menus().length > 0;
const tooltipVisible = () => !!document.querySelector('.tooltip-content[data-state$="open"]');

/** Roles locate items; Semio's caret viewBox excludes the item icons. */
function menuParts(result: Measurements, name: string, popup: Element, trigger: Element) {
  pin(result, `${name} trigger`, trigger);
  pin(result, `${name} popup`, popup);
  const arrow = popup.querySelector('svg[viewBox="0 0 30 10"]');
  if (arrow) {
    pin(result, `${name} arrow`, arrow);
    const fill = arrow.querySelector("path");
    if (fill) pin(result, `${name} arrow fill`, fill);
  } else result[`${name} arrow`] = { present: false };
  for (const label of [
    "Menu actions",
    "Static details",
    "Tree choices",
    "Preferences",
    "More actions",
  ]) {
    const element = page
      .getByText(label, { exact: true })
      .elements()
      .find((candidate) => popup.contains(candidate));
    if (element && !element.hasAttribute("role")) pin(result, `${name} label ${label}`, element);
  }
  for (const [index, item] of Array.from(
    popup.querySelectorAll(
      '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], [role="separator"], [role="checkbox"]',
    ),
  ).entries()) {
    const key = `${name} item ${String(index + 1)} ${item.textContent?.trim() ?? ""}`;
    pin(result, key, item);
    for (const [partIndex, part] of Array.from(
      item.querySelectorAll(".check-indicator, .list-item-icon, .list-item-extra"),
    ).entries())
      pin(result, `${key} decoration ${String(partIndex + 1)}`, part);
  }
}

async function press(key: string) {
  await userEvent.keyboard(key);
  await settle();
  return focusName();
}

/** Clear surviving layers between independent openings, re-checking after each Escape. */
async function closeMenus() {
  for (let attempt = 0; attempt < 3 && openMenu(); attempt++) await press("{Escape}");
}

function lockState(element: Element) {
  const style = getComputedStyle(element);
  return {
    overflow: style.overflow,
    overflowY: style.overflowY,
    paddingRight: style.paddingRight,
    pointerEvents: style.pointerEvents,
    dataScrollLocked: element.getAttribute("data-scroll-locked") ?? "(none)",
    style: element.getAttribute("style") ?? "(none)",
  };
}

/** Selection targets are independent of the primitive's disabled-item traversal. */
async function focusEntry(element: Element) {
  (element as HTMLElement).focus();
  await settle();
  return focusName();
}

/** Start the animation observer before dispatch, and finish only after it samples. */
async function opening(
  result: Measurements,
  name: string,
  action: () => Promise<unknown>,
  find: () => Element | null = () => menus()[0] ?? null,
) {
  const entrance = firstAnimation(find);
  await action();
  result[`${name} first animation`] = await entrance;
  return surface(required(find()), result, `${name} surface`);
}

async function keyboardOpen(result: Measurements, name: string, trigger: Element) {
  (trigger as HTMLElement).focus();
  return opening(result, name, () => userEvent.keyboard("{Enter}"));
}

function Anchor({ children }: { children: ReactNode }) {
  return <div style={{ position: "fixed", left: 400, top: 140, width: 240 }}>{children}</div>;
}

function AllItems({
  run = () => {},
  disabledRun = () => {},
  radioChange = () => {},
}: {
  run?: () => void;
  disabledRun?: () => void;
  radioChange?: (value: string) => void;
}) {
  const [checked, setChecked] = useState(true);
  const [value, setValue] = useState<string>(Choice.Alpha);
  return (
    <>
      <NestedLabel>Menu actions</NestedLabel>
      <NestedItem left="search" onClick={run}>
        Find
      </NestedItem>
      <NestedItem left="search" disabled description={REASON} onClick={disabledRun}>
        Edit
      </NestedItem>
      <NestedItem disabled>Unavailable</NestedItem>
      <NestedSeparator />
      <NestedRadio
        value={value}
        onChange={(next) => {
          setValue(next);
          radioChange(next);
        }}
        options={[
          { value: Choice.Alpha, label: "Alpha" },
          { value: Choice.Beta, label: "Beta" },
          { value: Choice.Gamma, label: "Gamma", disabled: true, disabledReason: RADIO_REASON },
        ]}
      />
      <NestedCheckbox label="Pinned" value={checked} onChange={setChecked} />
      <NestedStatic>Static details</NestedStatic>
      <NestedMenu label="More actions">
        <NestedItem>Submenu first</NestedItem>
        <NestedItem>Submenu last</NestedItem>
      </NestedMenu>
    </>
  );
}

function SpanMenu({ children }: { children: ReactNode }) {
  return (
    <MenuButtonProvider
      value={{
        expanded: true,
        desktop: true,
        expandedWidthClassName: "",
        expandedLabelClassName: "",
      }}
    >
      <Dropdown
        trigger={
          <span>
            <MenuButton icon="action-placeholder">Span actions</MenuButton>
          </span>
        }
      >
        {children}
      </Dropdown>
    </MenuButtonProvider>
  );
}

function ModalFixture() {
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <Anchor>
      <Button onClick={() => setOpen(true)}>Open modal</Button>
      <Modal open={open} onStateChange={setOpen} title="Menu modal">
        <div ref={setContainer} style={{ width: 360, minHeight: 260, padding: 24 }}>
          <Dropdown portalContainer={container} trigger={<Button>Modal actions</Button>}>
            <NestedItem>Modal first</NestedItem>
            <NestedItem>Modal last</NestedItem>
          </Dropdown>
        </div>
      </Modal>
    </Anchor>
  );
}

const TREE: TreeOption[] = [
  {
    value: "checked",
    label: "Checked parent",
    children: [
      { value: "a", label: "Leaf A" },
      { value: "b", label: "Leaf B" },
    ],
  },
  {
    value: "unchecked",
    label: "Unchecked parent",
    children: [
      { value: "c", label: "Leaf C" },
      { value: "d", label: "Leaf D" },
    ],
  },
  {
    value: "partial",
    label: "Partial parent",
    children: [
      { value: "e", label: "Leaf E" },
      { value: "f", label: "Leaf F" },
    ],
  },
];

function TreeFixture({ changed }: { changed: (values: string[]) => void }) {
  const [values, setValues] = useState(["a", "b", "e"]);
  return (
    <Anchor>
      <SelectTree
        label="Tree choices"
        options={TREE}
        value={values}
        onChange={(next) => {
          setValues(next);
          changed(next);
        }}
      />
    </Anchor>
  );
}

function MultiFixture({ changed }: { changed: (values: string[]) => void }) {
  const [values, setValues] = useState<string[]>([]);
  return (
    <Anchor>
      <Dropdown trigger={<Button>Multi choices</Button>}>
        <NestedSelect
          values={values}
          onChange={(next) => {
            setValues(next);
            changed(next);
          }}
          options={[
            { value: Choice.Alpha, label: "Alpha" },
            { value: Choice.Beta, label: "Beta" },
            { value: Choice.Gamma, label: "Gamma", disabled: true, disabledReason: RADIO_REASON },
          ]}
        />
      </Dropdown>
    </Anchor>
  );
}

function CanvasItems({ run }: { run: () => void }) {
  return (
    <>
      <NestedItem onClick={run}>Canvas first</NestedItem>
      <NestedItem>Canvas last</NestedItem>
    </>
  );
}

function CanvasAnchor({ run }: { run: () => void }) {
  const items = useCallback(() => <CanvasItems run={run} />, [run]);
  const { onContextMenu } = useCanvasContextMenu({
    id: "parity-canvas-menu",
    items,
  });
  return (
    <div
      style={{
        position: "absolute",
        left: 400,
        top: 240,
        width: 240,
        height: 120,
        pointerEvents: "auto",
      }}
      onContextMenu={(event) => {
        // The hook consumes only the native event and world intersection. No renderer
        // is needed to exercise its positioning, store lifecycle and coordination.
        onContextMenu({
          nativeEvent: event.nativeEvent,
          point: { x: 0, y: 0, z: 0 },
        } as unknown as ThreeEvent<PointerEvent>);
      }}
    >
      Canvas target
    </div>
  );
}

function CanvasFixture({ run }: { run: () => void }) {
  return (
    <TooltipProvider>
      <TooltipHost style={{ position: "fixed", inset: 0 }}>
        <CanvasAnchor run={run} />
        <Anchor>
          <Dropdown trigger={<Button style={{ pointerEvents: "auto" }}>Ordinary actions</Button>}>
            <NestedItem>Ordinary first</NestedItem>
          </Dropdown>
        </Anchor>
      </TooltipHost>
    </TooltipProvider>
  );
}

function NavigationSetup() {
  const { setActionItems, setPanes } = useLayoutActions();
  useEffect(() => {
    setActionItems(
      [
        {
          id: "preferences",
          label: "Preferences",
          left: "action-placeholder",
          children: [
            { id: "setting", type: "item", children: "A setting" },
            { id: "other-setting", type: "item", children: "Another setting" },
          ],
        },
      ],
      true,
    );
    setPanes(
      [
        {
          id: "scene",
          name: "Scene",
          icon: "home",
          region: PaneRegion.Left,
          size: "240px",
          content: <p>Scene tools</p>,
        },
      ],
      true,
    );
  }, [setActionItems, setPanes]);
  return null;
}

function AddToast() {
  const add = useAddToast();
  useEffect(() => add({ id: "menu-toast", title: "Menu notification", dismiss: 60000 }), [add]);
  return null;
}

function ModalityFixture() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <Anchor>
        <Dropdown trigger={<Button>Modality actions</Button>}>
          <NestedItem>Modality first</NestedItem>
          <NestedItem>Modality last</NestedItem>
        </Dropdown>
        <ContextMenu
          content={
            <>
              <NestedItem>Row first</NestedItem>
              <NestedItem>Row last</NestedItem>
            </>
          }
        >
          <div style={{ width: 240, height: 120, marginTop: 40 }}>Modality row</div>
        </ContextMenu>
      </Anchor>
      <div style={{ position: "fixed", left: 760, top: 140, width: 240 }}>
        <Button onClick={() => setClicks((count) => count + 1)}>Outside</Button>
        <output aria-label="Outside count">{clicks}</output>
        <div
          role="region"
          aria-label="Modality scroller"
          style={{ height: 120, overflowY: "auto" }}
        >
          <div style={{ height: 600 }}>Scrollable page content</div>
        </div>
      </div>
    </>
  );
}

const ACTION_MENU: ActionMenuSpec = {
  icon: "action-placeholder",
  label: "Notification actions",
  items: [
    {
      id: "inspect",
      label: "Inspect notification",
      icon: "home",
      description: "View notification details",
      onSelect: () => ok(undefined),
    },
    {
      id: "edit",
      label: "Edit notification",
      disabled: true,
      description: REASON,
      onSelect: () => ok(undefined),
    },
    { id: "copy", label: "Copy notification", onSelect: () => ok("Copied") },
  ],
};

function AddActionToast() {
  const add = useAddToast();
  useEffect(
    () =>
      add({
        id: "action-menu-toast",
        title: "Action notification",
        dismiss: 60000,
        actionMenu: ACTION_MENU,
      }),
    [add],
  );
  return null;
}

for (const theme of [Theme.Light, Theme.Dark]) {
  describe(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    test(
      State.DropdownItems,
      async () => {
        await render(
          <UiStoreProvider>
            <Anchor>
              <Dropdown trigger={<Button>All actions</Button>}>
                <AllItems />
              </Dropdown>
            </Anchor>
          </UiStoreProvider>,
        );
        const result: Measurements = {};
        const trigger = role("button", "All actions").element();
        const popup = await keyboardOpen(result, "root", trigger);
        menuParts(result, "root", popup, trigger);
        result.keyboard = { onOpen: focusName() };
        // Include every row in the bound; skipped rows and looping are capture data.
        const rowCount = popup.querySelectorAll(
          '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]',
        ).length;
        for (let step = 1; step <= rowCount; step++)
          result.keyboard[`down ${String(step)}`] = await press("{ArrowDown}");
        result.keyboard.downPastEnd = await press("{ArrowDown}");
        result.keyboard.home = await press("{Home}");
        result.keyboard.upFromFirst = await press("{ArrowUp}");
        result.keyboard.end = await press("{End}");
        result.keyboard.typeaheadB = await press("b");
        result.keyboard.radioFocus = await focusEntry(role("menuitemradio", "Beta").element());
        pin(result, "highlighted radio", role("menuitemradio", "Beta").element());
        await press("{Home}");
        result.keyboard.itemFocus = await focusEntry(role("menuitem", "Find").element());
        pin(result, "highlighted item", role("menuitem", "Find").element());
        result.keyboard.disabledReason = await press("{ArrowDown}");
        result.keyboard.disabledReasonFocus = await focusEntry(role("menuitem", "Edit").element());
        await expect.poll(tooltipVisible).toBe(true);
        await settle();
        pin(result, "highlighted disabled reason", role("menuitem", "Edit").element());
        description(result, "disabled reason description", role("menuitem", "Edit").element());
        result.reason = { tooltipVisible: tooltipVisible() };
        await press("{End}");
        const subTrigger = role("menuitem", "More actions").element();
        result.keyboard.submenuFocus = await focusEntry(subTrigger);
        const findSub = () =>
          role("menuitem", "Submenu first").query()?.closest(".card-overlay") ?? null;
        await userEvent.keyboard("{ArrowRight}");
        await expect.element(role("menuitem", "Submenu first")).toBeVisible();
        // NestedMenu's card is inside the menu role and has no entrance animation.
        const submenu = await surface(required(findSub()), result, "submenu surface");
        menuParts(result, "submenu", submenu, subTrigger);
        // Base UI omits an open submenu trigger's aria-expanded only where it detects
        // VoiceOver (Apple platforms) and the submenu opened from the keyboard. Record the
        // expanded state the trigger has everywhere else, so the record does not depend on
        // the platform that captures it.
        result["submenu trigger contract"]["aria-expanded"] =
          subTrigger.getAttribute("aria-expanded") ?? "true";
        relative(
          result,
          "submenu relative to trigger",
          submenu,
          subTrigger.getBoundingClientRect(),
        );
        result.keyboard.submenuOpen = focusName();
        result.keyboard.submenuLeft = await press("{ArrowLeft}");
        result.submenu = { closedAfterLeft: !findSub() };
        result.keyboard.escape = await press("{Escape}");
        result.escape = { open: openMenu() };
        pin(result, "trigger after Escape", trigger);
        verify(theme, State.DropdownItems, result);
      },
      15_000,
    );

    test(
      State.Selection,
      async () => {
        let calls = 0;
        let disabledCalls = 0;
        let radioValue = "";
        await render(
          <UiStoreProvider>
            <Anchor>
              <Dropdown trigger={<Button>Selection actions</Button>}>
                <AllItems
                  run={() => calls++}
                  disabledRun={() => disabledCalls++}
                  radioChange={(value) => {
                    radioValue = value;
                  }}
                />
              </Dropdown>
              <SpanMenu>
                <NestedItem>Span item</NestedItem>
              </SpanMenu>
            </Anchor>
          </UiStoreProvider>,
        );
        const result: Measurements = {};
        const button = role("button", "Selection actions").element();
        const trigger = button;
        pin(result, "trigger closed", trigger);
        const popup = await keyboardOpen(result, "plain selection", button);
        menuParts(result, "plain selection", popup, trigger);
        result.keyboard = { onOpen: focusName() };
        result.keyboard.plainBefore = await focusEntry(role("menuitem", "Find").element());
        result.keyboard.plainEnter = await press("{Enter}");
        result.plain = { calls, open: openMenu() };
        // The action belongs to close teardown; allow that hook to finish before reopening.
        await expect.poll(() => calls).toBe(1);
        result.plain.calls = calls;
        pin(result, "trigger after selection", trigger);

        await keyboardOpen(result, "checkbox selection", button);
        const checkbox = role("menuitemcheckbox", "Pinned").element();
        result.keyboard.checkboxBefore = await focusEntry(checkbox);
        pin(result, "checkbox before Space", checkbox);
        result.keyboard.checkboxSpace = await press(" ");
        pin(result, "checkbox after Space", checkbox);
        result.checkbox = { open: openMenu() };
        result.radioTraversal = { home: await press("{Home}") };
        const radio = role("menuitemradio", "Beta").element();
        const rowCount = menus().reduce(
          (count, menu) =>
            count +
            menu.querySelectorAll(
              '[role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"]',
            ).length,
          0,
        );
        for (let step = 1; document.activeElement !== radio && step <= rowCount; step++)
          result.radioTraversal[`down ${String(step)}`] = await press("{ArrowDown}");
        result.radioTraversal.reached = document.activeElement === radio;
        result.keyboard.radioBefore = await focusEntry(radio);
        result.keyboard.radioEnter = await press("{Enter}");
        await expect.poll(() => radioValue).toBe(Choice.Beta);
        result.radio = { value: radioValue, open: openMenu() };

        await keyboardOpen(result, "disabled selection", button);
        result.keyboard.disabledDown = await press("{ArrowDown}");
        result.keyboard.disabledBefore = await focusEntry(role("menuitem", "Edit").element());
        await expect.poll(tooltipVisible).toBe(true);
        result.keyboard.disabledEnter = await press("{Enter}");
        result.disabled = {
          calls: disabledCalls,
          open: openMenu(),
          tooltipVisible: tooltipVisible(),
        };
        pin(result, "disabled after Enter", role("menuitem", "Edit").element());
        description(result, "disabled description", role("menuitem", "Edit").element());
        result.keyboard.disabledSpace = await press(" ");
        result.disabledSpace = {
          calls: disabledCalls,
          open: openMenu(),
          tooltipVisible: tooltipVisible(),
        };
        // Enter the actual ScrollArea from outside while the keyboard explanation is open.
        await page.getByText("Menu actions", { exact: true }).hover();
        await settle();
        result.reasonAfterPointerEntry = { visible: tooltipVisible() };
        await press("{Home}");
        await press("{Escape}");
        // Layout navigation composes the trigger onto the span around MenuButton.
        const spanButton = role("button", "Span actions").element();
        const span = required(spanButton.closest("[aria-haspopup]"));
        pin(result, "span closed", span);
        const spanPopup = await keyboardOpen(result, "span", spanButton);
        menuParts(result, "span", spanPopup, span);
        result.keyboard.spanOpen = focusName();
        result.keyboard.spanEscape = await press("{Escape}");
        pin(result, "span after Escape", span);
        result.spanEscape = { menuOpen: openMenu() };
        verify(theme, State.Selection, result);
      },
      15_000,
    );

    test(
      State.Context,
      async () => {
        await render(
          <Anchor>
            <ContextMenu
              content={
                <>
                  <NestedItem>Context first</NestedItem>
                  <NestedItem disabled description={REASON}>
                    Context explained
                  </NestedItem>
                  <NestedItem disabled>Context skipped</NestedItem>
                  <NestedItem>Context last</NestedItem>
                </>
              }
            >
              <div style={{ width: 240, height: 120 }}>Context target</div>
            </ContextMenu>
          </Anchor>,
        );
        const result: Measurements = {};
        const target = page.getByText("Context target", { exact: true });
        const trigger = target.element();
        const appRoot = required(trigger.closest("body > div"));
        const rect = trigger.getBoundingClientRect();
        const point = { x: rect.x + 40, y: rect.y + 40 };
        result.backgroundBefore = hiddenState(appRoot);
        const popup = await opening(result, "context", () =>
          target.click({ button: "right", position: { x: 40, y: 40 } }),
        );
        menuParts(result, "context", popup, trigger);
        relative(result, "context relative to click", popup, point);
        result.backgroundOpen = hiddenState(appRoot);
        result.keyboard = {
          onOpen: focusName(),
          down1: await press("{ArrowDown}"),
          down2: await press("{ArrowDown}"),
          down3: await press("{ArrowDown}"),
        };
        result.keyboard.escape = await press("{Escape}");
        result.escape = { open: openMenu() };
        result.backgroundClosed = hiddenState(appRoot);
        pin(result, "context trigger closed", trigger);
        verify(theme, State.Context, result);
      },
      15_000,
    );

    test(
      State.ModalPortal,
      async () => {
        await render(<ModalFixture />);
        await role("button", "Open modal").click();
        await expect.element(role("dialog", "Menu modal")).toBeVisible();
        await settle();
        const dialog = role("dialog", "Menu modal").element();
        const modalRoot = required(dialog.closest("body > div"));
        const result: Measurements = {};
        result.modalBefore = hiddenState(modalRoot);
        const trigger = role("button", "Modal actions").element();
        const popup = await keyboardOpen(result, "modal menu", trigger);
        menuParts(result, "modal menu", popup, trigger);
        const rect = popup.getBoundingClientRect();
        result.modalOpen = hiddenState(modalRoot);
        result.dialogOpen = hiddenState(dialog);
        result.paint = {
          popupContainsHit: popup.contains(
            document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2),
          ),
          insideDialog: dialog.contains(popup),
        };
        result.keyboard = {
          onOpen: focusName(),
          down: await press("{ArrowDown}"),
          escape: await press("{Escape}"),
        };
        result.escape = { menuOpen: openMenu(), modalOpen: !!role("dialog", "Menu modal").query() };
        result.modalClosedMenu = hiddenState(modalRoot);
        verify(theme, State.ModalPortal, result);
      },
      15_000,
    );

    test(
      State.Tree,
      async () => {
        let values = ["a", "b", "e"];
        await render(
          <TreeFixture
            changed={(next) => {
              values = next;
            }}
          />,
        );
        const result: Measurements = {};
        const trigger = required(
          page.getByText("3 of 6 selected", { exact: true }).element().closest("[aria-haspopup]"),
        );
        pin(result, "tree trigger closed", trigger);
        const popup = await opening(result, "tree", () => userEvent.click(trigger));
        menuParts(result, "tree", popup, trigger);
        result.keyboard = { onOpen: focusName() };
        const parent = role("menuitem", "Partial parent").element();
        const checkbox = required(parent.querySelector('[role="checkbox"]'));
        // The parent has a separate keyboard checkbox; Enter on its menuitem opens children.
        (checkbox as HTMLElement).focus();
        result.keyboard.parentFocus = focusName();
        result.keyboard.parentCheckboxFocused = document.activeElement === checkbox;
        result.keyboard.space = await press(" ");
        result.space = { values: values.join(","), open: openMenu() };
        pin(result, "parent after Space", parent);
        pin(result, "parent checkbox after Space", checkbox);
        result.keyboard.enter = await press("{Enter}");
        result.enter = { values: values.join(","), open: openMenu() };
        pin(result, "parent after Enter", parent);
        pin(result, "parent checkbox after Enter", checkbox);
        result.keyboard.escape = await press("{Escape}");
        result.escape = { open: openMenu() };
        verify(theme, State.Tree, result);
      },
      15_000,
    );

    test(
      State.Multi,
      async () => {
        let values: string[] = [];
        await render(
          <MultiFixture
            changed={(next) => {
              values = next;
            }}
          />,
        );
        const result: Measurements = {};
        const trigger = role("button", "Multi choices").element();
        const popup = await keyboardOpen(result, "multi", trigger);
        menuParts(result, "multi", popup, trigger);
        result.keyboard = { onOpen: focusName() };
        result.keyboard.alphaBefore = await focusEntry(role("menuitemcheckbox", "Alpha").element());
        result.keyboard.space = await press(" ");
        pin(result, "Alpha after Space", role("menuitemcheckbox", "Alpha").element());
        result.space = { values: values.join(","), open: openMenu() };
        result.keyboard.down = await press("{ArrowDown}");
        result.keyboard.betaBefore = await focusEntry(role("menuitemcheckbox", "Beta").element());
        result.keyboard.enter = await press("{Enter}");
        pin(result, "Beta after Enter", role("menuitemcheckbox", "Beta").element());
        result.enter = { values: values.join(","), open: openMenu() };
        result.keyboard.reason = await press("{ArrowDown}");
        result.keyboard.reasonBefore = await focusEntry(
          role("menuitemcheckbox", "Gamma").element(),
        );
        await expect.poll(tooltipVisible).toBe(true);
        description(result, "multi reason", role("menuitemcheckbox", "Gamma").element());
        pin(result, "Gamma highlighted", role("menuitemcheckbox", "Gamma").element());
        result.keyboard.disabledEnter = await press("{Enter}");
        result.disabled = {
          values: values.join(","),
          open: openMenu(),
          tooltipVisible: tooltipVisible(),
        };
        verify(theme, State.Multi, result);
      },
      15_000,
    );

    test(
      State.Canvas,
      async () => {
        let calls = 0;
        await render(<CanvasFixture run={() => calls++} />);
        const result: Measurements = {};
        const target = page.getByText("Canvas target", { exact: true });
        const ordinaryTrigger = role("button", "Ordinary actions").element();
        const show = () =>
          target.click({ button: "right", position: { x: 40, y: 40 }, force: true });
        const popup = await opening(result, "canvas", show);
        menuParts(result, "canvas", popup, target.element());
        relative(result, "canvas relative to point", popup, POINT);
        result.keyboard = { onOpen: focusName(), down: await press("{ArrowDown}") };
        result.keyboard.selectionBefore = await focusEntry(
          role("menuitem", "Canvas first").element(),
        );
        result.keyboard.enter = await press("{Enter}");
        await expect.poll(() => calls).toBe(1);
        result.selection = { calls, open: openMenu() };
        await opening(result, "canvas Escape", show);
        result.keyboard.escape = await press("{Escape}");
        result.escape = { open: openMenu() };

        await opening(result, "canvas before ordinary", show);
        await userEvent.click(ordinaryTrigger, { force: true });
        await settle();
        result.canvasToOrdinary = {
          canvasOpen: !!role("menuitem", "Canvas first").query(),
          ordinaryOpen: !!role("menuitem", "Ordinary first").query(),
        };
        // Establish the reverse case independently of what the outside press opened.
        await press("{Escape}");
        await keyboardOpen(result, "ordinary before canvas", ordinaryTrigger);
        await show();
        await settle();
        result.ordinaryToCanvas = {
          canvasOpen: !!role("menuitem", "Canvas first").query(),
          ordinaryOpen: !!role("menuitem", "Ordinary first").query(),
        };
        verify(theme, State.Canvas, result);
      },
      15_000,
    );

    test(
      State.Navigation,
      async () => {
        await render(
          <UiStoreProvider>
            <NavigationSetup />
            <LayoutRoot homeText="Workspace" />
          </UiStoreProvider>,
        );
        await expect.element(role("button", "Preferences")).toBeVisible();
        await settle();
        const result: Measurements = {};
        const nav = role("navigation", "Main navigation");
        const navElement = nav.element();
        const popup = await opening(result, "navigation context", () =>
          nav.click({ button: "right", position: { x: 10, y: 120 } }),
        );
        menuParts(result, "navigation context", popup, navElement);
        result.keyboard = {
          contextOpen: focusName(),
          contextDown: await press("{ArrowDown}"),
          contextEscape: await press("{Escape}"),
        };
        result.contextEscape = { menuOpen: openMenu() };
        const triggerButton = role("button", "Preferences");
        const button = triggerButton.element();
        const trigger = required(button.closest("[aria-haspopup]"));
        await opening(result, "navigation context before dropdown", () =>
          nav.click({ button: "right", position: { x: 10, y: 120 } }),
        );
        await userEvent.click(button, { force: true });
        await settle();
        result.navigationFirstClick = {
          contextOpen: !!role("menuitemradio", "Scene").query(),
          dropdownOpen: !!role("menuitem", "A setting").query(),
        };
        const coordinatedMenu = role("menuitem", "A setting").query()?.closest('[role="menu"]');
        if (coordinatedMenu)
          menuParts(result, "navigation coordinated dropdown", coordinatedMenu, trigger);
        result.keyboard.coordinatedEscape = await press("{Escape}");
        result.navigationFirstEscape = {
          contextOpen: !!role("menuitemradio", "Scene").query(),
          dropdownOpen: !!role("menuitem", "A setting").query(),
        };
        // Clear a remaining parent layer before measuring an independent dropdown opening.
        await press("{Escape}");
        const inner = await keyboardOpen(result, "navigation dropdown", button);
        menuParts(result, "navigation dropdown", inner, trigger);
        result.dropdownLayer = {
          contextOpen: !!role("menuitemradio", "Scene").query(),
          menus: menus().length,
        };
        result.keyboard.dropdownOpen = focusName();
        result.keyboard.dropdownDown = await press("{ArrowDown}");
        result.keyboard.dropdownEscape = await press("{Escape}");
        result.dropdownEscape = {
          dropdownOpen: !!role("menuitem", "A setting").query(),
          navigationPresent: navElement.isConnected,
          contextOpen: !!role("menuitemradio", "Scene").query(),
        };
        pin(result, "navigation span after Escape", trigger);
        verify(theme, State.Navigation, result);
      },
      15_000,
    );

    test(
      State.Mobile,
      async () => {
        await page.viewport(390, 800);
        await render(
          <UiStoreProvider>
            <div style={{ position: "fixed", left: 40, top: 140, width: 240 }}>
              <Dropdown trigger={<Button>Mobile actions</Button>}>
                <NestedItem>Mobile first</NestedItem>
                <NestedMenu label="Mobile more">
                  <NestedItem>Mobile child first</NestedItem>
                  <NestedItem>Mobile child last</NestedItem>
                </NestedMenu>
              </Dropdown>
            </div>
          </UiStoreProvider>,
        );
        const result: Measurements = {};
        const trigger = role("button", "Mobile actions").element();
        let popup = await keyboardOpen(result, "mobile", trigger);
        menuParts(result, "mobile collapsed", popup, trigger);
        let toggle = role("menuitem", "Mobile more").element();
        pin(result, "collapsible trigger closed", toggle);
        disclosurePanel(result, "collapsible panel closed", toggle);
        result.keyboard = { onOpen: focusName(), tabToToggle: await press("{Tab}") };
        // A Tab that closes the menu is the recorded fact; reopen without recording so
        // the disclosure is measured in a live menu.
        if (!openMenu()) {
          (trigger as HTMLElement).focus();
          await userEvent.keyboard("{Enter}");
          await expect.poll(openMenu).toBe(true);
          await settle();
          popup = required(menus()[0]);
          toggle = role("menuitem", "Mobile more").element();
        }
        (toggle as HTMLElement).focus();
        result.keyboard.toggleFocus = focusName();
        result.keyboard.expandEnter = await press("{Enter}");
        pin(result, "collapsible trigger expanded", toggle);
        disclosurePanel(result, "collapsible panel expanded", toggle);
        menuParts(result, "mobile expanded", popup, trigger);
        result.keyboard.downExpanded = await press("{ArrowDown}");
        (toggle as HTMLElement).focus();
        result.keyboard.collapseSpace = await press(" ");
        pin(result, "collapsible trigger collapsed", toggle);
        disclosurePanel(result, "collapsible panel collapsed", toggle);
        pin(result, "popup collapsed", popup);
        result.collapse = { childPresent: !!role("menuitem", "Mobile child first").query() };
        result.keyboard.escape = await press("{Escape}");
        result.escape = { open: openMenu() };
        verify(theme, State.Mobile, result);
      },
      15_000,
    );

    test(
      State.Exits,
      async () => {
        await render(
          <UiStoreProvider>
            <Anchor>
              <Dropdown trigger={<Button>Exit actions</Button>}>
                <NestedItem>Exit first</NestedItem>
                <NestedMenu label="Exit more">
                  <NestedItem>Exit child first</NestedItem>
                  <NestedItem>Exit child last</NestedItem>
                </NestedMenu>
              </Dropdown>
              <Button>After actions</Button>
            </Anchor>
          </UiStoreProvider>,
        );
        const result: Measurements = {};
        const trigger = role("button", "Exit actions").element();
        await keyboardOpen(result, "before Tab", trigger);
        await focusEntry(role("menuitem", "Exit first").element());
        result.tab = {
          focus: await press("{Tab}"),
          menus: menus().length,
          triggerExpanded: trigger.getAttribute("aria-expanded") === "true",
        };

        await closeMenus();
        const root = await keyboardOpen(result, "before submenu Escape", trigger);
        result.submenuEntry = { triggerFocus: await press("{End}") };
        await press("{ArrowRight}");
        await expect.element(role("menuitem", "Exit child first")).toBeVisible();
        // Dispatch Escape from a child item to capture how the nested layers handle it.
        result.submenuEntry.focus = await focusEntry(
          role("menuitem", "Exit child first").element(),
        );
        const rootOpen = () => root.isConnected && root.getAttribute("data-state") === "open";
        result.submenuEscape = {
          focus: await press("{Escape}"),
          menus: menus().length,
          rootOpen: rootOpen(),
        };
        result.rootEscape = {
          focus: await press("{Escape}"),
          menus: menus().length,
          rootOpen: rootOpen(),
        };

        await closeMenus();
        await keyboardOpen(result, "before Shift Tab", trigger);
        await focusEntry(role("menuitem", "Exit first").element());
        result.shiftTab = {
          focus: await press("{Shift>}{Tab}{/Shift}"),
          menus: menus().length,
        };
        verify(theme, State.Exits, result);
      },
      15_000,
    );

    test(
      State.Modality,
      async () => {
        await render(<ModalityFixture />);
        const result: Measurements = {};
        // Keep the locator usable while modal hiding removes the button from the accessibility tree.
        const outside = page.getByRole("button", {
          name: "Outside",
          exact: true,
          includeHidden: true,
        });
        const outsideElement = outside.element();
        const appRoot = required(outsideElement.closest("body > *"));
        const counter = page.getByRole("status", { name: "Outside count", exact: true });
        const counterElement = counter.element();
        const scroller = role("region", "Modality scroller").element();
        const trigger = role("button", "Modality actions").element();
        const target = page.getByText("Modality row", { exact: true });

        async function recordModality(name: string, show: () => Promise<unknown>) {
          await show();
          await expect.poll(openMenu).toBe(true);
          await settle();
          result[`${name} outside`] = hiddenState(outsideElement);
          result[`${name} body child`] = hiddenState(appRoot);
          result[`${name} html lock`] = lockState(document.documentElement);
          result[`${name} body lock`] = lockState(document.body);
          result[`${name} scroller`] = measure(scroller, ["overflow", "overflowY"]);
          // Force bypasses actionability waits; the browser still hit-tests the real pointer press.
          await userEvent.click(outside, { force: true });
          await settle();
          result[`${name} outside press`] = {
            counter: counterElement.textContent ?? "",
            menuOpen: openMenu(),
            focus: focusName(),
          };
          await closeMenus();
          await show();
          await expect.poll(openMenu).toBe(true);
          await settle();
          result[`${name} Tab`] = { focus: await press("{Tab}"), menus: menus().length };
          await closeMenus();
        }

        await recordModality("dropdown", () => keyboardOpen(result, "modality dropdown", trigger));
        await recordModality("context", () =>
          opening(result, "modality context", () =>
            target.click({ button: "right", position: { x: 40, y: 40 } }),
          ),
        );
        verify(theme, State.Modality, result);
      },
      15_000,
    );

    test(
      State.ActionMenu,
      async () => {
        await render(
          <ToastManager>
            <AddActionToast />
          </ToastManager>,
        );
        const title = page.getByText("Action notification", { exact: true });
        await expect.element(title).toBeVisible();
        const toast = required(title.element().closest("li"));
        // Motion animates the toast in JavaScript; wait for its resting surface before measuring.
        await expect.poll(() => getComputedStyle(toast).transform).toBe("none");
        const result: Measurements = {};
        await surface(toast, result, "toast surface");
        contract(result, "toast contract", toast);
        const triggerLocator = role("button", "Notification actions");
        const trigger = triggerLocator.element();
        pin(result, "trigger closed", trigger);

        function recordOpen(name: string, popup: Element) {
          menuParts(result, name, popup, trigger);
          const listItem = popup.closest("li");
          const region = popup.closest('[role="region"]');
          result[`${name} mount`] = {
            inNotificationsRegion: !!popup.closest("[data-notifications-region]"),
            ancestorLiTag: listItem?.tagName.toLowerCase() ?? "(none)",
            ancestorLiRole: listItem?.getAttribute("role") ?? "(none)",
            regionRole: region?.getAttribute("role") ?? "(none)",
            regionLabel: region?.getAttribute("aria-label") ?? "(none)",
          };
          relative(result, `${name} relative to trigger`, popup, trigger.getBoundingClientRect());
        }

        const popup = await keyboardOpen(result, "keyboard open", trigger);
        recordOpen("keyboard open", popup);
        result.keyboard = { onOpen: focusName() };
        // Include a step past every item so wrapping and disabled traversal are captured.
        for (let step = 1; step <= ACTION_MENU.items.length + 1; step++)
          result.keyboard[`down ${String(step)}`] = await press("{ArrowDown}");
        const disabled = role("menuitem", "Edit notification").element();
        result.keyboard.disabledReason = await focusEntry(disabled);
        await expect.poll(tooltipVisible).toBe(true);
        await settle();
        pin(result, "disabled reason item", disabled);
        description(result, "disabled reason description", disabled);
        result.keyboard.selectionBefore = await focusEntry(
          role("menuitem", "Copy notification").element(),
        );
        result.selection = { focus: await press("{Enter}") };
        // Selection runs after the menu's focus teardown; let its feedback update render too.
        await frame();
        await settle();
        const feedback = toast.querySelector('[role="status"]');
        result.selection.menuClosed = !openMenu();
        result.selection.feedbackText = feedback?.textContent ?? "";
        result.selection.feedbackRole = feedback?.getAttribute("role") ?? "(none)";
        result.selection.toastRendered = toast.isConnected;
        await closeMenus();
        const pointerPopup = await opening(result, "pointer open", () =>
          userEvent.click(triggerLocator),
        );
        recordOpen("pointer open", pointerPopup);
        verify(theme, State.ActionMenu, result);
      },
      15_000,
    );

    test(
      State.Toast,
      async () => {
        await render(
          <ToastManager>
            <AddToast />
            <Anchor>
              <Dropdown trigger={<Button>Toast actions</Button>}>
                <NestedItem>Toast menu first</NestedItem>
                <NestedItem>Toast menu last</NestedItem>
              </Dropdown>
            </Anchor>
          </ToastManager>,
        );
        const result: Measurements = {};
        const title = page.getByText("Menu notification", { exact: true });
        await expect.element(title).toBeVisible();
        // Motion animates the toast in JavaScript; wait for its resting position before measuring.
        const toast = required(title.element().closest("li"));
        await expect.poll(() => getComputedStyle(toast).transform).toBe("none");
        await settle();
        const trigger = role("button", "Toast actions").element();
        const popup = await keyboardOpen(result, "toast menu", trigger);
        menuParts(result, "toast menu", popup, trigger);
        result.keyboard = { onOpen: focusName() };
        pin(result, "toast title", title.element());
        await title.click();
        await settle();
        result.toastPress = { menuOpen: openMenu(), focus: focusName() };
        result.keyboard.escape = await press("{Escape}");
        result.escape = { menuOpen: openMenu() };
        verify(theme, State.Toast, result);
      },
      15_000,
    );
  });
}
