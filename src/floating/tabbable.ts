const FOCUSABLE =
  "a[href], area[href], button, input, select, textarea, iframe, object, embed, audio[controls], video[controls], summary, [contenteditable], [tabindex]";

/** Roving items, disabled controls and unrendered elements do not take a Tab stop. */
export function isTabbable(element: HTMLElement) {
  const style = getComputedStyle(element);
  return (
    element.tabIndex >= 0 &&
    !element.matches(":disabled") &&
    !element.closest("[inert]") &&
    element.getClientRects().length > 0 &&
    style.visibility !== "hidden" &&
    style.visibility !== "collapse"
  );
}

export function getTabbableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE))
    .filter(isTabbable)
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}
