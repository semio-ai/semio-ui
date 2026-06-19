/**
 * Coordinator that ensures only one Dropdown is open at a time.
 *
 * Radix's `DropdownMenu.Root` does not coordinate across sibling Roots:
 * clicking the trigger of dropdown B while dropdown A is open leaves
 * both open. The `DismissableLayer` that normally handles "pointerdown
 * outside" appears to lose this race when the outside target is itself
 * another `DropdownMenu.Trigger` — Radix's trigger handlers consume the
 * event before it reaches A's document listener.
 *
 * This singleton serializes opens: when any Dropdown transitions to its
 * open state, it takes the lock and any previously-locked Dropdown is
 * asked to close itself. Module-scoped so coordination works across
 * provider boundaries (the three key-toolbar dropdowns share no parent
 * provider beyond the toolbar div).
 *
 * Only one slot exists — this isn't a stack. Nested dropdowns aren't a
 * pattern in this codebase; if they ever become one, a stack-based
 * variant would replace this.
 */
let currentClose: (() => void) | null = null;

/**
 * Claim the open lock. If another Dropdown currently holds it, that
 * Dropdown's `close` callback is invoked synchronously before this one
 * takes the slot.
 */
export function takeDropdownOpenLock(close: () => void): void {
  if (currentClose && currentClose !== close) {
    const previous = currentClose;
    currentClose = close;
    previous();
    return;
  }
  currentClose = close;
}

/** Release the open lock if (and only if) this Dropdown holds it. */
export function releaseDropdownOpenLock(close: () => void): void {
  if (currentClose === close) {
    currentClose = null;
  }
}
