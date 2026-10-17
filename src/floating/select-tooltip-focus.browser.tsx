import { useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Select, type SelectVisuals } from "./select";
import { Tooltip } from "./tooltip";

const DESCRIPTION = "The current role determines access to projects and assets.";
const WAIT_OPTIONS = { timeout: 5_000 };
const OPTIONS = [
  { value: "editor", label: "Editor" },
  { value: "viewer", label: "Viewer" },
];

function Harness({ visuals }: { visuals: SelectVisuals }) {
  const [value, setValue] = useState("editor");
  return (
    <div className="flex items-center gap-2 p-20">
      <button type="button">Before</button>
      <Tooltip content={DESCRIPTION} side="bottom">
        <span data-testid="role-tooltip-wrapper" className="inline-flex w-32">
          <Select
            value={value}
            onChange={setValue}
            options={OPTIONS}
            label="Role"
            visuals={visuals}
          />
        </span>
      </Tooltip>
    </div>
  );
}

for (const visuals of ["labels", "both", "icons"] as const) {
  test(`${visuals}: the pointer can move onto the explanation and keep it open`, async () => {
    await render(<Harness visuals={visuals} />);
    const outside = page.getByRole("button", { name: "Before", exact: true });
    await outside.hover(WAIT_OPTIONS);
    const wrapper = page.getByTestId("role-tooltip-wrapper");
    await wrapper.hover(WAIT_OPTIONS);
    await expect.element(page.getByText(DESCRIPTION, { exact: true }), WAIT_OPTIONS).toBeVisible();
    const content = document.querySelector<HTMLElement>(".tooltip-content")!;
    // A real pointer move crosses the trigger edge and the gap to the popup.
    // Hover must persist after that move, beyond Radix's transit grace area.
    await userEvent.hover(content, WAIT_OPTIONS);
    await expect.element(wrapper, WAIT_OPTIONS).toHaveAttribute("data-state", "delayed-open");
    expect(
      content.contains(
        document.elementFromPoint(
          content.getBoundingClientRect().x + content.getBoundingClientRect().width / 2,
          content.getBoundingClientRect().y + content.getBoundingClientRect().height / 2,
        ),
      ),
    ).toBe(true);
    await expect.element(page.getByText(DESCRIPTION, { exact: true }), WAIT_OPTIONS).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(wrapper, WAIT_OPTIONS).toHaveAttribute("data-state", "closed");
    await expect
      .element(page.getByText(DESCRIPTION, { exact: true }), WAIT_OPTIONS)
      .not.toBeInTheDocument();
  }, 30_000);

  test(`${visuals}: keyboard focus opens the explanation and Escape dismisses it`, async () => {
    await render(<Harness visuals={visuals} />);
    const before = page.getByRole("button", { name: "Before", exact: true });
    await before.hover(WAIT_OPTIONS);
    await before.click(WAIT_OPTIONS);
    await expect.element(before, WAIT_OPTIONS).toHaveFocus();
    const wrapper = page.getByTestId("role-tooltip-wrapper");
    const explanation = page.getByText(DESCRIPTION, { exact: true });
    const menu = page.getByRole("menu", { name: "Role: Editor", exact: true });
    await userEvent.keyboard("{Tab}");
    const trigger = page.getByRole("button", { name: "Role: Editor", exact: true });
    await expect.element(trigger, WAIT_OPTIONS).toHaveFocus();
    await expect.element(trigger, WAIT_OPTIONS).toHaveAttribute("aria-expanded", "false");
    await expect.element(explanation, WAIT_OPTIONS).toBeVisible();

    // With only the explanation open, Escape dismisses the tooltip without moving focus.
    await userEvent.keyboard("{Escape}");
    await expect.element(wrapper, WAIT_OPTIONS).toHaveAttribute("data-state", "closed");
    await expect.element(explanation, WAIT_OPTIONS).not.toBeInTheDocument();
    await expect.element(trigger, WAIT_OPTIONS).toHaveFocus();
    await expect.element(menu, WAIT_OPTIONS).not.toBeInTheDocument();

    await userEvent.keyboard("{ArrowDown}");
    await expect.element(menu, WAIT_OPTIONS).toBeVisible();
    await expect
      .element(page.getByRole("menuitemradio", { name: "Editor", exact: true }), WAIT_OPTIONS)
      .toHaveFocus();
    await expect
      .element(page.getByRole("menuitemradio", { name: "Viewer", exact: true }), WAIT_OPTIONS)
      .toBeVisible();
    await expect.element(wrapper, WAIT_OPTIONS).toHaveAttribute("data-state", "closed");
    await expect.element(explanation, WAIT_OPTIONS).not.toBeInTheDocument();

    // The modal menu hides the trigger from role queries until its content unmounts.
    await userEvent.keyboard("{Escape}");
    await expect.poll(() => document.querySelector('[role="menu"]'), WAIT_OPTIONS).toBeNull();
    await expect.element(trigger, WAIT_OPTIONS).toHaveFocus();
    await expect.element(trigger, WAIT_OPTIONS).toHaveAttribute("aria-expanded", "false");
    // Radix opens tooltips on restored keyboard focus; the explanation must not trap it.
    await expect.element(explanation, WAIT_OPTIONS).toBeVisible();
    await userEvent.keyboard("{Shift>}{Tab}{/Shift}");
    await expect.element(before, WAIT_OPTIONS).toHaveFocus();
    await expect.element(wrapper, WAIT_OPTIONS).toHaveAttribute("data-state", "closed");
    await expect.element(explanation, WAIT_OPTIONS).not.toBeInTheDocument();
  }, 30_000);
}
