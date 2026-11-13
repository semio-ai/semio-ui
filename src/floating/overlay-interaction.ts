import { useEffect, useRef } from "react";

// Weak keys retain the mark for every layer handling the native event without cleanup.
const consumedEscapes = new WeakSet<Event>();

export function consumeTooltipEscape(event: Event) {
  consumedEscapes.add(event);
  // Escape still reaches the focused element, but only the explanation dismisses.
  event.preventDefault();
}

export function isEscapeConsumedByTooltip(event: Event) {
  return consumedEscapes.has(event);
}

// Notification listeners can register before an explanation opens. Whichever
// capture listener runs first must give that explanation the Escape.
//
// Every open tooltip stays registered, newest last. Opening one asks the others to
// close, but a controlled tooltip can refuse (`Snippet` holds "Copied!" open), so
// two can be open at once, and the older one must keep its Escape when the newer
// one closes first.
const tooltipEscapeHandlers = new WeakMap<Document, { close: () => void }[]>();

function closeTooltipForEscape(doc: Document, event: KeyboardEvent) {
  if (event.key !== "Escape") return false;
  if (isEscapeConsumedByTooltip(event)) return true;
  const newest = tooltipEscapeHandlers.get(doc)?.at(-1);
  if (!newest) return false;
  consumeTooltipEscape(event);
  newest.close();
  return true;
}

export function registerTooltipEscape(doc: Document, close: () => void) {
  const registration = { close };
  const registrations = tooltipEscapeHandlers.get(doc) ?? [];
  registrations.push(registration);
  tooltipEscapeHandlers.set(doc, registrations);
  const onEscape = (event: KeyboardEvent) => closeTooltipForEscape(doc, event);
  doc.addEventListener("keydown", onEscape, true);
  return () => {
    registrations.splice(registrations.indexOf(registration), 1);
    doc.removeEventListener("keydown", onEscape, true);
  };
}

interface DismissDetails {
  reason: string;
  event: Event;
  cancel: () => void;
}

/** Every surface below an explanation leaves its consumed Escape to that explanation. */
export function preserveTooltipEscape(details: DismissDetails) {
  if (details.reason !== "escape-key" || !isEscapeConsumedByTooltip(details.event)) return false;
  details.cancel();
  return true;
}

/** Presses and focus moves into notifications stay inside an overlay's dismissal boundary. */
export function preserveNotificationInteraction(details: DismissDetails, menu = false) {
  const target =
    details.reason === "focus-out" && details.event instanceof FocusEvent
      ? details.event.relatedTarget
      : details.event.target;
  if (
    (details.reason === "outside-press" || details.reason === "focus-out") &&
    target instanceof Element &&
    target.closest("[data-notifications-region]") &&
    // Opening a toast's ActionMenu dismisses another menu so only one menu stays open.
    !(menu && target.closest('[aria-haspopup="menu"]'))
  ) {
    details.cancel();
    return true;
  }
  return false;
}

// Overlays open with this hook, newest last. Capture listeners on one target run in the
// order they were added, so the outermost overlay's runs first; only the newest acts, so
// one Escape closes the topmost overlay rather than the one beneath it.
const notificationEscapeStack: object[] = [];

/** An open overlay receives Escape before a toast when focus is in notifications. */
export function useNotificationEscape(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const entry = {};
    notificationEscapeStack.push(entry);
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeTooltipForEscape(document, event)) return;
      if (
        notificationEscapeStack.at(-1) !== entry ||
        event.key !== "Escape" ||
        event.defaultPrevented ||
        !(event.target instanceof Element) ||
        !event.target.closest("[data-notifications-region]") ||
        event.target.closest('[role="menu"]')
      )
        return;
      event.preventDefault();
      event.stopPropagation();
      closeRef.current();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      notificationEscapeStack.splice(notificationEscapeStack.indexOf(entry), 1);
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [open]);
}
