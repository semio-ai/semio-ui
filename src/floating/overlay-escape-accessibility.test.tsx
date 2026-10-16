// @vitest-environment jsdom
import { StrictMode, useState } from "react";
import { createStore, Provider } from "jotai";
import {
  act,
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { Combobox } from "../inputs/combobox";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { useLeftExpanded } from "../hooks/layout-atoms";
import { PaneRegion } from "../types";
import { NestedItem } from "../nested-elements/item";
import { Modal } from "./modal";
import { Dropdown } from "./dropdown";

function EscapeFixture() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button">Scene row</button>
      <Dropdown trigger={<button type="button">Open menu</button>}>
        <NestedItem onClick={() => setOpen(true)}>New entity</NestedItem>
      </Dropdown>
      <Modal
        open={open}
        title="Add Entity"
        submitDisabled
        onSubmit={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        onStateChange={setOpen}
      >
        {open && (
          <Combobox
            value={null}
            onChange={() => {}}
            options={[{ label: "Model", value: "model" }]}
          />
        )}
      </Modal>
    </>
  );
}

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
    configurable: true,
    value() {},
  });
  Object.defineProperty(HTMLElement.prototype, "getAnimations", {
    configurable: true,
    value: () => [],
  });
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  delete (HTMLElement.prototype as Partial<HTMLElement>).getAnimations;
});

test("Escape closes a combobox then its dialog and restores the accessible app", async () => {
  const { container } = render(
    <StrictMode>
      <EscapeFixture />
    </StrictMode>,
  );
  fireEvent.keyDown(screen.getByRole("button", { name: "Open menu" }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("menuitem", { name: "New entity" }));
  await screen.findByRole("dialog", { name: "Add Entity" });
  fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
  await screen.findByRole("option", { name: "Model" });
  const input = screen.getByRole("combobox");
  input.focus();
  fireEvent.keyDown(input, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("listbox", { hidden: true })).toBeNull());
  expect(screen.getByRole("dialog", { name: "Add Entity" })).toBeTruthy();
  fireEvent.keyDown(document.activeElement!, { key: "Escape" });
  await waitFor(() => expect(screen.queryByRole("dialog", { hidden: true })).toBeNull());
  await waitFor(() => expect(container.getAttribute("aria-hidden")).toBeNull());
  expect(container.closest("[inert]")).toBeNull();
  expect(screen.getByRole("button", { name: "Scene row" })).toBeTruthy();
});

test("switching from expanded Assets to Scene and back requires expanding Assets again", () => {
  const store = createStore();
  const { result } = renderHook(
    () => ({
      actions: useLayoutActions(),
      expanded: useLeftExpanded(),
    }),
    { wrapper: ({ children }) => <Provider store={store}>{children}</Provider> },
  );
  act(() =>
    result.current.actions.setPanes(
      [
        { id: "assets", region: PaneRegion.Left, expanded: true, content: <p>Assets</p> },
        { id: "scene", content: <p>Scene</p> },
      ],
      true,
    ),
  );
  expect(result.current.expanded).toBe(true);
  act(() => result.current.actions.togglePaneRegion(PaneRegion.Left, "scene"));
  expect(result.current.expanded).toBe(false);
  act(() => result.current.actions.togglePaneRegion(PaneRegion.Left, "assets"));
  expect(result.current.expanded).toBe(false);
  act(() => result.current.actions.setPane({ id: "assets", expanded: true }));
  expect(result.current.expanded).toBe(true);
});
