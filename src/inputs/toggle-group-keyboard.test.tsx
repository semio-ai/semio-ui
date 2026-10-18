// @vitest-environment jsdom
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ToggleGroup } from "./toggle-group";

beforeEach(() => {
  vi.stubGlobal("CSS", { escape: (value: string) => value });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const options = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "d", label: "Delta" },
];

test("vertical and page keys skip disabled items and synchronize composite focus", async () => {
  const view = render(
    <ToggleGroup visuals="labels" value="d" onChange={() => {}} options={options} />,
  );
  const alpha = view.getByRole("radio", { name: "Alpha" });
  const delta = view.getByRole("radio", { name: "Delta" });
  act(() => delta.focus());
  for (const [key, target] of [
    ["ArrowDown", alpha],
    ["ArrowUp", delta],
    ["PageDown", delta],
    ["PageUp", alpha],
    ["PageDown", delta],
    ["PageUp", alpha],
  ] as const) {
    fireEvent.keyDown(document.activeElement!, { key });
    expect(document.activeElement).toBe(target);
    expect(target.tabIndex).toBe(0);
  }
  fireEvent.keyDown(alpha, { key: "ArrowRight" });
  await act(async () => {});
  expect(document.activeElement).toBe(delta);
});

test("forward entry prefers an externally selected item and backward entry keeps the last focus", () => {
  const group = (value: string) => (
    <>
      <button type="button">Before</button>
      <ToggleGroup visuals="labels" value={value} onChange={() => {}} options={options} />
      <button type="button">After</button>
    </>
  );
  const view = render(group("a"));
  const alpha = view.getByRole("radio", { name: "Alpha" });
  const delta = view.getByRole("radio", { name: "Delta" });
  act(() => alpha.focus());
  act(() => view.getByRole("button", { name: "After" }).focus());
  view.rerender(group("d"));
  fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
  act(() => alpha.focus());
  expect(document.activeElement).toBe(alpha);
  act(() => view.getByRole("button", { name: "Before" }).focus());
  fireEvent.keyDown(document.activeElement!, { key: "Tab" });
  act(() => alpha.focus());
  expect(document.activeElement).toBe(delta);
  expect(delta.tabIndex).toBe(0);
  expect(fireEvent.keyDown(delta, { key: "Tab", shiftKey: true })).toBe(true);
});
