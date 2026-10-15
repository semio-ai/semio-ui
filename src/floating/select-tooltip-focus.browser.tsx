import { useState } from "react";
import { expect, test, vi } from "vitest";
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

function Harness({ visuals, onApply }: { visuals: SelectVisuals; onApply: () => void }) {
  const [value, setValue] = useState("editor");
  return (
    <div className="flex items-center gap-2 p-20">
      <button type="button">Before</button>
      <button type="button" onClick={onApply}>
        Apply
      </button>
      <Tooltip content={DESCRIPTION} side="left">
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
  test(`${visuals}: pointer selection restores focus and the adjacent action remains clickable`, async () => {
    const onApply = vi.fn();
    await render(<Harness visuals={visuals} onApply={onApply} />);
    await page.getByRole("button", { name: "Before", exact: true }).click();
    const trigger = page.getByRole("button", { name: "Role: Editor", exact: true });
    await trigger.click();
    await page.getByRole("menuitemradio", { name: "Viewer", exact: true }).click();
    // Radix guards focus-open during pointer-down. Restored focus does not
    // require an explanation; hover and keyboard focus are checked separately.
    await expect
      .element(page.getByRole("button", { name: "Role: Viewer", exact: true }))
      .toHaveFocus();
    await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    expect(onApply).toHaveBeenCalledOnce();
  });

  test(`${visuals}: hover opens the wrapping explanation and leaving closes it`, async () => {
    await render(<Harness visuals={visuals} onApply={() => {}} />);
    const outside = page.getByRole("button", { name: "Before", exact: true });
    await outside.hover();
    // The wrapper's center is outside an icon-only trigger, so its explanation
    // can be checked independently of the icon's own label tooltip.
    const wrapper = page.getByTestId("role-tooltip-wrapper");
    await wrapper.hover();
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).toBeVisible();
    await outside.hover();
    await expect.element(wrapper).toHaveAttribute("data-state", "closed");
  });

  test(`${visuals}: keyboard focus still opens the wrapping tooltip and the menu`, async () => {
    await render(<Harness visuals={visuals} onApply={() => {}} />);
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await userEvent.keyboard("{Tab}");
    const trigger = page.getByRole("button", { name: "Role: Editor", exact: true });
    await expect.element(trigger).toHaveFocus();
    await expect.element(page.getByText(DESCRIPTION, { exact: true })).toBeVisible();
    await userEvent.keyboard("{ArrowDown}");
    await expect
      .element(page.getByRole("menuitemradio", { name: "Viewer", exact: true }))
      .toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect.element(trigger).toHaveFocus();
  });
}
