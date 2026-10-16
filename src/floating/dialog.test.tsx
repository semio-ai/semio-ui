// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Dialog } from "./dialog";

afterEach(cleanup);

it("closeOnCancelClick controls cancellation dismissal and defaults to closing", () => {
  for (const closeOnCancelClick of [undefined, true, false]) {
    const cancel = vi.fn();
    function Example() {
      const [open, setOpen] = useState(true);
      return (
        <Dialog
          open={open}
          title="Invitation"
          onStateChange={setOpen}
          onCancel={cancel}
          cancelText="Decline"
          closeOnCancelClick={closeOnCancelClick}
        />
      );
    }
    const view = render(<Example />);
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getAllByRole("button", { name: "Decline" }).at(-1)!);
    expect(cancel).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alertdialog") !== null).toBe(closeOnCancelClick === false);
    view.unmount();
  }
});

it("locks footer actions, X, Escape and overlay dismissal during an action", () => {
  const change = vi.fn();
  const cancel = vi.fn();
  const submit = vi.fn();
  render(
    <Dialog
      open
      title="Working"
      onStateChange={change}
      onCancel={cancel}
      onSubmit={submit}
      cancelDisabled
      submitDisabled
      dismissDisabled
      closeOnSubmitClick={false}
    />,
  );
  const dialog = screen.getByRole("alertdialog");
  for (const button of within(dialog).getAllByRole("button")) {
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
  }
  fireEvent.keyDown(dialog, { key: "Escape" });
  fireEvent.click(dialog.parentElement!);
  expect(change).not.toHaveBeenCalled();
  expect(cancel).not.toHaveBeenCalled();
  expect(submit).not.toHaveBeenCalled();
});

it("overlay dismissal is opt-in", () => {
  const change = vi.fn();
  const view = render(<Dialog open title="Invitation" onStateChange={change} />);
  fireEvent.click(screen.getByRole("alertdialog").parentElement!);
  expect(change).not.toHaveBeenCalled();
  view.rerender(<Dialog open title="Invitation" onStateChange={change} closeOnOverlayClick />);
  fireEvent.click(screen.getByRole("alertdialog").parentElement!);
  expect(change).toHaveBeenCalledExactlyOnceWith(false);
});
