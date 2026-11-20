/**
 * State-driven paint and motion in both themes. Exit lifetimes, tab decoration,
 * turning chevrons and list rows extend the open-surface parity records.
 */
import { type ReactNode, useCallback, useEffect, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import { beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../buttons/button";
import { UiStoreProvider } from "../context/ui-store-provider";
import { ContextMenu } from "../floating/context-menu";
import { Dialog } from "../floating/dialog";
import { Dropdown } from "../floating/dropdown";
import { Modal } from "../floating/modal";
import { Popover } from "../floating/popover";
import { Select, type SelectOption } from "../floating/select";
import { SelectTree } from "../floating/select-tree";
import { SidebarModal } from "../floating/sidebar-modal";
import { ToastManager } from "../floating/toast";
import { Tooltip } from "../floating/tooltip";
import { useTooltipStore } from "../floating/tooltip-3d/store";
import { TooltipHost } from "../floating/tooltip-3d/tooltip-host";
import { TooltipProvider } from "../floating/tooltip-3d/tooltip-provider";
import { useCanvasContextMenu } from "../floating/tooltip-3d/use-canvas-context-menu";
import { useAddToast } from "../hooks/use-add-toast";
import { Autocomplete } from "../inputs/autocomplete";
import { Checkbox } from "../inputs/checkbox";
import { Combobox } from "../inputs/combobox";
import { Switch } from "../inputs/switch";
import { ToggleSquare } from "../inputs/toggle-square";
import { Accordion } from "../layouts/accordion";
import { Breadcrumbs } from "../layouts/breadcrumbs";
import { Collapse } from "../layouts/collapse";
import { Tabs as UiTabs } from "../layouts/tabs";
import { NestedItem } from "../nested-elements/item";
import { NestedMenu } from "../nested-elements/menu";
import { Theme } from "../types";
import {
  type Measurements,
  firstAnimation,
  frame,
  parityHarness,
  required,
  role,
  settle,
  surface,
  take,
} from "./harness";
import baseline from "./state-styling-parity.baseline.json";

enum State {
  MenuExits = "Menu and select exit animations",
  DialogExits = "Dialog, Modal and SidebarModal exit animations",
  FloatingExits = "Popover, Tooltip, Combobox and Autocomplete exit animations",
  ToastExit = "Toast exit",
  Tabs = "Tabs",
  Chevrons = "Chevrons that turn with their trigger",
  ListRows = "Combobox and Autocomplete rows",
  TriggerOutlines = "Trigger focus and hover outlines",
  OpenFills = "Open-state fills",
  PanelSizes = "Panel size variables at rest",
}

const verify = parityHarness({
  baseline: baseline as Record<string, Measurements>,
  baselinePath: "src/parity/state-styling-parity.baseline.json",
  expectedCount: Object.values(State).length * 2,
});

const MOTION = [
  "transform",
  "rotate",
  "translate",
  "opacity",
  "animationName",
  "animationDuration",
] as const;
const options: SelectOption[] = [
  { value: "alpha", label: "Alpha", icon: "search" },
  { value: "beta", label: "Beta", icon: "close" },
  { value: "gamma", label: "Gamma", disabled: true },
];

function Anchor({ children }: { children: ReactNode }) {
  return <div style={{ position: "fixed", left: 400, top: 160, width: 240 }}>{children}</div>;
}

async function press(key: string) {
  await userEvent.keyboard(key);
  await settle();
}

function visible(element: Element) {
  const rect = element.getBoundingClientRect();
  const style = getComputedStyle(element);
  return (
    element.isConnected &&
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  );
}

/** Escape is re-checked so a surviving parent menu cannot contaminate the next opening. */
async function closeRemaining(selector: string) {
  const remaining = () => Array.from(document.querySelectorAll(selector)).some(visible);
  for (let attempt = 0; attempt < 3 && remaining(); attempt++) await press("{Escape}");
  await expect.poll(remaining).toBe(false);
  await settle();
}

async function openSurface(result: Measurements, name: string, selector: string) {
  const element = await surface(selector, result, `${name} surface`);
  take(result, `${name} surface motion`, element, MOTION);
  return element;
}

/** CSS transitions and JS motion also have lifetimes, even when no CSS animation starts. */
function exitAnimation(element: Element) {
  return Promise.race([
    firstAnimation(() => element).then((facts) => {
      const animation = element
        .getAnimations()
        .find((candidate) => candidate instanceof CSSAnimation);
      // The shared observer samples sizing keyframes; exits also need opacity and transforms.
      return animation?.effect instanceof KeyframeEffect
        ? { ...facts, keyframes: JSON.stringify(animation.effect.getKeyframes()) }
        : facts;
    }),
    new Promise<Record<string, string>>((resolve) => {
      setTimeout(() => resolve({ animationName: "(none)" }), 1000);
    }),
  ]);
}

async function closing(
  result: Measurements,
  elements: Record<string, Element>,
  action: () => Promise<unknown> = () => userEvent.keyboard("{Escape}"),
  eventType = "keydown",
) {
  const entries = Object.entries(elements);
  // Hold the open elements themselves: a disappearing selector is not evidence of unmounting.
  const animations = entries.map(([, element]) => exitAnimation(element));
  const nextFrame = new Promise<void>((resolve) => {
    document.addEventListener(
      eventType,
      () => {
        void frame().then(() => {
          for (const [name, element] of entries)
            result[`${name} lifetime`] = { connectedAfterFrame: element.isConnected };
          resolve();
        });
      },
      { capture: true, once: true },
    );
  });
  await action();
  await nextFrame;
  await settle();
  for (const [name, element] of entries)
    result[`${name} lifetime`].connectedAfterSettle = element.isConnected;
  // A missing animation's timer must not delay either lifetime observation.
  const facts = await Promise.all(animations);
  entries.forEach(([name], index) => {
    result[`${name} closing animation`] = facts[index];
  });
}

async function exitFixture(
  result: Measurements,
  name: string,
  fixture: ReactNode,
  show: () => Promise<unknown>,
  selector: string,
) {
  const view = await render(fixture);
  await closeRemaining(selector);
  await show();
  const popup = await openSurface(result, name, selector);
  await closing(result, { [name]: popup });
  await closeRemaining(selector);
  view.unmount();
  await settle();
}

function SubmenuFixture({ mobile = false }: { mobile?: boolean }) {
  return (
    <UiStoreProvider>
      <div style={{ position: "fixed", left: mobile ? 40 : 400, top: 140, width: 240 }}>
        <Dropdown trigger={<Button>More actions</Button>}>
          <NestedItem>First action</NestedItem>
          <NestedMenu label="More choices">
            <NestedItem>Child first</NestedItem>
            <NestedItem>Child last</NestedItem>
          </NestedMenu>
        </Dropdown>
      </div>
    </UiStoreProvider>
  );
}

function DialogFixture({ kind }: { kind: "Dialog" | "Modal" | "SidebarModal" }) {
  const [open, setOpen] = useState(false);
  const props = { open, onStateChange: setOpen, title: "Confirm action" };
  return (
    <Anchor>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      {kind === "SidebarModal" ? (
        <SidebarModal
          {...props}
          tabs={[{ key: "details", title: "Details", content: <p>Body content for parity.</p> }]}
        />
      ) : kind === "Modal" ? (
        <Modal {...props}>
          <p>Body content for parity.</p>
        </Modal>
      ) : (
        <Dialog
          {...props}
          description="Review this action before continuing."
          onCancel={() => {}}
          onSubmit={() => {}}
        />
      )}
    </Anchor>
  );
}

function backdrops(popup: Element) {
  return Array.from(document.querySelectorAll('[class~="bg-black/40"]')).filter((element) => {
    if (element === popup || popup.contains(element)) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.position === "fixed" &&
      rect.x === 0 &&
      rect.y === 0 &&
      rect.width === innerWidth &&
      rect.height === innerHeight &&
      style.backgroundColor !== "rgba(0, 0, 0, 0)"
    );
  });
}

function ListFixture({ autocomplete = false }: { autocomplete?: boolean }) {
  const [value, setValue] = useState<string | null>("alpha");
  const [query, setQuery] = useState("");
  return (
    <Anchor>
      {autocomplete ? (
        <Autocomplete
          items={options}
          value={query}
          onChange={setQuery}
          onSelect={() => {}}
          label="Find item"
          getItemKey={(item) => item.value}
          getItemDisabled={(item) => !!item.disabled}
          renderItem={(item) => item.label}
        />
      ) : (
        <>
          <label htmlFor="state-parity-combobox">Choose item</label>
          <Combobox
            id="state-parity-combobox"
            value={value}
            onChange={setValue}
            options={options}
          />
        </>
      )}
    </Anchor>
  );
}

async function openList(autocomplete: boolean) {
  if (autocomplete) await role("combobox", "Find item").click();
  else await role("button", "Toggle options").click();
  await expect.element(role("option", "Alpha")).toBeVisible();
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
}

const CANVAS_ID = "state-styling-parity-canvas";

function CanvasContextTarget() {
  const items = useCallback(
    () => (
      <>
        <NestedItem>Canvas first</NestedItem>
        <NestedItem>Canvas last</NestedItem>
      </>
    ),
    [],
  );
  const { onContextMenu } = useCanvasContextMenu({ id: CANVAS_ID, items });
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

function CanvasClickTarget() {
  useEffect(() => {
    const store = useTooltipStore.getState();
    store.registerAnchor({
      id: CANVAS_ID,
      content: <p>Popover content</p>,
      interactive: true,
      mode: "click",
      positioning: {},
      screenPosition: { x: 120, y: 120 },
    });
    return () => store.unregisterAnchor(CANVAS_ID);
  }, []);
  return (
    <Button onClick={() => useTooltipStore.getState().showTooltip(CANVAS_ID, "click")}>
      Open canvas popover
    </Button>
  );
}

function CanvasFixture({ context = false }: { context?: boolean }) {
  return context ? (
    <TooltipProvider>
      <TooltipHost style={{ position: "fixed", inset: 0 }}>
        <CanvasContextTarget />
      </TooltipHost>
    </TooltipProvider>
  ) : (
    <Anchor>
      <TooltipProvider>
        <TooltipHost style={{ position: "relative", width: 240 }}>
          <CanvasClickTarget />
        </TooltipHost>
      </TooltipProvider>
    </Anchor>
  );
}

function AddToast() {
  const addToast = useAddToast();
  useEffect(
    () => addToast({ id: "state-styling-toast", title: "Parity notification", dismiss: 60000 }),
    [addToast],
  );
  return null;
}

function TabsFixture() {
  const [selected, setSelected] = useState("second");
  return (
    <div style={{ position: "fixed", left: 400, top: 160, width: 480 }}>
      <UiTabs selected={selected} onTabChange={setSelected}>
        {[
          { key: "first", title: "First tab", content: <p>First content</p> },
          { key: "second", title: "Second tab", content: <p>Second content</p> },
          { key: "third", title: "Third tab", content: <p>Third content</p> },
        ]}
      </UiTabs>
    </div>
  );
}

function tabParts(result: Measurements, name: string, tab: Element) {
  take(result, name, tab, MOTION);
  // Include every descendant so decoration remains recorded if paint moves between wrappers.
  tab
    .querySelectorAll("*")
    .forEach((part, index) => take(result, `${name} part ${String(index + 1)}`, part, MOTION));
}

function tabIndicator(result: Measurements, name: string) {
  const list = role("tablist", "").element();
  take(result, `${name} list`, list, MOTION);
  take(result, `${name} indicator`, required(list.querySelector(".variant-static-bg-25")), MOTION);
}

function DisclosureFixture() {
  const [open, setOpen] = useState(false);
  return (
    <Anchor>
      <Collapse title="Settings" open={open} onStateChange={setOpen}>
        <p>Settings content for parity.</p>
      </Collapse>
      <Accordion
        items={[{ key: "section", header: "Section", content: <p>Section content.</p> }]}
      />
    </Anchor>
  );
}

function listRow(result: Measurements, name: string, row: Element) {
  take(result, name, row, MOTION);
  const indicator = required(row.querySelector(".check-indicator"));
  take(result, `${name} check indicator`, indicator, MOTION);
  indicator
    .querySelectorAll("*")
    .forEach((part, index) =>
      take(result, `${name} indicator part ${String(index + 1)}`, part, MOTION),
    );
}

const OUTLINE = ["outlineWidth", "outlineStyle", "outlineColor", "outlineOffset"] as const;

async function outline(result: Measurements, name: string, control: Element) {
  // Outline transitions must finish before their width and colour are sampled.
  await settle();
  take(result, name, control, OUTLINE);
  result[`${name} interaction`] = {
    focused: document.activeElement === control,
    focusVisible: control.matches(":focus-visible"),
    hovered: control.matches(":hover"),
  };
}

async function triggerOutlines(
  result: Measurements,
  name: string,
  fixture: ReactNode,
  roleName: Parameters<typeof role>[0],
  label: string,
  kind: "menu" | "tooltip",
  click = false,
) {
  const view = await render(
    <Anchor>
      <Button>Before</Button>
      {fixture}
    </Anchor>,
  );
  const target = role(roleName, label);
  const control = target.element();
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
  await outline(result, `${name} rest`, control);
  await target.hover();
  await outline(result, `${name} hovered`, control);

  for (const hovered of [false, true]) {
    await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
    role("button", "Before").element().focus();
    await userEvent.keyboard("{Tab}");
    await expect.element(target).toHaveFocus();
    if (kind === "tooltip")
      await expect
        .poll(() => Array.from(document.querySelectorAll(".tooltip-content")).some(visible))
        .toBe(true);
    if (hovered) await target.hover();
    const pointer = hovered ? "pointer over" : "pointer away";
    await outline(result, `${name} keyboard focus ${pointer}`, control);

    if (kind === "menu") {
      await userEvent.keyboard("{Enter}");
      await expect.element(target).toHaveAttribute("aria-expanded", "true");
      await outline(result, `${name} open ${pointer}`, control);
      await userEvent.keyboard("{Escape}");
      await expect.element(target).toHaveAttribute("aria-expanded", "false");
    } else {
      await userEvent.keyboard("{Escape}");
      await expect
        .poll(() => Array.from(document.querySelectorAll(".tooltip-content")).some(visible))
        .toBe(false);
    }
    await expect.element(target).toHaveFocus();
    await outline(result, `${name} after Escape ${pointer}`, control);
  }

  if (click) {
    // Move focus first so the press records pointer focus rather than retained keyboard focus.
    await role("button", "Before").click();
    await target.click();
    await outline(result, `${name} after pointer click`, control);
  }
  view.unmount();
  await settle();
}

function PanelSizeFixture() {
  const [verticalOpen, setVerticalOpen] = useState(false);
  const [horizontalOpen, setHorizontalOpen] = useState(false);
  return (
    <Anchor>
      <Collapse title="Settings" open={verticalOpen} onStateChange={setVerticalOpen}>
        <p>Settings content for parity.</p>
      </Collapse>
      <div style={{ display: "flex" }}>
        <Collapse
          title="Panel"
          direction="horizontal"
          open={horizontalOpen}
          onStateChange={setHorizontalOpen}
        >
          <p style={{ width: 120 }}>Panel content.</p>
        </Collapse>
      </div>
      <Accordion
        items={[{ key: "section", header: "Section", content: <p>Section content.</p> }]}
      />
    </Anchor>
  );
}

for (const theme of [Theme.Light, Theme.Dark]) {
  describe(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    test(
      State.TriggerOutlines,
      async () => {
        const result: Measurements = {};
        await triggerOutlines(
          result,
          "Select",
          <Select label="Choice" value="alpha" onChange={() => {}} options={options} />,
          "button",
          "Choice: Alpha",
          "menu",
        );
        await triggerOutlines(
          result,
          "Dropdown Button",
          <Dropdown trigger={<Button>Open menu</Button>}>
            <NestedItem>First action</NestedItem>
          </Dropdown>,
          "button",
          "Open menu",
          "menu",
        );
        await triggerOutlines(
          result,
          "Tooltip Button",
          <Tooltip content="Helpful explanation">
            <Button>Tooltip target</Button>
          </Tooltip>,
          "button",
          "Tooltip target",
          "tooltip",
          true,
        );
        // ToggleSquare supplies its own Tooltip around the checked control.
        await triggerOutlines(
          result,
          "Tooltip ToggleSquare",
          <ToggleSquare label="Checked toggle" value onChange={() => {}} />,
          "checkbox",
          "Checked toggle",
          "tooltip",
        );
        // Checkbox and Switch need a DOM relay for Tooltip's ref and focus/pointer handlers.
        await triggerOutlines(
          result,
          "Tooltip Checkbox",
          <>
            <label htmlFor="state-parity-checkbox">Checked checkbox</label>
            <Tooltip content="Checkbox explanation">
              <span className="inline-flex">
                <Checkbox id="state-parity-checkbox" checked onCheckedChange={() => {}} />
              </span>
            </Tooltip>
          </>,
          "checkbox",
          "Checked checkbox",
          "tooltip",
        );
        await triggerOutlines(
          result,
          "Tooltip Switch",
          <Tooltip content="Switch explanation">
            <span className="inline-flex">
              <Switch label="Checked switch" checked onCheckedChange={() => {}} />
            </span>
          </Tooltip>,
          "switch",
          "Checked switch",
          "tooltip",
        );
        await triggerOutlines(
          result,
          "Breadcrumbs",
          <Breadcrumbs
            values={{ project: "alpha" }}
            elements={[
              {
                id: "project",
                type: "option",
                options: [
                  { value: "alpha", label: "Project Alpha", children: [] },
                  { value: "beta", label: "Project Beta", children: [] },
                ],
              },
            ]}
          />,
          "button",
          "Project Alpha",
          "menu",
        );
        verify(theme, State.TriggerOutlines, result);
      },
      30000,
    );

    test(
      State.OpenFills,
      async () => {
        const result: Measurements = {};
        const tree = await render(
          <Anchor>
            <SelectTree
              label="Tree choices"
              value={["a", "b", "e"]}
              onChange={() => {}}
              options={[
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
              ]}
            />
          </Anchor>,
        );
        role("button", "3 of 6 selected").element().focus();
        await userEvent.keyboard("{Enter}");
        await expect.element(role("menuitem", "Partial parent")).toBeVisible();
        const parent = role("menuitem", "Partial parent").element();
        parent.focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect.element(role("menuitemcheckbox", "Leaf E")).toHaveFocus();
        await settle();
        take(result, "NestedCheckboxTree parent open with submenu focus", parent);
        await closeRemaining('[role="menu"]');
        tree.unmount();
        await settle();

        const desktop = await render(<SubmenuFixture />);
        role("button", "More actions").element().focus();
        await userEvent.keyboard("{Enter}");
        await expect.element(role("menuitem", "More choices")).toBeVisible();
        const submenu = role("menuitem", "More choices").element();
        submenu.focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect.element(role("menuitem", "Child first")).toHaveFocus();
        await settle();
        take(result, "Desktop NestedMenu open with submenu focus", submenu);
        await closeRemaining('[role="menu"]');
        desktop.unmount();
        await settle();

        await page.viewport(390, 800);
        try {
          const mobile = await render(<SubmenuFixture mobile />);
          role("button", "More actions").element().focus();
          await userEvent.keyboard("{Enter}");
          await expect.element(role("menuitem", "More choices")).toBeVisible();
          const toggle = role("menuitem", "More choices").element();
          toggle.focus();
          await userEvent.keyboard("{Enter}");
          await expect
            .element(role("menuitem", "More choices"))
            .toHaveAttribute("aria-expanded", "true");
          await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
          await userEvent.keyboard("{ArrowDown}");
          await expect.element(role("menuitem", "Child first")).toHaveFocus();
          await settle();
          take(result, "Mobile NestedMenu expanded with another row highlighted", toggle);
          await closeRemaining('[role="menu"]');
          mobile.unmount();
          await settle();
        } finally {
          await page.viewport(1280, 800);
        }

        await render(
          <Anchor>
            <Button>Before</Button>
            <label htmlFor="state-parity-open-combobox">Choose item</label>
            <Combobox
              id="state-parity-open-combobox"
              value="alpha"
              onChange={() => {}}
              options={options}
              open
            />
          </Anchor>,
        );
        await expect.element(role("option", "Alpha")).toBeVisible();
        // The open popup hides the rest of the page from the accessibility tree, so the
        // other control is found in the DOM rather than by role.
        const before = required(
          Array.from(document.querySelectorAll("button")).find(
            (button) => button.textContent === "Before",
          ),
        );
        before.focus();
        expect(document.activeElement).toBe(before);
        await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
        await expect
          .element(role("combobox", "Choose item"))
          .toHaveAttribute("aria-expanded", "true");
        await outline(
          result,
          "Combobox open with focus elsewhere",
          role("combobox", "Choose item").element(),
        );
        verify(theme, State.OpenFills, result);
      },
      15000,
    );

    test(State.PanelSizes, async () => {
      await render(<PanelSizeFixture />);
      const result: Measurements = {};
      for (const [name, selector] of [
        ["Settings", ".CollapsibleVerticalContent"],
        ["Panel", ".CollapsibleHorizontalContent"],
        ["Section", '[role="region"]'],
      ]) {
        role("button", name).element().focus();
        await userEvent.keyboard("{Enter}");
        await expect.element(role("button", name)).toHaveAttribute("aria-expanded", "true");
        await expect.poll(() => document.querySelector(selector)).not.toBeNull();
        await settle();
        const panel = required(document.querySelector(selector));
        const style = getComputedStyle(panel);
        result[`${name} panel`] = Object.fromEntries(
          [
            "--collapsible-panel-height",
            "--collapsible-panel-width",
            "--accordion-panel-height",
            "--accordion-panel-width",
            "height",
            "width",
          ].map((property) => [property, style.getPropertyValue(property)]),
        );
      }
      verify(theme, State.PanelSizes, result);
    });

    test(
      State.MenuExits,
      async () => {
        const result: Measurements = {};
        await exitFixture(
          result,
          "Dropdown",
          <Anchor>
            <Dropdown trigger={<Button>Open menu</Button>}>
              <NestedItem>First action</NestedItem>
            </Dropdown>
          </Anchor>,
          () => role("button", "Open menu").click(),
          ".dropdown-content",
        );
        await exitFixture(
          result,
          "ContextMenu",
          <Anchor>
            <ContextMenu content={<NestedItem>First action</NestedItem>}>
              <div
                role="button"
                tabIndex={0}
                aria-label="Open context menu"
                style={{ width: 240, height: 80 }}
              >
                Right click here
              </div>
            </ContextMenu>
          </Anchor>,
          () =>
            role("button", "Open context menu").click({
              button: "right",
              position: { x: 60, y: 40 },
            }),
          ".dropdown-content",
        );

        const submenuView = await render(<SubmenuFixture />);
        await closeRemaining('[role="menu"]');
        role("button", "More actions").element().focus();
        await userEvent.keyboard("{Enter}");
        await openSurface(result, "NestedMenu root", ".dropdown-content");
        role("menuitem", "More choices").element().focus();
        await userEvent.keyboard("{ArrowRight}");
        await expect.element(role("menuitem", "Child first")).toBeVisible();
        const submenu = required(
          role("menuitem", "Child first").element().closest(".dropdown-content"),
        );
        await surface(submenu, result, "NestedMenu submenu surface");
        take(result, "NestedMenu submenu motion", submenu, MOTION);
        role("menuitem", "Child first").element().focus();
        await closing(result, { "NestedMenu submenu": submenu }, () =>
          userEvent.keyboard("{ArrowLeft}"),
        );
        await closeRemaining('[role="menu"]');
        submenuView.unmount();
        await settle();

        await exitFixture(
          result,
          "Select",
          <Anchor>
            <Select label="Choice" value="alpha" onChange={() => {}} options={options} />
          </Anchor>,
          () => role("button", "Choice: Alpha").click(),
          ".dropdown-content",
        );
        await exitFixture(
          result,
          "SelectTree",
          <Anchor>
            <SelectTree
              label="Tree choices"
              value={[]}
              onChange={() => {}}
              options={[
                {
                  value: "parent",
                  label: "Parent",
                  children: [
                    { value: "a", label: "Leaf A" },
                    { value: "b", label: "Leaf B" },
                  ],
                },
              ]}
            />
          </Anchor>,
          () => role("button", "Tree choices").click(),
          ".dropdown-content",
        );
        await exitFixture(
          result,
          "Canvas context menu",
          <CanvasFixture context />,
          () =>
            page
              .getByText("Canvas target", { exact: true })
              .click({ button: "right", position: { x: 40, y: 40 }, force: true }),
          ".dropdown-content",
        );
        verify(theme, State.MenuExits, result);
      },
      20000,
    );

    test(
      State.DialogExits,
      async () => {
        const result: Measurements = {};
        for (const kind of ["Dialog", "Modal", "SidebarModal"] as const) {
          const view = await render(<DialogFixture kind={kind} />);
          const selector = kind === "Dialog" ? '[role="alertdialog"]' : '[role="dialog"]';
          await closeRemaining(selector);
          role("button", "Open dialog").element().focus();
          await userEvent.keyboard("{Enter}");
          const popup = await openSurface(result, kind, selector);
          const elements: Record<string, Element> = { [kind]: popup };
          const layers = backdrops(popup);
          result[`${kind} backdrop count`] = { count: layers.length };
          for (const [index, layer] of layers.entries()) {
            const name = `${kind} backdrop ${String(index + 1)}`;
            await surface(layer, result, name);
            take(result, `${name} motion`, layer, MOTION);
            elements[name] = layer;
          }
          await closing(result, elements);
          await closeRemaining(selector);
          view.unmount();
          await settle();
        }
        verify(theme, State.DialogExits, result);
      },
      15000,
    );

    test(
      State.FloatingExits,
      async () => {
        const result: Measurements = {};
        await exitFixture(
          result,
          "Popover",
          <Anchor>
            <Popover trigger={<Button>Open popover</Button>}>
              <p>Popover content</p>
            </Popover>
          </Anchor>,
          () => role("button", "Open popover").click(),
          ".popover-content",
        );
        await exitFixture(
          result,
          "Tooltip",
          <Anchor>
            <Button>Before</Button>
            <Tooltip content="Helpful explanation">
              <Button>Tooltip target</Button>
            </Tooltip>
          </Anchor>,
          async () => {
            role("button", "Before").element().focus();
            await userEvent.keyboard("{Tab}");
            await expect.element(role("button", "Tooltip target")).toHaveFocus();
          },
          ".tooltip-content",
        );
        for (const autocomplete of [false, true])
          await exitFixture(
            result,
            autocomplete ? "Autocomplete" : "Combobox",
            <ListFixture autocomplete={autocomplete} />,
            () => openList(autocomplete),
            ".dropdown-content",
          );
        await exitFixture(
          result,
          "Canvas click popover",
          <CanvasFixture />,
          () => role("button", "Open canvas popover").click(),
          ".card-overlay",
        );
        verify(theme, State.FloatingExits, result);
      },
      20000,
    );

    test(State.ToastExit, async () => {
      await render(
        <ToastManager>
          <AddToast />
        </ToastManager>,
      );
      const title = page.getByText("Parity notification", { exact: true });
      await expect.element(title).toBeVisible();
      const toast = required(title.element().closest("li"));
      // Motion's entrance must reach rest before the close observer starts.
      await expect.poll(() => getComputedStyle(toast).transform).toBe("none");
      const result: Measurements = {};
      await surface(toast, result, "toast surface");
      take(result, "toast surface motion", toast, MOTION);
      const close = required(toast.querySelector<HTMLElement>('[aria-label="dismiss"]'));
      await closing(result, { toast }, () => userEvent.click(close), "click");
      verify(theme, State.ToastExit, result);
    });

    test(State.Tabs, async () => {
      await render(<TabsFixture />);
      await expect.element(role("tab", "Second tab")).toHaveAttribute("aria-selected", "true");
      await settle();
      const result: Measurements = {};
      const names = ["First tab", "Second tab", "Third tab"];
      for (const name of names) tabParts(result, `${name} rest`, role("tab", name).element());
      tabIndicator(result, "rest");
      await role("tab", "First tab").hover();
      await settle();
      tabParts(result, "First tab hovered", role("tab", "First tab").element());
      await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
      role("tab", "Second tab").element().focus();
      await userEvent.keyboard("{ArrowRight}{Enter}");
      await expect.element(role("tab", "Third tab")).toHaveAttribute("aria-selected", "true");
      await settle();
      for (const name of names)
        tabParts(result, `${name} after keyboard`, role("tab", name).element());
      tabIndicator(result, "after keyboard");
      await closeRemaining(".tooltip-content");
      verify(theme, State.Tabs, result);
    });

    test(
      State.Chevrons,
      async () => {
        const result: Measurements = {};
        const breadcrumbs = await render(
          <Anchor>
            <Breadcrumbs
              values={{ project: "alpha" }}
              elements={[
                {
                  id: "project",
                  type: "option",
                  options: [
                    { value: "alpha", label: "Project Alpha", children: [] },
                    { value: "beta", label: "Project Beta", children: [] },
                  ],
                },
              ]}
            />
          </Anchor>,
        );
        await settle();
        const crumb = role("button", "Project Alpha").element();
        take(result, "Breadcrumbs chevron closed", required(crumb.querySelector("svg")), MOTION);
        crumb.focus();
        await userEvent.keyboard("{Enter}");
        await openSurface(result, "Breadcrumbs", ".dropdown-content");
        take(result, "Breadcrumbs chevron open", required(crumb.querySelector("svg")), MOTION);
        await closeRemaining('[role="menu"]');
        breadcrumbs.unmount();
        await settle();

        const disclosure = await render(<DisclosureFixture />);
        await settle();
        for (const name of ["Settings", "Section"]) {
          const trigger = role("button", name).element();
          take(result, `${name} disclosure closed`, required(trigger.querySelector("svg")), MOTION);
          trigger.focus();
          await userEvent.keyboard("{Enter}");
          await expect.element(role("button", name)).toHaveAttribute("aria-expanded", "true");
          await settle();
          take(result, `${name} disclosure open`, required(trigger.querySelector("svg")), MOTION);
          await press("{Enter}");
          await expect.element(role("button", name)).toHaveAttribute("aria-expanded", "false");
        }
        disclosure.unmount();
        await settle();

        await page.viewport(390, 800);
        try {
          await render(<SubmenuFixture mobile />);
          role("button", "More actions").element().focus();
          await userEvent.keyboard("{Enter}");
          await openSurface(result, "Mobile NestedMenu", ".dropdown-content");
          const toggle = role("menuitem", "More choices").element();
          const chevron = required(toggle.querySelector(".list-item-extra svg"));
          take(result, "Mobile NestedMenu chevron closed", chevron, MOTION);
          toggle.focus();
          await userEvent.keyboard("{Enter}");
          await expect
            .element(role("menuitem", "More choices"))
            .toHaveAttribute("aria-expanded", "true");
          await settle();
          take(result, "Mobile NestedMenu chevron open", chevron, MOTION);
          await closeRemaining('[role="menu"]');
        } finally {
          await page.viewport(1280, 800);
        }
        verify(theme, State.Chevrons, result);
      },
      15000,
    );

    test(
      State.ListRows,
      async () => {
        const result: Measurements = {};
        for (const autocomplete of [false, true]) {
          const name = autocomplete ? "Autocomplete" : "Combobox";
          const view = await render(<ListFixture autocomplete={autocomplete} />);
          await closeRemaining(".dropdown-content");
          await openList(autocomplete);
          const popup = await openSurface(result, name, ".dropdown-content");
          const rows = Array.from(popup.querySelectorAll('[role="option"]'));
          rows.forEach((row, index) =>
            listRow(
              result,
              `${name} row ${String(index + 1)} ${row.textContent?.trim() ?? ""}`,
              row,
            ),
          );
          const input = role("combobox", autocomplete ? "Find item" : "Choose item").element();
          input.focus();
          const highlighted = () => input.getAttribute("aria-activedescendant");
          const before = highlighted();
          await userEvent.keyboard("{ArrowDown}");
          await expect.poll(() => highlighted() !== before && !!highlighted()).toBe(true);
          await settle();
          const active = required(document.getElementById(highlighted() ?? ""));
          result[`${name} highlight`] = { text: active.textContent?.trim() ?? "" };
          listRow(result, `${name} highlighted row`, active);
          await closeRemaining(".dropdown-content");
          view.unmount();
          await settle();
        }
        verify(theme, State.ListRows, result);
      },
      15000,
    );
  });
}
