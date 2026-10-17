// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { BreadcrumbTrail } from "./breadcrumb-trail";

afterEach(cleanup);

test("a current crumb without a switcher supports rename with a sized field and focus restoration", async () => {
  const rename = vi.fn();
  render(
    <BreadcrumbTrail
      items={[{ id: "project", label: "Project A", labelWidth: 160, onRename: rename }]}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Rename Project A" });
  expect(trigger.textContent).toBe("Project A");
  const width = getComputedStyle(trigger).width;
  expect(width).toBe("160px");
  trigger.focus();
  fireEvent.keyDown(trigger, { key: "F2" });
  const field = screen.getByRole("textbox", { name: "Rename Project A" }) as HTMLInputElement;
  await waitFor(() => expect(document.activeElement).toBe(field));
  expect(getComputedStyle(field).width).toBe(width);
  expect(getComputedStyle(field).minWidth).toBe("160px");
  expect(field.selectionStart).toBe(0);
  expect(field.selectionEnd).toBe("Project A".length);
  fireEvent.change(field, { target: { value: "  Keyboard rename  " } });
  fireEvent.keyDown(field, { key: "Enter" });
  expect(rename).toHaveBeenCalledExactlyOnceWith("Keyboard rename");
  const restored = screen.getByRole("button", { name: "Rename Project A" });
  await waitFor(() => expect(document.activeElement).toBe(restored));
  fireEvent.click(restored);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Discard this" } });
  fireEvent.keyDown(screen.getByRole("textbox"), { key: "Escape" });
  expect(rename).toHaveBeenCalledOnce();
  await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("button")));
  fireEvent.doubleClick(screen.getByRole("button"));
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Blur rename" } });
  fireEvent.blur(screen.getByRole("textbox"));
  expect(rename).toHaveBeenLastCalledWith("Blur rename");
  expect(rename).toHaveBeenCalledTimes(2);
});

test.each([false, true])(
  "an editable split switcher keeps its visible label and reserved width while renaming (search: %s)",
  async (searchable) => {
    const rename = vi.fn();
    render(
      <BreadcrumbTrail
        items={[
          {
            id: "project",
            label: "Project A",
            labelWidth: 112,
            onRename: rename,
            switcher: {
              label: "Switch Project",
              value: "a",
              options: [{ value: "a", label: "Project A" }],
              searchable,
              onSelect: vi.fn(),
            },
          },
        ]}
      />,
    );
    const label = screen.getByRole("button", { name: "Switch Project: Project A" });
    expect(label.textContent).toBe("Project A");
    const width = getComputedStyle(label).width;
    expect(width).toBe("112px");
    expect(screen.getByRole("combobox", { name: "Switch Project menu" })).toBeTruthy();
    label.focus();
    fireEvent.keyDown(label, { key: "F2" });
    const field = screen.getByRole("textbox", { name: "Rename Project A" });
    await waitFor(() => expect(document.activeElement).toBe(field));
    expect(getComputedStyle(field).width).toBe(width);
    expect(getComputedStyle(field).minWidth).toBe(width);
    fireEvent.change(field, { target: { value: "A much longer project name" } });
    expect(getComputedStyle(field).width).toBe(width);
    fireEvent.keyDown(field, { key: "Enter" });
    expect(rename).toHaveBeenCalledExactlyOnceWith("A much longer project name");
    await waitFor(() =>
      expect(document.activeElement).toBe(
        screen.getByRole("button", { name: "Switch Project: Project A" }),
      ),
    );
  },
);
