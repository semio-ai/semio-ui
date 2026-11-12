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
    .sort((a, b) => (a.tabIndex || Infinity) - (b.tabIndex || Infinity));
}
