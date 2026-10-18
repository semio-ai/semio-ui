/**
 * Primitive parity: checkbox, switch, toggle square, toggle group, accordion, collapse,
 * progress, separator, image input and toasts, in light and dark, against
 * `primitive-parity.baseline.json`. See `harness.ts` for how the parity files run and
 * how to recapture a baseline.
 *
 * Besides styles and geometry, each state records the DOM contract consumers style and
 * query by (tag, text content, role, ARIA and `data-*` state attributes, the Radix size
 * variables the stylesheet animates with) and the keyboard behaviour, so a library
 * change that keeps the look but moves an attribute, adds hidden text or changes a key
 * binding shows up as a named difference.
 */
import { type ReactNode, useEffect, useState } from "react";
import { beforeEach, describe, expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { Checkbox } from "../inputs/checkbox";
import { Switch } from "../inputs/switch";
import { ToggleSquare } from "../inputs/toggle-square";
import { ToggleGroup, type ToggleGroupProps } from "../inputs/toggle-group";
import { ImageInput } from "../inputs/image-input";
import { Accordion } from "../layouts/accordion";
import { Collapse } from "../layouts/collapse";
import { Separator } from "../layouts/separator";
import { Progress } from "../feedback/progress";
import { ToastManager, type ToastData } from "../floating/toast";
import { useAddToast } from "../hooks/use-add-toast";
import { Icon } from "../icons/registry";
import { Theme, Variant } from "../types";
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
  take,
} from "./harness";
import baseline from "./primitive-parity.baseline.json";

enum State {
  Checkboxes = "Checkbox",
  Switches = "Switch",
  ToggleSquares = "ToggleSquare",
  ToggleGroupPressed = "ToggleGroup",
  AccordionSections = "Accordion",
  CollapseSections = "Collapse",
  ProgressValues = "Progress",
  SeparatorOrientations = "Separator",
  ImageInputs = "ImageInput",
  ToastDefault = "Toast default",
  ToastSuccess = "Toast success",
  ToastError = "Toast error",
  ToastWarning = "Toast warning",
  ToastInfo = "Toast info",
  ToastAction = "Toast with action",
}

const verify = parityHarness({
  baseline: baseline as Record<string, Measurements>,
  baselinePath: "src/parity/primitive-parity.baseline.json",
  expectedCount: Object.values(State).length * 2,
});

/** Focus ring and movement, on top of the shared properties. */
const FOCUS = ["outlineStyle", "outlineWidth", "outlineColor", "outlineOffset"] as const;
// Tailwind v4 moves, turns and scales through the individual transform properties.
const MOTION = ["transform", "translate", "rotate", "scale"] as const;
const COLLAPSIBLE_SIZE = [
  "--radix-collapsible-content-height",
  "--radix-collapsible-content-width",
] as const;
const ACCORDION_SIZE = ["--radix-accordion-content-height"] as const;

/** Attributes consumers style and query by. An absent attribute records `(none)`. */
const CONTRACT = [
  "role",
  "type",
  "tabindex",
  "disabled",
  "aria-checked",
  "aria-pressed",
  "aria-disabled",
  "aria-expanded",
  "aria-orientation",
  "aria-valuenow",
  "aria-valuemin",
  "aria-valuemax",
  "aria-valuetext",
  "aria-live",
  "data-state",
  "data-disabled",
  "data-orientation",
] as const;

function contract(result: Measurements, name: string, element: Element) {
  result[name] = {
    tag: element.tagName.toLowerCase(),
    // Hidden text a library adds shows up wherever a consumer reads textContent.
    text: element.textContent ?? "",
    ...Object.fromEntries(
      CONTRACT.map((attribute) => [attribute, element.getAttribute(attribute) ?? "(none)"]),
    ),
  };
}

/** Blurs whatever has focus, then tabs once, so `:focus-visible` matches the target. */
async function tabFromStart() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  await userEvent.keyboard("{Tab}");
  await settle();
}

async function press(key: string) {
  await userEvent.keyboard(key);
  await settle();
}

/** Waits until `element`'s rect is unchanged across three frames (JS-driven motion). */
async function still(element: Element) {
  let previous = "";
  let unchanged = 0;
  for (let attempt = 0; attempt < 200 && unchanged < 3; attempt++) {
    await frame();
    const rect = JSON.stringify(element.getBoundingClientRect());
    unchanged = rect === previous ? unchanged + 1 : 0;
    previous = rect;
  }
  expect(unchanged, "element came to rest").toBe(3);
}

// Fixed inline geometry avoids adding Tailwind utilities to the source scan.
function Anchor({ children, width = 240 }: { children: ReactNode; width?: number | string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 400,
        top: 160,
        width,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {children}
    </div>
  );
}

function Labelled({ id, label, children }: { id: string; label: string; children: ReactNode }) {
  return (
    <div data-parity={id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {children}
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

const CHECKBOXES = [
  { id: "checkbox-off", label: "Checkbox off", checked: false, disabled: false },
  { id: "checkbox-on", label: "Checkbox on", checked: true, disabled: false },
  { id: "checkbox-primary", label: "Checkbox primary", checked: true, disabled: false },
  { id: "checkbox-disabled-off", label: "Checkbox disabled off", checked: false, disabled: true },
  { id: "checkbox-disabled-on", label: "Checkbox disabled on", checked: true, disabled: true },
];

function CheckboxFixture() {
  const [checked, setChecked] = useState(() => CHECKBOXES.map((box) => box.checked));
  return (
    <Anchor>
      {CHECKBOXES.map((box, index) => (
        <Labelled key={box.id} id={box.id} label={box.label}>
          <Checkbox
            id={box.id}
            checked={checked[index]}
            disabled={box.disabled}
            variant={box.id === "checkbox-primary" ? Variant.Primary : undefined}
            onCheckedChange={(next) =>
              setChecked((current) => current.map((value, i) => (i === index ? next : value)))
            }
          />
        </Labelled>
      ))}
    </Anchor>
  );
}

const SWITCHES = [
  { label: "Switch off", checked: false, disabled: false },
  { label: "Switch on", checked: true, disabled: false },
  { label: "Switch primary", checked: true, disabled: false },
  { label: "Switch disabled off", checked: false, disabled: true },
  { label: "Switch disabled on", checked: true, disabled: true },
];

function SwitchFixture() {
  const [checked, setChecked] = useState(() => SWITCHES.map((item) => item.checked));
  return (
    <Anchor>
      {SWITCHES.map((item, index) => (
        <div key={item.label} data-parity={item.label}>
          <Switch
            label={item.label}
            checked={checked[index]}
            disabled={item.disabled}
            variant={item.label === "Switch primary" ? Variant.Primary : undefined}
            onCheckedChange={(next) =>
              setChecked((current) => current.map((value, i) => (i === index ? next : value)))
            }
          />
        </div>
      ))}
    </Anchor>
  );
}

const SQUARES: { label: string; value: boolean | "partial"; disabled?: boolean; icon?: boolean }[] =
  [
    { label: "Square off", value: false },
    { label: "Square on", value: true },
    { label: "Square partial", value: "partial" },
    { label: "Square disabled", value: true, disabled: true },
    { label: "Square with icon", value: true, icon: true },
  ];

function ToggleSquareFixture() {
  const [values, setValues] = useState(() => SQUARES.map((square) => square.value));
  return (
    <Anchor>
      <div style={{ display: "flex", gap: 8 }}>
        {SQUARES.map((square, index) => (
          <span key={square.label} data-parity={square.label}>
            <ToggleSquare
              label={square.label}
              value={values[index]}
              disabled={square.disabled}
              variant={Variant.Primary}
              onChange={(next) =>
                setValues((current) => current.map((value, i) => (i === index ? next : value)))
              }
            >
              {square.icon ? <Icon name="search" /> : undefined}
            </ToggleSquare>
          </span>
        ))}
      </div>
    </Anchor>
  );
}

const GROUP_OPTIONS: ToggleGroupProps["options"] = [
  { label: "Alpha", value: "alpha", icon: "search" },
  { label: "Beta", value: "beta", icon: "close" },
  { label: "Gamma", value: "gamma", icon: "search", disabled: true },
  { label: "Delta", value: "delta", icon: "close", variant: Variant.Primary },
];

function ToggleGroupFixture() {
  const [value, setValue] = useState("beta");
  // At its natural width: the track clips its own overflow, and a clipped track
  // scrolls as focus moves, which is not the state being measured.
  return (
    <Anchor width="max-content">
      <ToggleGroup
        label="View mode"
        visuals="both"
        value={value}
        onChange={setValue}
        options={GROUP_OPTIONS}
      />
    </Anchor>
  );
}

function AccordionFixture() {
  return (
    <Anchor>
      <Accordion
        defaultOpen={["first"]}
        items={[
          { key: "first", header: "First section", content: <p>First section content.</p> },
          {
            key: "second",
            header: "Second section",
            content: (
              <div>
                <p>Second section content.</p>
                <p>It runs to a second line.</p>
              </div>
            ),
          },
          { key: "third", header: "Third section", content: <p>Never shown.</p>, disabled: true },
        ]}
      />
    </Anchor>
  );
}

function CollapseFixture() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  return (
    <Anchor>
      <Collapse title="Details">
        <p>Details content for parity.</p>
      </Collapse>
      <Collapse title="Settings" open={settingsOpen} onStateChange={setSettingsOpen}>
        <p>Settings content for parity.</p>
      </Collapse>
      <div style={{ display: "flex" }}>
        <Collapse
          title="Panel"
          direction="horizontal"
          open={panelOpen}
          onStateChange={setPanelOpen}
        >
          <p style={{ width: 120 }}>Panel content.</p>
        </Collapse>
      </div>
    </Anchor>
  );
}

const IMAGE = `data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8'><rect width='8' height='8' fill='#c33'/></svg>",
)}`;

function ImageInputFixture() {
  return (
    <Anchor>
      <ImageInput ariaLabel="Image set" src={IMAGE} fallback="Semio" onImageChange={() => {}} />
      <ImageInput ariaLabel="Image fallback" fallback="Semio" onImageChange={() => {}} />
      <ImageInput
        ariaLabel="Image fallback primary"
        variant={Variant.Primary}
        fallback="Robot"
        onImageChange={() => {}}
      />
    </Anchor>
  );
}

function AddOnMount({ data }: { data: ToastData }) {
  const addToast = useAddToast();
  useEffect(() => addToast(data), [addToast, data]);
  return null;
}

// A numeric `dismiss` is the timeout; a minute keeps each toast up while it is measured.
const TOASTS: [State, ToastData][] = [
  [State.ToastDefault, { id: "default", title: "Project saved", dismiss: 60000 }],
  [
    State.ToastSuccess,
    { id: "success", title: "Project published", variant: Variant.Success, dismiss: 60000 },
  ],
  [
    State.ToastError,
    {
      id: "error",
      title: "Upload failed",
      content: "The file is larger than the 50 MB limit.",
      variant: Variant.Error,
      dismiss: 60000,
    },
  ],
  [
    State.ToastWarning,
    { id: "warning", title: "Storage almost full", variant: Variant.Warning, dismiss: 60000 },
  ],
  [
    State.ToastInfo,
    { id: "info", title: "A new version is available", variant: Variant.Info, dismiss: 60000 },
  ],
  [
    State.ToastAction,
    {
      id: "action",
      title: "Item deleted",
      variant: Variant.Primary,
      dismiss: { label: "Undo", onClick: () => {} },
    },
  ],
];

for (const theme of [Theme.Light, Theme.Dark]) {
  describe(theme, () => {
    beforeEach(() => document.documentElement.classList.toggle("dark", theme === Theme.Dark));

    test(State.Checkboxes, async () => {
      await render(<CheckboxFixture />);
      await settle();
      const result: Measurements = {};
      for (const box of CHECKBOXES) {
        const wrapper = required(document.querySelector(`[data-parity="${box.id}"]`));
        const control = required(wrapper.querySelector('[role="checkbox"]'));
        take(result, box.label, control, FOCUS);
        contract(result, `${box.label} contract`, control);
        result[`${box.label} name`] = { labelled: role("checkbox", box.label).query() === control };
        const glyph = control.querySelector("svg");
        result[`${box.label} indicator`] = glyph ? measure(glyph) : { present: false };
      }
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      const first = role("checkbox", "Checkbox off").element();
      take(result, "Checkbox off focused", first, FOCUS);
      await press(" ");
      contract(result, "Checkbox off after Space", first);
      await press("{Tab}");
      result.keyboard.secondTab = focusName();
      verify(theme, State.Checkboxes, result);
    });

    test(State.Switches, async () => {
      await render(<SwitchFixture />);
      await settle();
      const result: Measurements = {};
      for (const item of SWITCHES) {
        const wrapper = required(document.querySelector(`[data-parity="${item.label}"]`));
        const control = required(wrapper.querySelector('[role="switch"]'));
        take(result, item.label, control, FOCUS);
        contract(result, `${item.label} contract`, control);
        result[`${item.label} name`] = { labelled: role("switch", item.label).query() === control };
        const thumb = required(control.firstElementChild);
        take(result, `${item.label} thumb`, thumb, MOTION);
        contract(result, `${item.label} thumb contract`, thumb);
      }
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      const first = role("switch", "Switch off").element();
      take(result, "Switch off focused", first, FOCUS);
      await press(" ");
      contract(result, "Switch off after Space", first);
      take(result, "Switch off thumb after Space", required(first.firstElementChild), MOTION);
      await press("{Enter}");
      contract(result, "Switch off after Enter", first);
      verify(theme, State.Switches, result);
    });

    test(State.ToggleSquares, async () => {
      await render(<ToggleSquareFixture />);
      await settle();
      const result: Measurements = {};
      for (const square of SQUARES) {
        const wrapper = required(document.querySelector(`[data-parity="${square.label}"]`));
        const control = required(wrapper.querySelector('[role="checkbox"]'));
        take(result, square.label, control, FOCUS);
        contract(result, `${square.label} contract`, control);
        result[`${square.label} name`] = {
          labelled: role("checkbox", square.label).query() === control,
        };
        const glyph = control.querySelector("svg");
        if (glyph) take(result, `${square.label} icon`, glyph);
      }
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      const partial = role("checkbox", "Square partial").element();
      partial instanceof HTMLElement && partial.focus();
      await settle();
      take(result, "Square partial focused", partial, FOCUS);
      await press(" ");
      contract(result, "Square partial after Space", partial);
      verify(theme, State.ToggleSquares, result);
    });

    test(State.ToggleGroupPressed, async () => {
      await render(<ToggleGroupFixture />);
      await settle();
      const result: Measurements = {};
      const items = () =>
        GROUP_OPTIONS.map((option) =>
          required(document.querySelector(`[data-toggle-item="${option.value}"]`)),
        );
      const root = required(document.querySelector('[aria-label="View mode"]'));
      take(result, "group", root);
      contract(result, "group contract", root);
      result["group name"] = { named: role("group", "View mode").query() === root };
      take(result, "pill", required(document.querySelector("[data-toggle-pill]")), MOTION);
      items().forEach((item, index) => {
        const label = GROUP_OPTIONS[index].label;
        take(result, label, item, FOCUS);
        contract(result, `${label} contract`, item);
      });
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      take(result, "Beta focused", items()[1], FOCUS);
      await press("{ArrowRight}");
      result.keyboard.afterArrowRight = focusName();
      await press("{ArrowRight}");
      result.keyboard.afterSecondArrowRight = focusName();
      await press(" ");
      items().forEach((item, index) =>
        contract(result, `${GROUP_OPTIONS[index].label} after Space`, item),
      );
      take(
        result,
        "pill after Space",
        required(document.querySelector("[data-toggle-pill]")),
        MOTION,
      );
      await press("{ArrowLeft}");
      result.keyboard.afterArrowLeft = focusName();
      verify(theme, State.ToggleGroupPressed, result);
    });

    test(State.AccordionSections, async () => {
      await render(<AccordionFixture />);
      await settle();
      const result: Measurements = {};
      const trigger = (name: string) => role("button", name).element();
      const panel = (text: string) =>
        page.getByText(text, { exact: true }).query()?.closest('[role="region"]') ?? null;
      for (const name of ["First section", "Second section", "Third section"]) {
        take(result, `${name} trigger`, trigger(name), FOCUS);
        contract(result, `${name} trigger contract`, trigger(name));
        take(result, `${name} header`, required(trigger(name).parentElement));
        contract(result, `${name} header contract`, required(trigger(name).parentElement));
        const icon = required(trigger(name).querySelector("svg"));
        take(result, `${name} icon`, icon, MOTION);
      }
      const first = required(panel("First section content."));
      take(result, "First section panel", first, ACCORDION_SIZE);
      contract(result, "First section panel contract", first);
      result.closedPanels = {
        second: panel("Second section content.") !== null,
        third: panel("Never shown.") !== null,
      };
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      take(result, "First section trigger focused", trigger("First section"), FOCUS);
      await press("{ArrowDown}");
      result.keyboard.afterArrowDown = focusName();
      await press("{ArrowDown}");
      result.keyboard.afterSecondArrowDown = focusName();
      trigger("Second section").focus();
      await press("{Enter}");
      const second = required(panel("Second section content."));
      take(result, "Second section panel opened", second, ACCORDION_SIZE);
      contract(result, "Second section trigger after Enter", trigger("Second section"));
      take(
        result,
        "Second section icon opened",
        required(trigger("Second section").querySelector("svg")),
        MOTION,
      );
      trigger("First section").focus();
      await press(" ");
      contract(result, "First section trigger after Space", trigger("First section"));
      result.afterSpace = { firstPanelMounted: panel("First section content.") !== null };
      verify(theme, State.AccordionSections, result);
    });

    test(State.CollapseSections, async () => {
      await render(<CollapseFixture />);
      await settle();
      const result: Measurements = {};
      const content = (text: string) => page.getByText(text, { exact: true }).query();
      for (const name of ["Details", "Settings", "Panel"]) {
        const trigger = role("button", name).element();
        take(result, `${name} trigger`, trigger, FOCUS);
        contract(result, `${name} trigger contract`, trigger);
        take(result, `${name} icon`, required(trigger.querySelector("svg")), MOTION);
      }
      result.closed = {
        details: content("Details content for parity.") !== null,
        settings: content("Settings content for parity.") !== null,
        panel: content("Panel content.") !== null,
      };
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      take(result, "Details trigger focused", role("button", "Details").element(), FOCUS);
      for (const [name, text] of [
        ["Details", "Details content for parity."],
        ["Settings", "Settings content for parity."],
        ["Panel", "Panel content."],
      ] as const) {
        const trigger = role("button", name).element();
        // The panel is the content's grandparent: Collapse wraps its children in a
        // sizing div inside the panel.
        const panel = () => content(text)?.parentElement?.parentElement ?? null;
        const opening = firstAnimation(panel);
        trigger.focus();
        await userEvent.keyboard("{Enter}");
        result[`${name} opening`] = await opening;
        const region = required(panel());
        await settle();
        take(result, `${name} content open`, region, COLLAPSIBLE_SIZE);
        contract(result, `${name} content contract`, region);
        contract(result, `${name} trigger open contract`, trigger);
        take(result, `${name} icon open`, required(trigger.querySelector("svg")), MOTION);
        const closing = firstAnimation(() =>
          region.getAttribute("data-state") === "closed" ? region : null,
        );
        await userEvent.keyboard(" ");
        result[`${name} closing`] = await closing;
        await settle();
        result[`${name} after close`] = { mounted: content(text) !== null };
      }
      verify(theme, State.CollapseSections, result);
    });

    test(State.ProgressValues, async () => {
      await render(
        <Anchor>
          <Progress progress={0} />
          <Progress progress={0.5} variant={Variant.Primary} />
          <Progress progress={1} variant={Variant.Success} />
        </Anchor>,
      );
      await settle();
      const result: Measurements = {};
      const bars = Array.from(document.querySelectorAll('[role="progressbar"]'));
      expect(bars).toHaveLength(3);
      bars.forEach((bar, index) => {
        const name = `progress ${String(index)}`;
        take(result, name, bar);
        contract(result, `${name} contract`, bar);
        const indicator = required(bar.firstElementChild);
        take(result, `${name} indicator`, indicator);
        contract(result, `${name} indicator contract`, indicator);
      });
      verify(theme, State.ProgressValues, result);
    });

    test(State.SeparatorOrientations, async () => {
      await render(
        <Anchor>
          <div data-parity="horizontal">
            <Separator />
          </div>
          <div data-parity="vertical" style={{ display: "flex", height: 40 }}>
            <span>Left</span>
            <Separator orientation="vertical" />
            <span>Right</span>
          </div>
          <div data-parity="labelled">
            <Separator variant={Variant.Primary}>Or</Separator>
          </div>
        </Anchor>,
      );
      await settle();
      const result: Measurements = {};
      for (const name of ["horizontal", "vertical", "labelled"]) {
        const wrapper = required(document.querySelector(`[data-parity="${name}"]`));
        const lines = Array.from(
          wrapper.querySelectorAll('[role="separator"], [data-orientation]'),
        );
        result[`${name} count`] = { lines: lines.length };
        lines.forEach((line, index) => {
          take(result, `${name} ${String(index)}`, line);
          contract(result, `${name} ${String(index)} contract`, line);
        });
      }
      verify(theme, State.SeparatorOrientations, result);
    });

    test(State.ImageInputs, async () => {
      await render(<ImageInputFixture />);
      const set = role("button", "Image set").element();
      await expect.poll(() => set.querySelector("img")).not.toBeNull();
      await expect.poll(() => set.querySelector("img")!.complete).toBe(true);
      await settle();
      const result: Measurements = {};
      for (const name of ["Image set", "Image fallback", "Image fallback primary"]) {
        const root = role("button", name).element();
        take(result, name, root, FOCUS);
        contract(result, `${name} contract`, root);
        const image = root.querySelector("img");
        const fallback = Array.from(root.querySelectorAll("*")).find(
          (element) => element.children.length === 0 && /^[SR]$/.test(element.textContent ?? ""),
        );
        result[`${name} parts`] = { image: !!image, fallback: !!fallback };
        if (image) take(result, `${name} image`, image);
        if (fallback) take(result, `${name} fallback`, fallback);
      }
      await tabFromStart();
      result.keyboard = { firstTab: focusName() };
      take(result, "Image set focused", set, FOCUS);
      verify(theme, State.ImageInputs, result);
    });

    for (const [state, data] of TOASTS) {
      test(state, async () => {
        await render(
          <ToastManager>
            <AddOnMount key="add" data={data} />
          </ToastManager>,
        );
        await expect.poll(() => document.querySelector(".card-overlay")).not.toBeNull();
        const toast = required(document.querySelector(".card-overlay"));
        await settle();
        await still(toast);
        const result: Measurements = {};
        take(result, "toast", toast);
        contract(result, "toast contract", toast);
        const list = required(toast.parentElement);
        take(result, "viewport", list);
        contract(result, "viewport contract", list);
        const region = required(toast.closest('[role="region"]'));
        result.region = { label: region.getAttribute("aria-label") ?? "(none)" };
        const title = page.getByText(data.title, { exact: true }).element();
        take(result, "title", required(title.parentElement));
        take(result, "title text", title);
        if (data.content) {
          take(result, "description", page.getByText(data.content, { exact: true }).element());
        }
        const close =
          typeof data.dismiss === "object"
            ? role("button", data.dismiss.label).element()
            : role("button", "dismiss").element();
        take(result, "close", close);
        contract(result, "close contract", close);
        const ring = required(toast.querySelector('svg[viewBox="0 0 10 10"]')?.parentElement);
        take(result, "ring", ring);
        const glyphs = () => ring.querySelector(".absolute")?.innerHTML ?? "";
        const resting = glyphs();
        result.status = { glyph: resting !== "" };
        await userEvent.hover(toast);
        await expect.poll(glyphs).not.toBe(resting);
        result.status.changesOnHover = true;
        await userEvent.click(close);
        await expect.poll(() => document.querySelector(".card-overlay")).toBeNull();
        result.status.removedOnClose = true;
        verify(theme, state, result);
      });
    }
  });
}
