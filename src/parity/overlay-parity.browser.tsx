/// <reference types="vite/client" />
/**
 * Overlay parity: renders each overlay state, reads its computed styles, geometry,
 * entrance animation and focus, and compares them with a committed baseline.
 *
 * **Opt-in.** Text geometry follows the platform's `system-ui` font, so the baseline
 * holds only on the platform it was captured on (macOS). The file therefore runs only
 * when asked:
 *
 * - `VITE_PARITY=1 npx vitest run --project browser src/parity/overlay-parity.browser.tsx`
 *   checks the current code against the baseline;
 * - `VITE_PARITY_CAPTURE=1 …` rewrites the baseline from the current code.
 *
 * Capture the baseline from the code being replaced, in its own commit, before changing
 * it; a difference the check then reports is either a defect or a change to name.
 */
import { type ReactNode, useState } from "react";
import { afterAll, afterEach, beforeEach, describe, expect, test } from "vitest";
import { commands, page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import "../test-stylesheet";
import { Button } from "../buttons/button";
import { Dialog } from "../floating/dialog";
import { Modal } from "../floating/modal";
import { Dropdown } from "../floating/dropdown";
import { ContextMenu } from "../floating/context-menu";
import { Select, type SelectOption } from "../floating/select";
import { Tooltip } from "../floating/tooltip";
import { Popover } from "../floating/popover";
import { Combobox } from "../inputs/combobox";
import { NestedLabel } from "../nested-elements/label";
import { NestedItem } from "../nested-elements/item";
import { NestedSeparator } from "../nested-elements/separator";
import { NestedRadio } from "../nested-elements/radio";
import { NestedCheckbox } from "../nested-elements/checkbox";
import { NestedMenu } from "../nested-elements/menu";
import { Theme, Variant } from "../types";
import baseline from "./overlay-parity.baseline.json";

enum State {
  DialogConfirmation = "Dialog confirmation",
  DialogBody = "Dialog body",
  DialogError = "Dialog error",
  DialogDismissDisabled = "Dialog dismissDisabled",
  ModalDefault = "Modal",
  DropdownOpen = "Dropdown",
  ContextMenuOpen = "ContextMenu",
  SelectBoth = "Select single both",
  SelectIcons = "Select single icons",
  SelectMulti = "Select multi chips",
  TooltipTop = "Tooltip top",
  TooltipRight = "Tooltip right",
  PopoverOpen = "Popover",
  ComboboxOpen = "Combobox",
  DialogInModal = "Dialog inside Modal",
  ModalInDialog = "Modal inside Dialog",
}

const capture = import.meta.env.VITE_PARITY_CAPTURE === "1";
const enabled = capture || import.meta.env.VITE_PARITY === "1";
const captured: Record<string, Measurements> = {};
type Measurements = Record<string, Record<string, string | number | boolean>>;
const properties = [
  "color",
  "backgroundColor",
  "borderTopLeftRadius",
  "boxShadow",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "opacity",
  "borderTopWidth",
  "borderTopColor",
  "borderBottomWidth",
  "borderBottomColor",
  "fill",
  "stroke",
] as const;

const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

async function settle() {
  // Finishing can schedule React updates and further transitions. Drain those too,
  // then leave two complete layout frames before measuring viewport coordinates.
  for (let pass = 0; pass < 3; pass++) {
    document.getAnimations().forEach((animation) => animation.finish());
    await frame();
    await frame();
  }
  expect(
    document.getAnimations().filter((animation) => animation.playState === "running"),
  ).toHaveLength(0);
}

function required<T extends Element>(element: T | null | undefined): T {
  expect(element, "required parity element").toBeTruthy();
  return element!;
}

function measure(element: Element): Record<string, string | number> {
  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  const round = (value: number) => Math.round(value * 2) / 2;
  return {
    ...Object.fromEntries(properties.map((property) => [property, style[property]])),
    x: round(rect.x),
    y: round(rect.y),
    width: round(rect.width),
    height: round(rect.height),
  };
}

function take(result: Measurements, name: string, element: Element) {
  result[name] = measure(element);
}

async function surface(target: string | Element, result: Measurements, name = "surface") {
  const resolve = () => (typeof target === "string" ? document.querySelector(target) : target);
  await expect
    .poll(() => {
      const element = resolve();
      const rect = element?.getBoundingClientRect();
      return !!rect && rect.width > 0 && rect.height > 0 && rect.x >= 0 && rect.y >= 0;
    })
    .toBe(true);
  const element = required(resolve());
  // Read entrance metadata before finishing: fill/geometry are sampled at rest.
  const { animationName, animationDuration } = getComputedStyle(element);
  result[`${name} entrance`] = { animationName, animationDuration };
  await settle();
  take(result, name, element);
  return element;
}

function role(roleName: Parameters<typeof page.getByRole>[0], name: string) {
  return page.getByRole(roleName, { name, exact: true });
}

function focusName() {
  const element = required(document.activeElement);
  if (element === document.body) return "(body)";
  const labelledBy = element.getAttribute("aria-labelledby");
  return (
    element.getAttribute("aria-label") ??
    (labelledBy
      ? labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ")
      : null) ??
    element.textContent ??
    ""
  ).trim();
}

function backdrop(popup: Element) {
  const candidates = backdrops(popup);
  expect(candidates, "one full-viewport dimming backdrop").toHaveLength(1);
  return candidates[0];
}

/** Every full-viewport dimming layer outside `popup`, in document order. */
function backdrops(popup: Element) {
  return Array.from(document.querySelectorAll("body *")).filter((element) => {
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

function arrow(popup: Element) {
  // Arrow's own viewBox distinguishes the caret from item glyphs without
  // depending on the positioning primitive's wrappers or attributes.
  return required(popup.querySelector('svg[viewBox="0 0 30 10"]'));
}

function verify(theme: Theme, state: State, measurements: Measurements) {
  const key = `${theme} / ${state}`;
  captured[key] = measurements;
  if (capture) return;
  const expected = (baseline as Record<string, Measurements>)[key];
  expect(expected, `${key}: baseline state exists`).toBeDefined();
  expect(Object.keys(measurements), `${key}: element set`).toEqual(Object.keys(expected));
  for (const [element, values] of Object.entries(measurements)) {
    expect(Object.keys(values), `${key} / ${element}: property set`).toEqual(
      Object.keys(expected[element]),
    );
    for (const [property, value] of Object.entries(values)) {
      expect(value, `${key} / ${element} / ${property}`).toEqual(expected[element][property]);
    }
  }
}

// Fixed inline geometry avoids adding Tailwind utilities to the source scan.
function Anchor({ children }: { children: ReactNode }) {
  return <div style={{ position: "fixed", left: 400, top: 240, width: 240 }}>{children}</div>;
}

function DialogFixture({ state }: { state: State }) {
  const [open, setOpen] = useState(false);
  const props = {
    open,
    onStateChange: setOpen,
    title: "Confirm action",
    description: "Review this action before continuing.",
    onCancel: () => {},
    onSubmit: () => {},
  };
  return (
    <Anchor>
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      {state === State.ModalDefault ? (
        <Modal {...props}>
          <p>Body content for parity.</p>
        </Modal>
      ) : (
        <Dialog
          {...props}
          variant={state === State.DialogError ? Variant.Error : undefined}
          dismissDisabled={state === State.DialogDismissDisabled}
        >
          {state === State.DialogBody ? <p>Body content for parity.</p> : undefined}
        </Dialog>
      )}
    </Anchor>
  );
}

function MenuContent() {
  return (
    <>
      <NestedLabel>Actions</NestedLabel>
      <NestedItem left="search">Find item</NestedItem>
      <NestedItem>Rename item</NestedItem>
      <NestedItem disabled>Unavailable item</NestedItem>
      <NestedSeparator />
      <NestedRadio
        value="alpha"
        options={[
          { value: "alpha", label: "Radio Alpha" },
          { value: "beta", label: "Radio Beta" },
        ]}
      />
      <NestedCheckbox label="Checked option" value />
      <NestedMenu label="More actions">
        <NestedItem>Submenu action</NestedItem>
      </NestedMenu>
    </>
  );
}

const options: SelectOption[] = [
  { value: "alpha", label: "Alpha", icon: "search" },
  { value: "beta", label: "Beta", icon: "close" },
  { value: "gamma", label: "Gamma", disabled: true },
];

async function menuMeasurements(result: Measurements, popup: Element) {
  take(result, "label", page.getByText("Actions", { exact: true }).element());
  take(result, "separator", required(popup.querySelector('[role="separator"]')));
  for (const [itemRole, name] of [
    ["menuitem", "Find item"],
    ["menuitem", "Rename item"],
    ["menuitem", "Unavailable item"],
    ["menuitemradio", "Radio Alpha"],
    ["menuitemradio", "Radio Beta"],
    ["menuitemcheckbox", "Checked option"],
    ["menuitem", "More actions"],
  ] as const) {
    const item = role(itemRole, name).element();
    take(result, `${name} rest`, item);
    const indicator = item.querySelector(".check-indicator");
    if (indicator) take(result, `${name} indicator`, indicator);
    const glyph = item.querySelector(".list-item-icon");
    if (glyph) take(result, `${name} icon`, glyph);
  }
  // Enter the menu through the keyboard only after recording its resting rows.
  popup instanceof HTMLElement && popup.focus();
  await userEvent.keyboard("{Home}");
  await expect.element(role("menuitem", "Find item")).toHaveFocus();
  await settle();
  take(result, "Find item highlighted", role("menuitem", "Find item").element());
  await userEvent.keyboard("{End}{ArrowRight}");
  await expect.element(role("menuitem", "Submenu action")).toBeVisible();
  const submenu = await surface(
    required(role("menuitem", "Submenu action").element().closest(".card-overlay")),
    result,
    "submenu surface",
  );
  take(result, "submenu trigger open", role("menuitem", "More actions").element());
  take(result, "submenu item", role("menuitem", "Submenu action").element());
  expect(submenu.contains(role("menuitem", "Submenu action").element())).toBe(true);
}

beforeEach(async () => {
  await page.viewport(1280, 800);
  await document.fonts.ready;
  // The pointer survives React cleanup; park it outside every fixed fixture.
  await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
});

afterEach(async () => {
  await cleanup();
  document.documentElement.classList.remove("dark");
});

afterAll(async () => {
  if (capture && Object.keys(captured).length > 0) {
    expect(Object.keys(captured)).toHaveLength(Object.values(State).length * 2);
    // Vitest 5 resolves built-in file commands from the project root.
    await commands.writeFile(
      "src/parity/overlay-parity.baseline.json",
      `${JSON.stringify(captured, null, 2)}\n`,
    );
  }
});

function ModalInDialogFixture() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <Anchor>
      <Button onClick={() => setDialogOpen(true)}>Open confirmation</Button>
      <Dialog
        open={dialogOpen}
        onStateChange={setDialogOpen}
        title="Confirm action"
        description="Review this action before continuing."
        onCancel={() => {}}
      >
        <Button onClick={() => setModalOpen(true)}>Edit details</Button>
        <Modal open={modalOpen} onStateChange={setModalOpen} title="Details">
          <p>Details body.</p>
        </Modal>
      </Dialog>
    </Anchor>
  );
}

function DialogInModalFixture() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  return (
    <Anchor>
      <Button onClick={() => setModalOpen(true)}>Open settings</Button>
      <Modal open={modalOpen} onStateChange={setModalOpen} title="Settings">
        <Button onClick={() => setDialogOpen(true)}>Delete item</Button>
        <Dialog
          open={dialogOpen}
          onStateChange={setDialogOpen}
          title="Confirm action"
          description="Review this action before continuing."
          onCancel={() => {}}
          onSubmit={() => {}}
        />
      </Modal>
    </Anchor>
  );
}

for (const theme of [Theme.Light, Theme.Dark]) {
  describe.runIf(enabled)(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    for (const state of [
      State.DialogConfirmation,
      State.DialogBody,
      State.DialogError,
      State.DialogDismissDisabled,
      State.ModalDefault,
    ]) {
      test(state, async () => {
        await render(<DialogFixture state={state} />);
        role("button", "Open dialog").element().focus();
        await userEvent.keyboard("{Enter}");
        const popupRole = state === State.ModalDefault ? "dialog" : "alertdialog";
        await expect.element(role(popupRole, "Confirm action")).toBeVisible();
        const result: Measurements = {};
        const popup = await surface(
          state === State.ModalDefault ? ".card" : ".animated-modal",
          result,
        );
        take(result, "backdrop", backdrop(popup));
        const title = role("heading", "Confirm action").element();
        const description = required(
          document.getElementById(popup.getAttribute("aria-describedby") ?? ""),
        );
        take(result, "title", title);
        take(result, "description", description);
        take(result, "header", required(description.parentElement));
        take(result, "close button", role("button", "Close").element());
        take(result, "Cancel button", role("button", "Cancel").element());
        take(result, "Submit button", role("button", "Submit").element());
        take(result, "footer", required(role("button", "Cancel").element().parentElement));
        if (state === State.DialogBody || state === State.ModalDefault) {
          take(
            result,
            "body",
            required(
              page.getByText("Body content for parity.", { exact: true }).element().parentElement,
            ),
          );
        }
        result.focus = { onOpen: focusName() };
        await role("button", "Cancel").click();
        await settle();
        // Where focus lands after closing is recorded, not asserted: it is part of what
        // the migration must keep, or change on purpose and say so.
        if (state !== State.DialogDismissDisabled) {
          await expect.element(role(popupRole, "Confirm action")).not.toBeInTheDocument();
        } else {
          await expect.element(role(popupRole, "Confirm action")).toBeVisible();
        }
        result.focus.afterCancel = focusName();
        result.focus.openAfterCancel = !!document.querySelector(`[role="${popupRole}"]`);
        verify(theme, state, result);
      });
    }

    for (const state of [State.DropdownOpen, State.ContextMenuOpen]) {
      test(state, async () => {
        await render(
          <Anchor>
            {state === State.DropdownOpen ? (
              <Dropdown trigger={<Button>Open menu</Button>}>
                <MenuContent />
              </Dropdown>
            ) : (
              <ContextMenu content={<MenuContent />}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Open context menu"
                  style={{ width: 240, height: 80 }}
                >
                  Right click here
                </div>
              </ContextMenu>
            )}
          </Anchor>,
        );
        const trigger = role(
          "button",
          state === State.DropdownOpen ? "Open menu" : "Open context menu",
        ).element();
        if (state === State.DropdownOpen) await role("button", "Open menu").click();
        else
          await role("button", "Open context menu").click({
            button: "right",
            position: { x: 60, y: 40 },
          });
        await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
        const result: Measurements = {};
        const popup = await surface(".dropdown-content", result);
        if (state === State.DropdownOpen) {
          take(result, "trigger open", trigger);
          take(result, "arrow", arrow(popup));
          take(result, "arrow fill", required(arrow(popup).firstElementChild));
        }
        await menuMeasurements(result, popup);
        verify(theme, state, result);
      });
    }

    for (const state of [State.SelectBoth, State.SelectIcons, State.SelectMulti]) {
      test(state, async () => {
        await render(
          <Anchor>
            <Select
              label="Choice"
              value={state === State.SelectMulti ? ["alpha", "beta"] : "alpha"}
              onChange={() => {}}
              options={options}
              showChips={state === State.SelectMulti}
              visuals={state === State.SelectIcons ? "icons" : "both"}
            />
          </Anchor>,
        );
        const trigger = role(
          "button",
          state === State.SelectMulti ? "Choice: 2 selected" : "Choice: Alpha",
        );
        await settle();
        const result: Measurements = {};
        take(result, "trigger closed", trigger.element());
        if (state === State.SelectMulti) {
          for (const label of ["Alpha", "Beta"]) {
            take(
              result,
              `${label} chip`,
              required(page.getByText(label, { exact: true }).element().parentElement),
            );
          }
        }
        const triggerElement = trigger.element();
        await trigger.click();
        await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
        const popup = await surface(".dropdown-content", result);
        take(result, "trigger open", triggerElement);
        take(result, "arrow", arrow(popup));
        const itemRole = state === State.SelectMulti ? "menuitemcheckbox" : "menuitemradio";
        for (const name of ["Alpha", "Beta", "Gamma"]) {
          const item = role(itemRole, name).element();
          take(result, name, item);
          const indicator = item.querySelector(".check-indicator");
          if (indicator) take(result, `${name} indicator`, indicator);
        }
        verify(theme, state, result);
      });
    }

    for (const state of [State.TooltipTop, State.TooltipRight]) {
      test(state, async () => {
        await render(
          <Anchor>
            <Tooltip
              content="Helpful explanation"
              side={state === State.TooltipTop ? "top" : "right"}
            >
              <Button>Tooltip target</Button>
            </Tooltip>
          </Anchor>,
        );
        await userEvent.tab();
        await expect.element(role("button", "Tooltip target")).toHaveFocus();
        await expect.element(role("tooltip", "Helpful explanation")).toBeInTheDocument();
        const result: Measurements = {};
        const popup = await surface(".tooltip-content", result);
        take(result, "arrow", arrow(popup));
        take(result, "arrow fill", required(arrow(popup).firstElementChild));
        verify(theme, state, result);
      });
    }

    test(State.PopoverOpen, async () => {
      await render(
        <Anchor>
          <Popover trigger={<Button>Open popover</Button>}>
            <p>Popover content</p>
          </Popover>
        </Anchor>,
      );
      await role("button", "Open popover").click();
      await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
      const result: Measurements = {};
      const popup = await surface(".popover-content", result);
      take(result, "arrow", arrow(popup));
      take(result, "arrow fill", required(arrow(popup).firstElementChild));
      verify(theme, State.PopoverOpen, result);
    });

    test(State.ComboboxOpen, async () => {
      await render(
        <Anchor>
          <label htmlFor="parity-combobox">Choose item</label>
          <Combobox id="parity-combobox" value={null} onChange={() => {}} options={options} />
        </Anchor>,
      );
      await role("button", "Toggle options").click();
      await expect.element(role("option", "Alpha")).toBeVisible();
      await userEvent.hover(document.documentElement, { position: { x: 5, y: 5 } });
      const result: Measurements = {};
      await surface(".dropdown-content", result);
      take(result, "input", role("combobox", "Choose item").element());
      for (const name of ["Alpha", "Beta", "Gamma"])
        take(result, name, role("option", name).element());
      verify(theme, State.ComboboxOpen, result);
    });

    test(State.DialogInModal, async () => {
      await render(<DialogInModalFixture />);
      role("button", "Open settings").element().focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(role("dialog", "Settings")).toBeVisible();
      await settle();
      role("button", "Delete item").element().focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(role("alertdialog", "Confirm action")).toBeVisible();
      const result: Measurements = {};
      const popup = await surface(".animated-modal", result);
      // Each open dialog dims what is behind it, so a confirmation over a settings
      // modal darkens the modal too.
      const layers = backdrops(popup);
      result.layers = { count: layers.length };
      layers.forEach((layer, index) => take(result, `backdrop ${String(index)}`, layer));
      result.focus = { onOpen: focusName() };
      await userEvent.keyboard("{Escape}");
      await settle();
      result.afterEscape = {
        dialogOpen: !!document.querySelector('[role="alertdialog"]'),
        modalOpen: !!document.querySelector('[role="dialog"]'),
        focus: focusName(),
      };
      verify(theme, State.DialogInModal, result);
    });

    test(State.ModalInDialog, async () => {
      await render(<ModalInDialogFixture />);
      role("button", "Open confirmation").element().focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(role("alertdialog", "Confirm action")).toBeVisible();
      await settle();
      role("button", "Edit details").element().focus();
      await userEvent.keyboard("{Enter}");
      await expect.element(role("dialog", "Details")).toBeVisible();
      const result: Measurements = {};
      const popup = await surface(role("dialog", "Details").element(), result);
      // A modal over a confirmation darkens the confirmation too.
      const layers = backdrops(popup);
      result.layers = { count: layers.length };
      layers.forEach((layer, index) => take(result, `backdrop ${String(index)}`, layer));
      result.focus = { onOpen: focusName() };
      await userEvent.keyboard("{Escape}");
      await settle();
      result.afterEscape = {
        modalOpen: !!document.querySelector('[role="dialog"]'),
        dialogOpen: !!document.querySelector('[role="alertdialog"]'),
        focus: focusName(),
      };
      verify(theme, State.ModalInDialog, result);
    });
  });
}

test.runIf(!enabled)("overlay parity runs only with VITE_PARITY=1 or VITE_PARITY_CAPTURE=1", () => {
  expect(enabled).toBe(false);
});
