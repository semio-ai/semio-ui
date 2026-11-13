const FOCUSABLE =
  "a[href], area[href], button, input, select, textarea, iframe, object, embed, audio[controls], video[controls], summary, [contenteditable], [tabindex]";

/**
 * The element's place in the tab order. An editing host with no `tabindex` (a
 * `contenteditable` element whose parent is not editable) is a Tab stop, yet its `tabIndex`
 * property reads -1, so it counts as 0. An editable element inside one is part of that host's
 * stop, not one of its own, and keeps -1.
 */
function tabOrder(element: HTMLElement) {
  if (
    !element.hasAttribute("tabindex") &&
    element.isContentEditable &&
    !element.parentElement?.isContentEditable
  )
    return 0;
  return element.tabIndex;
}

/** Roving items, disabled controls and unrendered elements do not take a Tab stop. */
export function isTabbable(element: HTMLElement) {
  const style = getComputedStyle(element);
  return (
    tabOrder(element) >= 0 &&
    !element.matches(":disabled") &&
    !element.closest("[inert]") &&
    element.getClientRects().length > 0 &&
    style.visibility !== "hidden" &&
    style.visibility !== "collapse"
  );
}

function isRadio(element: HTMLElement): element is HTMLInputElement {
  return element.tagName === "INPUT" && (element as HTMLInputElement).type === "radio";
}

/** A named radio group is one Tab stop: its checked radio, or its first when none is. */
function isRadioGroupStop(radio: HTMLInputElement, candidates: HTMLElement[]) {
  if (!radio.name) return true;
  const group = candidates.filter(
    (element): element is HTMLInputElement =>
      isRadio(element) && element.name === radio.name && element.form === radio.form,
  );
  return radio === (group.find((element) => element.checked) ?? group[0]);
}

export function getTabbableElements(container: HTMLElement) {
  const candidates = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    isTabbable,
  );
  return candidates
    .filter((element) => !isRadio(element) || isRadioGroupStop(element, candidates))
    .sort((a, b) => (tabOrder(a) || Infinity) - (tabOrder(b) || Infinity));
}
