// @vitest-environment jsdom
import { useState, type MouseEvent } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Dialog, type DialogProps } from "./dialog";

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

function Example(props: Partial<DialogProps>) {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      title="Invitation"
      {...props}
      open={open}
      onStateChange={(next) => {
        props.onStateChange?.(next);
        setOpen(next);
      }}
    />
  );
}

enum Action {
  Cancel = "Cancel",
  Submit = "Submit",
}

for (const action of Object.values(Action)) {
  const closingProp = action === Action.Cancel ? "closeOnCancelClick" : "closeOnSubmitClick";
  const handlerProp = action === Action.Cancel ? "onCancel" : "onSubmit";
  const disabledProp = action === Action.Cancel ? "cancelDisabled" : "submitDisabled";

  it.each([undefined, true, false])(
    `${action}: ${closingProp}=%s controls dismissal`,
    async (close) => {
      const handler = vi.fn();
      const change = vi.fn();
      render(
        <Example {...{ [closingProp]: close, [handlerProp]: handler }} onStateChange={change} />,
      );
      fireEvent.click(screen.getByRole("button", { name: action }));
      expect(handler).toHaveBeenCalledOnce();
      expect(change.mock.calls).toEqual(close === false ? [] : [[false]]);
      await waitFor(() => expect(screen.queryByRole("alertdialog") !== null).toBe(close === false));
    },
  );

  it(`${action}: dismissDisabled vetoes closing but still calls the action`, () => {
    const handler = vi.fn();
    const change = vi.fn();
    render(<Example {...{ [handlerProp]: handler }} onStateChange={change} dismissDisabled />);
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(handler).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it(`${action}: preventDefault in the action cancels dismissal`, () => {
    const handler = vi.fn((event: MouseEvent | KeyboardEvent) => event.preventDefault());
    const change = vi.fn();
    render(<Example {...{ [handlerProp]: handler }} onStateChange={change} />);
    fireEvent.click(screen.getByRole("button", { name: action }));
    expect(handler).toHaveBeenCalledOnce();
    expect(change).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });

  it(`${action}: its disabled prop blocks the action`, () => {
    const handler = vi.fn();
    const change = vi.fn();
    render(
      <Example {...{ [handlerProp]: handler, [disabledProp]: true }} onStateChange={change} />,
    );
    const button = screen.getByRole("button", { name: action }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(handler).not.toHaveBeenCalled();
    expect(change).not.toHaveBeenCalled();
  });
}

it.each([false, true])("Escape: dismissDisabled=%s guards the close request", async (disabled) => {
  const change = vi.fn();
  render(<Example onStateChange={change} dismissDisabled={disabled} />);
  fireEvent.keyDown(screen.getByRole("alertdialog"), { key: "Escape" });
  await waitFor(() => expect(change.mock.calls).toEqual(disabled ? [] : [[false]]));
  expect(screen.queryByRole("alertdialog") !== null).toBe(disabled);
});

it.each([false, true])("X: dismissDisabled=%s guards the close button", async (disabled) => {
  const change = vi.fn();
  const cancel = vi.fn();
  render(<Example onStateChange={change} dismissDisabled={disabled} onCancel={cancel} />);
  const close = screen.getByRole("button", { name: "Close" }) as HTMLButtonElement;
  expect(close.disabled).toBe(disabled);
  fireEvent.click(close);
  await waitFor(() => expect(change.mock.calls).toEqual(disabled ? [] : [[false]]));
  expect(screen.queryByRole("alertdialog") !== null).toBe(disabled);
  expect(cancel).not.toHaveBeenCalled();
});

it("overlay dismissal is opt-in and ignores clicks inside the surface", () => {
  const change = vi.fn();
  const view = render(<Dialog open title="Invitation" onStateChange={change} />);
  const popup = screen.getByRole("alertdialog");
  fireEvent.click(popup.parentElement!);
  expect(change).not.toHaveBeenCalled();
  view.rerender(<Dialog open title="Invitation" onStateChange={change} closeOnOverlayClick />);
  fireEvent.click(within(popup).getByRole("heading", { name: "Invitation" }));
  expect(change).not.toHaveBeenCalled();
  fireEvent.click(popup.parentElement!);
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});

it("dismissDisabled vetoes an opted-in overlay close request", () => {
  const change = vi.fn();
  render(
    <Dialog open title="Invitation" onStateChange={change} closeOnOverlayClick dismissDisabled />,
  );
  fireEvent.click(screen.getByRole("alertdialog").parentElement!);
  expect(change).not.toHaveBeenCalled();
  expect(screen.getByRole("alertdialog")).toBeTruthy();
});
