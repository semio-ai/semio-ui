import { useEffect } from "react";
import { flushSync } from "react-dom";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { useAddToast } from "../hooks/use-add-toast";
import { ToastManager } from "./toast";
import { Dialog } from "./dialog";
import { Modal } from "./modal";

const announcementSelector = 'body > [role="status"][aria-live="assertive"][aria-atomic="true"]';

function AddToast() {
  const add = useAddToast();
  useEffect(() => {
    add({
      id: "announcement",
      title: "Asset published",
      content: "Available to everyone",
      // A numeric dismiss is the timeout. The toast removes its announcer with it, and
      // an action toast lives four real seconds, which a loaded run can outlast.
      dismiss: 60000,
    });
  }, [add]);
  return null;
}

/**
 * Resolves once the announcer carries `text`, waiting on real timers. `expect.poll` and
 * `expect.element` advance fake timers by their interval on every retry, so a wait that
 * retries would move the announcer's one-second removal closer by however many retries
 * a slow frame costs.
 */
async function announcedText(text: string, wait: typeof setTimeout) {
  const deadline = performance.now() + 5000;
  while (document.querySelector(announcementSelector)?.textContent !== text) {
    if (performance.now() > deadline) {
      throw new Error(`The announcer never carried ${JSON.stringify(text)}.`);
    }
    await new Promise((resolve) => wait(resolve, 10));
  }
  return document.querySelector<HTMLElement>(announcementSelector)!;
}

test("the Radix status announcement renders after two frames and expires at 1000 ms", async () => {
  const realSetTimeout = window.setTimeout.bind(window) as typeof setTimeout;
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  try {
    await render(
      <ToastManager>
        <AddToast />
      </ToastManager>,
    );
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const announcement = await announcedText(
      "Notification Asset publishedAvailable to everyone",
      realSetTimeout,
    );
    expect(announcement.tagName).toBe("SPAN");
    expect(announcement.parentElement).toBe(document.body);
    expect(announcement.getAttribute("aria-live")).toBe("assertive");
    expect(announcement.getAttribute("aria-atomic")).toBe("true");
    expect(announcement.textContent).toBe("Notification Asset publishedAvailable to everyone");
    expect(document.querySelector('[role="alert"]')).toBeNull();
    expect(document.querySelector('li.card-overlay [role="status"]')?.textContent).toBe("");

    // The announcement is present until 1000 ms and gone at that mark,
    // whichever element carries it.
    flushSync(() => vi.advanceTimersByTime(999));
    expect(document.querySelector(announcementSelector)?.textContent).toBe(
      "Notification Asset publishedAvailable to everyone",
    );
    flushSync(() => vi.advanceTimersByTime(1));
    expect(document.querySelector(announcementSelector)).toBeNull();
    expect(page.getByText("Asset published").elements()).toHaveLength(1);
  } finally {
    vi.useRealTimers();
  }
});

enum Overlay {
  Confirmation = "Dialog",
  Editor = "Modal",
}

test.each(Object.values(Overlay))(
  "toast announcements stay exposed while a %s is already open",
  async (overlay) => {
    const dialog =
      overlay === Overlay.Confirmation ? (
        <Dialog open title="Confirmation" onStateChange={() => {}} />
      ) : (
        <Modal open title="Editor" onStateChange={() => {}}>
          <p>Editor content</p>
        </Modal>
      );
    const view = await render(<ToastManager>{dialog}</ToastManager>);
    await expect
      .element(page.getByRole(overlay === Overlay.Confirmation ? "alertdialog" : "dialog"))
      .toBeVisible();
    await view.rerender(
      <ToastManager>
        {dialog}
        <AddToast />
      </ToastManager>,
    );

    const announcement = page.elementLocator(document.querySelector(announcementSelector)!);
    await expect
      .element(announcement)
      .toHaveTextContent("Notification Asset publishedAvailable to everyone");
    expect(announcement.element().closest('[aria-hidden="true"], [inert]')).toBeNull();
    expect(announcement.element().parentElement).toBe(document.body);
  },
);
