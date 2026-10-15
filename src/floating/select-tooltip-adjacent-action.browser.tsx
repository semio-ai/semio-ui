import { useState } from "react";
import { expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import { CrownLine, Pen, Refresh } from "@solar-icons/react-perf/LineDuotone";
import "../test-stylesheet";
import { Button } from "../buttons/button";
import { createSolarIcon } from "../icons/registry/solar-glyph";
import { Size, Variant } from "../types";
import { Select, type SelectOption } from "./select";
import { Tooltip } from "./tooltip";

const NO_ACCESS_DESCRIPTION = "Members open a new project only if it is shared with them.";
const APPLY_LABEL = "Remove members' access from 2 existing projects";
// Studio registers these glyphs under app-specific role keys. Use the same
// artwork here without importing the consuming app into the UI package.
const ApplyIcon = createSolarIcon(Refresh);
const AdminIcon = createSolarIcon(CrownLine);
const EditorIcon = createSolarIcon(Pen);
const OPTIONS = [
  {
    value: "none",
    label: "No access",
    icon: "access-none",
    description: NO_ACCESS_DESCRIPTION,
  },
  {
    value: "admin",
    label: "Admin",
    icon: <AdminIcon />,
    description: "Can edit and manage access.",
  },
  {
    value: "editor",
    label: "Editor",
    icon: <EditorIcon />,
    description: "Can edit, but not share.",
  },
  { value: "viewer", label: "Viewer", icon: "show", description: "Can view." },
  {
    value: "user",
    label: "User",
    icon: "show",
    description: "Can use, but not open.",
  },
] satisfies SelectOption[];

function Harness({
  onApply,
  keepExplanationOpen = false,
}: {
  onApply: () => void;
  keepExplanationOpen?: boolean;
}) {
  const [value, setValue] = useState("editor");
  return (
    <div className="p-20">
      <button type="button">Outside the row</button>
      <div className="mt-20 flex items-center justify-between gap-4 px-3 py-2.5">
        <div>
          <div>Members&apos; role on a new project</div>
          <div>Applied when a project is created. It changes nothing that already exists.</div>
        </div>
        <span className="flex shrink-0 flex-row items-center gap-2">
          <Tooltip content={APPLY_LABEL} side="top">
            <Button
              size={Size.Sm}
              variant={Variant.Info}
              leftIcon={<ApplyIcon />}
              altText={APPLY_LABEL}
              onClick={onApply}
            />
          </Tooltip>
          <Tooltip
            content={OPTIONS.find((option) => option.value === value)?.description}
            side="left"
            controlledState={keepExplanationOpen ? [true, () => {}] : undefined}
          >
            <span data-testid="rung-wrapper" className="inline-flex w-32">
              <Select
                size={Size.Sm}
                value={value}
                onChange={setValue}
                options={OPTIONS}
                label="Role for members"
                variant={Variant.Default}
                visuals="both"
              />
            </span>
          </Tooltip>
        </span>
      </div>
    </div>
  );
}

async function selectNoAccess() {
  const trigger = page.getByRole("button", { name: "Role for members: Editor", exact: true });
  await trigger.click();
  await page.getByRole("menuitemradio", { name: "No access", exact: true }).click();
  const selected = page.getByRole("button", { name: "Role for members: No access", exact: true });
  await expect.element(selected).toHaveTextContent("No access");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await expect.element(selected).toHaveFocus();
}

for (const priorFocus of ["pointer", "keyboard"] as const) {
  test(`${priorFocus} focus: selecting No access leaves the adjacent Apply action clickable`, async () => {
    const onApply = vi.fn();
    await render(<Harness onApply={onApply} />);
    await page.getByRole("button", { name: "Outside the row", exact: true }).click();
    // A dialog can start with keyboard-visible focus. Dropdown prevents its
    // opening pointerdown from focusing the trigger and restores focus on close.
    if (priorFocus === "keyboard") {
      await userEvent.keyboard("{Tab}");
      await expect
        .element(page.getByRole("button", { name: APPLY_LABEL, exact: true }))
        .toHaveFocus();
    }
    await selectNoAccess();
    await page.getByRole("button", { name: APPLY_LABEL, exact: true }).click({ timeout: 2000 });
    expect(onApply).toHaveBeenCalledOnce();
  });
}

test("the selected rung's left explanation cannot trap a click on the adjacent Apply action", async () => {
  const onApply = vi.fn();
  await render(<Harness onApply={onApply} />);
  await page.getByRole("button", { name: "Outside the row", exact: true }).click();
  await selectNoAccess();

  // Real hover reproduces the open explanation even when a browser does not
  // reopen it on menu dismissal. Keep the pointer on the rung until the click.
  const wrapper = page.getByTestId("rung-wrapper");
  await wrapper.hover();
  await expect
    .poll(() => wrapper.element().getAttribute("data-state"))
    .toMatch(/^(instant|delayed)-open$/);
  const explanation = document.querySelector<HTMLElement>(".tooltip-content[data-side='left']");
  expect(explanation?.textContent).toContain(NO_ACCESS_DESCRIPTION);
  const apply = page.getByRole("button", { name: APPLY_LABEL, exact: true });
  const buttonRect = apply.element().getBoundingClientRect();
  const explanationRect = explanation!.getBoundingClientRect();
  const centerX = buttonRect.x + buttonRect.width / 2;
  const centerY = buttonRect.y + buttonRect.height / 2;
  // Verify the layout really places the click target under the explanation.
  // A flipped tooltip or a wider text button would hide this regression.
  expect(centerX).toBeGreaterThan(explanationRect.left);
  expect(centerX).toBeLessThan(explanationRect.right);
  expect(centerY).toBeGreaterThan(explanationRect.top);
  expect(centerY).toBeLessThan(explanationRect.bottom);

  await apply.click({ timeout: 2000 });
  expect(onApply).toHaveBeenCalledOnce();
  await expect.element(wrapper).toHaveAttribute("data-state", "closed");
});

test("leaving the rung closes its explanation while hover and keyboard focus still explain it", async () => {
  await render(<Harness onApply={() => {}} />);
  const outside = page.getByRole("button", { name: "Outside the row", exact: true });
  await outside.click();
  await selectNoAccess();
  const wrapper = page.getByTestId("rung-wrapper");
  await wrapper.hover();
  await expect
    .poll(() => wrapper.element().getAttribute("data-state"))
    .toMatch(/^(instant|delayed)-open$/);
  await outside.hover();
  await expect.element(wrapper).toHaveAttribute("data-state", "closed");
  await outside.click();
  await userEvent.keyboard("{Tab}{Tab}");
  await expect
    .element(page.getByRole("button", { name: "Role for members: No access", exact: true }))
    .toHaveFocus();
  await expect.element(wrapper).toHaveAttribute("data-state", "instant-open");
  expect(document.querySelector(".tooltip-content[data-side='left']")?.textContent).toContain(
    NO_ACCESS_DESCRIPTION,
  );
});

test("a controlled open explanation lets a real click reach the adjacent action through Radix's positioner", async () => {
  const onApply = vi.fn();
  await render(<Harness onApply={onApply} keepExplanationOpen />);
  await page.getByRole("button", { name: "Outside the row", exact: true }).click();
  await selectNoAccess();
  const wrapper = page.getByTestId("rung-wrapper");
  await expect
    .poll(() => wrapper.element().getAttribute("data-state"))
    .toMatch(/^(instant|delayed)-open$/);
  // The host keeps the explanation open through pointer leave and blur. This
  // checks pass-through independently of closing the tooltip on trigger leave.
  await page.getByRole("button", { name: APPLY_LABEL, exact: true }).click({ timeout: 2000 });
  expect(onApply).toHaveBeenCalledOnce();
  await expect
    .poll(() => wrapper.element().getAttribute("data-state"))
    .toMatch(/^(instant|delayed)-open$/);
});
