import type { ToastState } from "./toast";

// Lets tests observe the manager's per-id state; this module is not part of the package's API.
const retainedStateForTests = new WeakMap<
  ToastState,
  () => { generations: number; positions: number }
>();

export function registerToastRetainedState(
  state: ToastState,
  readState: () => { generations: number; positions: number },
) {
  retainedStateForTests.set(state, readState);
}

export function __getToastRetainedMetadataForTests(state: ToastState) {
  return retainedStateForTests.get(state)?.();
}
