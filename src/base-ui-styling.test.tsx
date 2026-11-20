// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { useContext, useEffect } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Dropdown } from "./floating/dropdown";
import { Dialog } from "./floating/dialog";
import { Tooltip } from "./floating/tooltip";
import { ToastContext, ToastManager } from "./floating/toast";
import { NestedCheckbox } from "./nested-elements/checkbox";
import { NestedRadio } from "./nested-elements/radio";
import { NestedCheckboxTree } from "./nested-elements/checkbox-tree";
import { Accordion } from "./layouts/accordion";
import { Collapse } from "./layouts/collapse";
import { Tabs } from "./layouts/tabs";
import { Switch } from "./inputs/switch";
import { Checkbox } from "./inputs/checkbox";
import { ToggleGroup } from "./inputs/toggle-group";
import { ToggleSquare } from "./inputs/toggle-square";
import { Progress } from "./feedback/progress";

const ignore = () => {};

beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(HTMLElement.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
});

function AddToast() {
  const { addToast } = useContext(ToastContext);
  useEffect(
    () => addToast({ id: "styling-contract", title: "Notification", dismiss: 60000 }),
    [addToast],
  );
  return null;
}

test("mounted library controls and overlays never set data-state", async () => {
  render(
    <ToastManager>
      <AddToast />
      <Dropdown open trigger={<button type="button">Menu</button>}>
        <NestedCheckbox label="Checked item" value />
        <NestedCheckbox label="Unchecked item" value={false} />
        <NestedRadio value="a" options={[{ value: "a", label: "Radio item" }]} />
        <NestedCheckboxTree
          values={["a"]}
          options={[
            {
              value: "parent",
              label: "Partial tree",
              children: [
                { value: "a", label: "A" },
                { value: "b", label: "B" },
              ],
            },
          ]}
        />
      </Dropdown>
      <Dialog open title="Dialog" onStateChange={ignore}>
        Dialog content
      </Dialog>
      <Tooltip content="Explanation" controlledState={[true, ignore]}>
        <button type="button">Tooltip trigger</button>
      </Tooltip>
      <Accordion defaultOpen items={[{ key: "a", header: "Accordion", content: "Panel" }]} />
      <Collapse open title="Collapse">
        Panel
      </Collapse>
      <Switch checked onCheckedChange={ignore} />
      <Checkbox checked onCheckedChange={ignore} />
      <ToggleSquare value="partial" onChange={ignore} />
      <ToggleGroup
        visuals="labels"
        value="a"
        onChange={ignore}
        options={[{ value: "a", label: "Toggle" }]}
      />
      <Tabs selected="a" onTabChange={ignore}>
        {[{ key: "a", title: "Tab", content: "Tab panel" }]}
      </Tabs>
      <Progress progress={0.5} />
      <Progress progress={1} />
      <Progress progress={-1} />
    </ToastManager>,
  );

  // Assert each portalled surface exists so an empty portal cannot satisfy the contract.
  await waitFor(() => {
    expect(document.querySelector('[role="menu"][data-open]')).not.toBeNull();
    expect(document.querySelector('[role="alertdialog"][data-open]')).not.toBeNull();
    expect(document.querySelector('[role="tooltip"][data-open]')).not.toBeNull();
    expect(document.querySelector("li.card-overlay")).not.toBeNull();
  });
  for (const selector of [
    '[role="menuitemcheckbox"][data-checked]',
    '[role="menuitemcheckbox"][data-unchecked]',
    '[role="menuitemradio"][data-checked]',
    '[role="checkbox"][data-indeterminate]',
    "h3[data-open]",
    ".CollapsibleVerticalContent[data-open]",
    '[role="switch"][data-checked]',
    'button[role="checkbox"][data-checked]',
    "[data-toggle-item][data-pressed]",
    '[role="tab"][data-active]',
    '[role="progressbar"][data-progressing]',
    '[role="progressbar"][data-complete]',
    '[role="progressbar"][data-indeterminate]',
  ]) {
    expect(document.querySelector(selector), selector).not.toBeNull();
  }
  expect(document.querySelectorAll("[data-state]")).toHaveLength(0);
});

test("the shipped stylesheet uses only Base UI attributes and variables", () => {
  const styles = readFileSync("public/styles.css", "utf8");
  expect(styles).not.toContain("data-state");
  expect(styles).not.toContain("--radix-");
});
