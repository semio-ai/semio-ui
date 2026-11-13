import { useCallback, useState } from "react";
import { afterEach, expect, test, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { cleanup, render } from "vitest-browser-react";
import { NestedItem } from "../nested-elements/item";
import { Dropdown } from "./dropdown";
import "../test-stylesheet";

afterEach(cleanup);

function SearchDropdown({ onQuery }: { onQuery: (value: string) => void }) {
  const [query, setQuery] = useState("");
  const changeQuery = useCallback(
    (value: string) => {
      setQuery(value);
      onQuery(value);
    },
    [onQuery],
  );
  return (
    <Dropdown
      trigger={<button type="button">Choose project</button>}
      search={{ label: "Search projects", value: query, onValueChange: changeQuery }}
    >
      {["Project A", "Project B"]
        .filter((label) => label.toLowerCase().includes(query.trim().toLowerCase()))
        .map((label) => (
          <NestedItem key={label}>{label}</NestedItem>
        ))}
    </Dropdown>
  );
}

test("search filters consumer entries, keeps hover typing focus, navigates and resets on Escape", async () => {
  const onQuery = vi.fn();
  await render(<SearchDropdown onQuery={onQuery} />);
  const trigger = page.getByRole("button", { name: "Choose project", exact: true });
  await expect.element(trigger).toHaveAttribute("aria-haspopup", "dialog");
  await trigger.click();
  const search = page.getByRole("searchbox", { name: "Search projects", exact: true });
  await expect.element(search).toHaveFocus();
  await expect.element(search).toHaveAttribute("placeholder", "Search…");
  expect(page.getByRole("dialog").element().contains(page.getByRole("menu").element())).toBe(true);
  await search.fill("Project");
  const first = page.getByRole("menuitem", { name: "Project A", exact: true });
  await first.hover();
  await expect.element(first).toHaveAttribute("data-highlighted");
  await expect.element(search).toHaveFocus();
  await userEvent.keyboard(" B");
  await expect.element(search).toHaveValue("Project B");
  await expect.element(first).not.toBeInTheDocument();
  const match = page.getByRole("menuitem", { name: "Project B", exact: true });
  await expect.element(match).toBeVisible();
  await search.hover();
  await expect.element(match).not.toHaveAttribute("data-highlighted");
  await userEvent.keyboard("{ArrowDown}");
  await expect.element(match).toHaveAttribute("data-highlighted");
  await expect.element(search).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  await expect.element(page.getByRole("menu")).not.toBeInTheDocument();
  await expect.element(trigger).toHaveFocus();
  await expect.poll(() => onQuery.mock.calls.at(-1)).toEqual([""]);
  await trigger.click();
  await expect.element(search).toHaveValue("");
  expect(page.getByRole("menuitem").elements()).toHaveLength(2);
});

test("search keeps text-editing keys in the field", async () => {
  await render(<SearchDropdown onQuery={vi.fn()} />);
  await page.getByRole("button", { name: "Choose project", exact: true }).click();
  const search = page.getByRole("searchbox", { name: "Search projects", exact: true });
  await search.fill("Project");
  await userEvent.keyboard("{ArrowDown}");
  await expect
    .element(page.getByRole("menuitem", { name: "Project A", exact: true }))
    .toHaveAttribute("data-highlighted");
  // Home and End are left out: in a field inside a scrolling list, macOS scrolls the list
  // with them rather than moving the caret, so they edit only on other platforms.
  await userEvent.keyboard(
    `${"{ArrowLeft}".repeat(7)}X${"{ArrowRight}".repeat(7)} Y{ArrowLeft}{Backspace}{ArrowRight}Z`,
  );
  await expect.element(search).toHaveValue("XProjectYZ");
  await expect.element(search).toHaveFocus();
  // No entry matches the edited query, so the list is empty; the popup stays open.
  await expect.element(page.getByRole("dialog")).toBeVisible();
});
