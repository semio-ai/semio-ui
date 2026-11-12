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
const tooltipEscapeHandlers = new WeakMap<Document, () => void>();

function closeTooltipForEscape(doc: Document, event: KeyboardEvent) {
  if (event.key !== "Escape") return false;
  if (isEscapeConsumedByTooltip(event)) return true;
  const close = tooltipEscapeHandlers.get(doc);
  if (!close) return false;
  consumeTooltipEscape(event);
  close();
  return true;
}

export function registerTooltipEscape(doc: Document, close: () => void) {
  tooltipEscapeHandlers.set(doc, close);
  const onEscape = (event: KeyboardEvent) => closeTooltipForEscape(doc, event);
  doc.addEventListener("keydown", onEscape, true);
  return () => {
    if (tooltipEscapeHandlers.get(doc) === close) tooltipEscapeHandlers.delete(doc);
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

/** An open overlay receives Escape before a toast when focus is in notifications. */
export function useNotificationEscape(open: boolean, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (closeTooltipForEscape(document, event)) return;
      if (
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
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [open]);
}
