import { useState } from "react";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import "../test-stylesheet";
import { Checkbox as CheckboxControl } from "./checkbox";
import { ToggleSquare as ToggleSquareControl, type ToggleSquareProps } from "./toggle-square";
import { Switch as SwitchControl } from "./switch";

enum Control {
  Checkbox = "Checkbox",
  ToggleSquare = "ToggleSquare",
  Switch = "Switch",
}

function Harness({
  control,
  changes,
  clicks,
  initial = false,
  wrappingLabel = false,
}: {
  control: Control;
  changes: (value: boolean) => void;
  clicks: EventTarget[];
  initial?: ToggleSquareProps["value"];
  wrappingLabel?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const onChange = (next: boolean) => {
    changes(next);
    setValue(next);
  };
  const element =
    control === Control.Checkbox ? (
      <CheckboxControl id="toggle-control" checked={value === true} onCheckedChange={onChange} />
    ) : control === Control.Switch ? (
      <SwitchControl id="toggle-control" checked={value === true} onCheckedChange={onChange} />
    ) : (
      <ToggleSquareControl value={value} onChange={onChange} />
    );

  return (
    <div role="presentation" onClick={(event) => clicks.push(event.target)}>
      {wrappingLabel ? (
        <label>
          <span>Toggle through label</span>
          {element}
        </label>
      ) : (
        <>
          {element}
          <label htmlFor="toggle-control">Toggle through label</label>
        </>
      )}
    </div>
  );
}

function button(control: Control) {
  return page
    .getByRole(control === Control.Switch ? "switch" : "checkbox")
    .element() as HTMLButtonElement;
}

function expectChecked(element: HTMLButtonElement, checked: boolean) {
  expect(element.tagName).toBe("BUTTON");
  expect(element.getAttribute("aria-checked")).toBe(String(checked));
  const input = element.nextElementSibling as HTMLInputElement;
  expect(input.tagName).toBe("INPUT");
  expect(input.checked).toBe(checked);
}

test.each(Object.values(Control))(
  "%s gives ancestors one button click and one value change per pointer or Space toggle",
  async (control) => {
    const changes = vi.fn();
    const clicks: EventTarget[] = [];
    await render(<Harness control={control} changes={changes} clicks={clicks} />);
    const element = button(control);
    expectChecked(element, false);

    await userEvent.click(element);
    expect(changes.mock.calls).toEqual([[true]]);
    expect(clicks).toEqual([element]);
    expectChecked(element, true);

    await userEvent.keyboard(" ");
    expect(changes.mock.calls).toEqual([[true], [false]]);
    expect(clicks).toEqual([element, element]);
    expectChecked(element, false);
  },
);

test("a partial ToggleSquare becomes on with one button click and one change on Space", async () => {
  const changes = vi.fn();
  const clicks: EventTarget[] = [];
  await render(
    <Harness control={Control.ToggleSquare} initial="partial" changes={changes} clicks={clicks} />,
  );
  const element = button(Control.ToggleSquare);
  expect(element.getAttribute("aria-checked")).toBe("mixed");
  element.focus();
  await userEvent.keyboard(" ");
  expect(changes).toHaveBeenCalledExactlyOnceWith(true);
  expect(clicks).toEqual([element]);
  expectChecked(element, true);
});

test.each(
  Object.values(Control).flatMap((control) =>
    [false, true].map((wrappingLabel) => ({ control, wrappingLabel })),
  ),
)(
  "$control changes once through a label (wrapping=$wrappingLabel)",
  async ({ control, wrappingLabel }) => {
    const changes = vi.fn();
    const clicks: EventTarget[] = [];
    await render(
      <Harness control={control} changes={changes} clicks={clicks} wrappingLabel={wrappingLabel} />,
    );
    const element = button(control);
    // ToggleSquare exposes no id prop; associate its native button in this fixture.
    if (control === Control.ToggleSquare && !wrappingLabel) element.id = "toggle-control";
    expectChecked(element, false);
    await userEvent.click(page.getByText("Toggle through label", { exact: true }));
    expect(changes).toHaveBeenCalledExactlyOnceWith(true);
    expectChecked(element, true);
    expect(clicks.filter((target) => target === element)).toEqual([element]);
    expect(clicks.some((target) => target instanceof HTMLInputElement)).toBe(false);
  },
);
