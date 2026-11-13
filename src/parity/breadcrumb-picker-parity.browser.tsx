/**
 * Breadcrumb picker geometry, paint, semantics and interaction in both themes.
 * These observations capture the searchable and menu paths through BreadcrumbTrail.
 */
import { useState } from "react";
import { IconPencil } from "@tabler/icons-react";
import { beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Button } from "../buttons/button";
import { IconProvider } from "../icons/registry/icon-provider";
import { BreadcrumbTrail, type BreadcrumbTrailItem } from "../layouts/breadcrumb-trail";
import { Theme } from "../types";
import {
  type Measurements,
  firstAnimation,
  focusName,
  parityHarness,
  required,
  settle,
  surface,
  take,
} from "./harness";
import baseline from "./breadcrumb-picker-parity.baseline.json";

enum State {
  ProjectPicker = "Project picker",
  SectionPicker = "Section picker",
  EditableWithoutSearch = "Editable switcher without search",
  Statuses = "Loading, error, empty and capped lists",
  NarrowViewport = "Project picker on a narrow viewport",
}

const verify = parityHarness({
  baseline: baseline as Record<string, Measurements>,
  baselinePath: "src/parity/breadcrumb-picker-parity.baseline.json",
  expectedCount: Object.values(State).length * 2,
});

type Switcher = NonNullable<BreadcrumbTrailItem["switcher"]>;
// Pencil is a consumer-owned registry key, supplied here for the rename action.
declare module "../icons/registry/types" {
  interface IconRegistryKeys {
    pencil: true;
  }
}

const options = [
  { value: "a", label: "Project A" },
  { value: "b", label: "Project B" },
  { value: "c", label: "Gamma" },
];
const footerLabels = new Set(["Rename", "View all projects"]);
const popup = () => document.querySelector('.dropdown-content[data-state="open"]');
const text = (element: Element) => element.textContent?.trim() ?? "";
// Styled rows keep their roles available as observations for both picker paths.
const rows = (element: Element) => Array.from(element.querySelectorAll('[class~="group/item"]'));
const optionRows = (element: Element) =>
  rows(element).filter((row) => !footerLabels.has(text(row)));
const highlighted = () =>
  popup()
    ? rows(required(popup()))
        .filter((row) => row.hasAttribute("data-highlighted"))
        .map(text)
        .join(" | ")
    : "";
const searchField = () => required(popup()?.querySelector<HTMLInputElement>("input"));
const trigger = (label = "Switch Project: Project A") =>
  required(document.querySelector<HTMLElement>(`[aria-label="${label}"]`));
const rowNamed = (label: string) =>
  required(rows(required(popup())).find((row) => text(row) === label));

function item(calls: string[], overrides: Partial<Switcher> = {}): BreadcrumbTrailItem {
  return {
    id: "project",
    label: "Project A",
    switcher: {
      label: "Switch Project",
      value: "a",
      options,
      searchable: true,
      onSelect: (value) => calls.push(`project select ${value}`),
      browse: {
        label: "View all projects",
        icon: "list",
        onSelect: () => calls.push("project browse"),
      },
      ...overrides,
    },
    onRename: (name) => {
      calls.push(`project rename ${name}`);
    },
    renameIcon: "pencil",
  };
}

function Fixture({ calls, project = {} }: { calls: string[]; project?: Partial<Switcher> }) {
  const [outsideClicks, setOutsideClicks] = useState(0);
  return (
    <IconProvider registry={{ pencil: IconPencil }}>
      <div
        style={{
          position: "fixed",
          left: "50%",
          transform: "translateX(-50%)",
          top: 120,
          width: "min(400px, calc(100vw - 32px))",
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
          gap: 16,
        }}
      >
        <Button>Before</Button>
        <BreadcrumbTrail
          items={[
            {
              id: "section",
              label: "Projects",
              href: "/projects",
              switcher: {
                label: "Switch Section",
                value: "projects",
                options: [
                  { value: "projects", label: "Projects" },
                  { value: "assets", label: "Assets" },
                ],
                onSelect: (value) => calls.push(`section select ${value}`),
                browse: {
                  label: "View all projects",
                  icon: "list",
                  onSelect: () => calls.push("section browse"),
                },
              },
            },
            item(calls, project),
          ]}
        />
        <div style={{ marginTop: 320 }}>
          <Button onClick={() => setOutsideClicks((count) => count + 1)}>Outside</Button>
          <output aria-label="Outside clicks">{outsideClicks}</output>
        </div>
      </div>
    </IconProvider>
  );
}

function semantics(result: Measurements, name: string, element: Element) {
  result[name] = {
    tag: element.tagName.toLowerCase(),
    role: element.getAttribute("role") ?? "(none)",
    ariaChecked: element.getAttribute("aria-checked") ?? "(none)",
    ariaSelected: element.getAttribute("aria-selected") ?? "(none)",
    containerRole: element.parentElement?.getAttribute("role") ?? "(none)",
  };
}

/** The product of every opacity from `element` up to and including `root`. */
function effectiveOpacity(element: Element, root: Element) {
  let opacity = 1;
  for (let node: Element | null = element; node; node = node.parentElement) {
    opacity *= Number(getComputedStyle(node).opacity);
    if (node === root) break;
  }
  return Math.round(opacity * 100) / 100;
}

function relative(result: Measurements, name: string, element: Element, anchor: Element) {
  const rect = element.getBoundingClientRect();
  const origin = anchor.getBoundingClientRect();
  const round = (value: number) => Math.round(value * 2) / 2 || 0;
  result[name] = { left: round(rect.left - origin.left), top: round(rect.top - origin.top) };
}

function openFacts(result: Measurements, name: string, button: Element, content: Element) {
  take(result, `${name} trigger`, button);
  const controls = button.getAttribute("aria-controls");
  result[`${name} trigger semantics`] = {
    tag: button.tagName.toLowerCase(),
    role: button.getAttribute("role") ?? "(none)",
    ariaHaspopup: button.getAttribute("aria-haspopup") ?? "(none)",
    ariaExpanded: button.getAttribute("aria-expanded") ?? "(none)",
    // Generated identifiers record presence and resolution so captures stay repeatable.
    ariaControlsPresent: controls !== null,
    ariaControlsResolves: !!controls && !!document.getElementById(controls),
  };
  result[`${name} popup semantics`] = {
    role: content.getAttribute("role") ?? "(none)",
    ariaModal: content.getAttribute("aria-modal") ?? "(none)",
    focus: focusName(),
  };
  relative(result, `${name} popup offset`, content, button);
  const arrowSvg = required(content.querySelector('svg[viewBox="0 0 30 10"]'));
  const arrow = required(arrowSvg.parentElement);
  take(result, `${name} arrow`, arrow);
  take(result, `${name} arrow svg`, arrowSvg);
  take(result, `${name} arrow fill`, required(arrowSvg.querySelector("path")));
  result[`${name} arrow side`] = { side: arrow.getAttribute("data-side") ?? "(none)" };
  relative(result, `${name} arrow offset`, arrow, button);
  const label = required(
    page
      .getByText(
        button.getAttribute("aria-label")?.startsWith("Switch Section")
          ? "Switch Section"
          : "Switch Project",
        { exact: true },
      )
      .elements()
      .find((element) => content.contains(element)),
  );
  take(result, `${name} header label`, label);
  const input = content.querySelector("input");
  result[`${name} search`] = { present: !!input, role: input?.getAttribute("role") ?? "(none)" };
  if (input) {
    take(result, `${name} search field`, input);
    take(result, `${name} search group`, required(input.parentElement));
  }
  rows(content).forEach((row, index) => {
    const key = `${name} ${footerLabels.has(text(row)) ? "footer" : "option"} ${String(index + 1)} ${text(row)}`;
    take(result, key, row);
    semantics(result, `${key} semantics`, row);
    const indicator = row.querySelector(".check-indicator");
    result[`${key} indicator`] = { present: !!indicator };
    if (indicator) take(result, `${key} check indicator`, indicator);
    // The row's icon, wherever the row's structure places it, with the opacity it is
    // painted at: a dimmed container dims the icon without changing its own opacity.
    const icon = row.querySelector("svg");
    result[`${key} icon`] = icon
      ? { present: true, effectiveOpacity: effectiveOpacity(icon, row) }
      : { present: false };
    if (icon) take(result, `${key} icon svg`, icon);
  });
  content.querySelectorAll('[role="separator"]').forEach((separator, index) => {
    take(result, `${name} separator ${String(index + 1)}`, separator);
  });
}

async function press(key: string) {
  await userEvent.keyboard(key);
  await settle();
  return focusName();
}

/** Re-check Escape teardown before every independent opening. */
async function closePicker() {
  for (let attempt = 0; attempt < 3 && popup(); attempt++) await press("{Escape}");
  await expect.poll(() => !!popup()).toBe(false);
  // A rename the previous step started is cancelled, so the crumb's trigger is back.
  const renameField = document.querySelector<HTMLInputElement>('input[aria-label^="Rename "]');
  if (renameField) {
    renameField.focus();
    await press("{Escape}");
  }
  await settle();
}

async function opening(result: Measurements, name: string, button: HTMLElement, keyboard = false) {
  await closePicker();
  if (keyboard) button.focus();
  const entrance = firstAnimation(popup);
  if (keyboard) await userEvent.keyboard("{Enter}");
  else await userEvent.click(button);
  result[`${name} first animation`] = await entrance;
  const content = await surface(required(popup()), result, `${name} surface`);
  openFacts(result, name, button, content);
  return content;
}

function interaction(result: Measurements, name: string, calls: string[]) {
  result[name] = {
    callbacks: JSON.stringify(calls),
    open: !!popup(),
    focus: focusName(),
    highlighted: highlighted(),
    outsideClicks:
      required(document.querySelector('[aria-label="Outside clicks"]')).textContent ?? "",
  };
}

async function traversal(result: Measurements, button: HTMLElement) {
  await opening(result, "pointer open", button);
  await press("{ArrowDown}");
  result["pointer ArrowDown"] = { highlighted: highlighted(), focus: focusName() };
  rows(required(popup()))
    .filter((row) => row.hasAttribute("data-highlighted"))
    .forEach((row, index) => take(result, `pointer highlighted ${String(index + 1)}`, row));
  const browse = rowNamed("View all projects");
  await userEvent.hover(browse);
  await settle();
  result["browse hover"] = { highlighted: highlighted(), focus: focusName() };
  take(result, "browse hovered row", browse);
  await closePicker();
  result["Escape closed"] = { open: !!popup(), focus: focusName() };
  await opening(result, "Enter open", button, true);
  result.keyboard = { onOpen: `${highlighted()} | focus: ${focusName()}` };
  for (const [direction, key] of [
    ["down", "{ArrowDown}"],
    ["up", "{ArrowUp}"],
  ]) {
    for (let step = 1; step <= 7; step++) {
      await press(key);
      result.keyboard[`${direction} ${String(step)}`] = `${highlighted()} | focus: ${focusName()}`;
    }
  }
}

async function tabExits(result: Measurements, button: HTMLElement, calls: string[]) {
  await opening(result, "before Tab", button);
  await press("{Tab}");
  interaction(result, "Tab 1", calls);
  await press("{Tab}");
  interaction(result, "Tab 2", calls);
  await opening(result, "before Shift Tab", button);
  await press("{Shift>}{Tab}{/Shift}");
  interaction(result, "Shift Tab", calls);
}

async function rename(result: Measurements, calls: string[]) {
  await closePicker();
  await opening(result, "before Rename", trigger());
  await userEvent.click(rowNamed("Rename"));
  await settle();
  interaction(result, "Rename pointer activation", calls);
  // Escape leaves the rename field so the following openings use the crumb trigger.
  await press("{Escape}");
}

for (const theme of [Theme.Light, Theme.Dark]) {
  describe(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    test(
      State.ProjectPicker,
      async () => {
        const calls: string[] = [];
        await render(<Fixture calls={calls} />);
        const result: Measurements = {};
        await traversal(result, trigger());
        await userEvent.fill(searchField(), "B");
        await settle();
        result["search B"] = { rows: optionRows(required(popup())).map(text).join(" | ") };
        await press("{ArrowDown}");
        await press("{Enter}");
        interaction(result, "search selection", calls);

        await opening(result, "before hover typing", trigger());
        await userEvent.hover(rowNamed("Project B"));
        await userEvent.keyboard("Ga");
        await settle();
        result["typing after option hover"] = { value: searchField().value, focus: focusName() };
        await rename(result, calls);
        await tabExits(result, trigger(), calls);
        verify(theme, State.ProjectPicker, result);
      },
      30_000,
    );

    test(
      State.SectionPicker,
      async () => {
        const calls: string[] = [];
        await render(<Fixture calls={calls} />);
        const result: Measurements = {};
        const button = trigger("Switch Section menu");
        await traversal(result, button);
        await press("{ArrowDown}");
        result["before selection"] = { highlighted: highlighted(), focus: focusName() };
        await press("{Enter}");
        interaction(result, "keyboard selection", calls);
        await tabExits(result, button, calls);
        verify(theme, State.SectionPicker, result);
      },
      30_000,
    );

    test(
      State.EditableWithoutSearch,
      async () => {
        const calls: string[] = [];
        await render(<Fixture calls={calls} project={{ searchable: false }} />);
        const result: Measurements = {};
        await traversal(result, trigger());
        await press("{ArrowDown}");
        result["before selection"] = { highlighted: highlighted(), focus: focusName() };
        await press("{Enter}");
        interaction(result, "keyboard selection", calls);
        await rename(result, calls);
        await tabExits(result, trigger(), calls);
        verify(theme, State.EditableWithoutSearch, result);
      },
      30_000,
    );

    test(
      State.Statuses,
      async () => {
        const calls: string[] = [];
        const view = await render(<Fixture calls={calls} />);
        const result: Measurements = {};
        for (const [name, project] of [
          ["loading", { loading: true }],
          ["error", { error: "Could not load projects" }],
          ["empty", { options: [], emptyText: "No other projects" }],
          ["no matches", {}],
          [
            "capped",
            {
              options: Array.from({ length: 60 }, (_, index) => ({
                value: String(index + 1),
                label: `Project ${String(index + 1)}`,
              })),
            },
          ],
        ] satisfies [string, Partial<Switcher>][]) {
          await closePicker();
          await view.rerender(<Fixture calls={calls} project={project} />);
          await opening(result, name, trigger());
          if (name === "no matches") {
            await userEvent.fill(searchField(), "zzz");
            await settle();
          }
          const content = required(popup());
          // Both status messages and the cap notice are rendered as paragraphs.
          const status = required(content.querySelector("p"));
          result[`${name} message`] = {
            text: text(status),
            renderedOptions: optionRows(content).length,
          };
          take(result, `${name} status row`, status);
        }
        verify(theme, State.Statuses, result);
      },
      30_000,
    );

    test(
      State.NarrowViewport,
      async () => {
        await page.viewport(360, 740);
        const result: Measurements = {};
        try {
          await render(<Fixture calls={[]} />);
          await opening(result, "narrow pointer open", trigger());
        } finally {
          await closePicker();
          await page.viewport(1280, 800);
        }
        verify(theme, State.NarrowViewport, result);
      },
      30_000,
    );
  });
}
