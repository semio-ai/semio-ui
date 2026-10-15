import { useState } from "react";
import { expect, test } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Select, type SelectVisuals } from "./select";
import { Tooltip } from "./tooltip";

const DESCRIPTION = "The current role determines access to projects and assets.";
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
    await outside.hover();
    const wrapper = page.getByTestId("role-tooltip-wrapper");
    await wrapper.hover();
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).toBeVisible();
    const content = document.querySelector<HTMLElement>(".tooltip-content")!;
    // A real pointer move crosses the trigger edge and the gap to the popup.
    // Hover must persist after that move, beyond Radix's transit grace area.
    await userEvent.hover(content);
    await expect.element(wrapper).toHaveAttribute("data-state", "delayed-open");
    expect(
      content.contains(
        document.elementFromPoint(
          content.getBoundingClientRect().x + content.getBoundingClientRect().width / 2,
          content.getBoundingClientRect().y + content.getBoundingClientRect().height / 2,
        ),
      ),
    ).toBe(true);
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(wrapper).toHaveAttribute("data-state", "closed");
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).not.toBeInTheDocument();
  });

  test(`${visuals}: keyboard focus opens the explanation and Escape dismisses it`, async () => {
    await render(<Harness visuals={visuals} />);
    const before = page.getByRole("button", { name: "Before", exact: true });
    await before.hover();
    await before.click();
    await userEvent.keyboard("{Tab}");
    const trigger = page.getByRole("button", { name: "Role: Editor", exact: true });
    await expect.element(trigger).toHaveFocus();
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect
      .element(page.getByTestId("role-tooltip-wrapper"))
      .toHaveAttribute("data-state", "closed");
    await expect.element(trigger).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("menuitemradio", { name: "Viewer", exact: true }))
      .toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
  });
}
