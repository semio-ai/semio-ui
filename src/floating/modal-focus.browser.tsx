import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "../buttons/button";
import "../test-stylesheet";
import { Modal } from "./modal";

test("a modal initially focuses the rightmost action in a custom footer", async () => {
  await render(
    <Modal
      open
      title="Ready"
      onStateChange={() => {}}
      footer={
        <>
          <Button>Account settings</Button>
          <Button>Go to Home</Button>
        </>
      }
    >
      <input aria-label="Other control" />
    </Modal>,
  );

  await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Go to Home");
});

test("a modal initially focuses its rightmost standard footer action", async () => {
  await render(
    <Modal
      open
      title="Edit"
      onStateChange={() => {}}
      onCancel={() => {}}
      onSubmit={() => {}}
      submitText="Save"
    >
      <input aria-label="Other control" />
    </Modal>,
  );

  await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Save");
});

test("a disabled footer action does not receive initial focus", async () => {
  await render(
    <Modal
      open
      title="Waiting"
      onStateChange={() => {}}
      footer={
        <>
          <Button>Cancel</Button>
          <Button disabled>Continue</Button>
        </>
      }
    >
      <input aria-label="Other control" />
    </Modal>,
  );

  await expect.poll(() => document.activeElement?.textContent?.trim()).toBe("Cancel");
});
