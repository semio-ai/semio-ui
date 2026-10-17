// @vitest-environment jsdom
import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { ToggleSquare } from "./toggle-square";

beforeEach(() => {
  vi.stubGlobal("PointerEvent", MouseEvent);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const controls = [
  {
    name: "Checkbox",
    render: (checked: boolean, callback: (value: boolean) => void) => (
      <Checkbox checked={checked} onCheckedChange={callback} />
    ),
  },
  {
    name: "Switch",
    render: (checked: boolean, callback: (value: boolean) => void) => (
      <Switch checked={checked} onCheckedChange={callback} />
    ),
  },
  {
    name: "ToggleSquare",
    render: (checked: boolean, callback: (value: boolean) => void) => (
      <ToggleSquare value={checked} onChange={callback} />
    ),
  },
];

test.each(controls)("$name calls its consumer with exactly one boolean", (control) => {
  const callback = vi.fn();
  const view = render(control.render(false, callback));
  fireEvent.click(view.container.querySelector("button")!);
  expect(callback).toHaveBeenCalledExactlyOnceWith(true);

  callback.mockClear();
  view.rerender(control.render(true, callback));
  fireEvent.click(view.container.querySelector("button")!);
  expect(callback).toHaveBeenCalledExactlyOnceWith(false);
});

test("a partial ToggleSquare calls its consumer with only true", () => {
  const callback = vi.fn();
  const view = render(<ToggleSquare value="partial" onChange={callback} />);
  fireEvent.click(view.getByRole("checkbox"));
  expect(callback).toHaveBeenCalledExactlyOnceWith(true);
});
