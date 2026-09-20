import { Provider } from "jotai";
import type { ReactNode } from "react";

/**
 * Scopes this package's own state — the pane registry among it — to one subtree.
 *
 * Without it the atoms resolve to jotai's module-global default store: one store
 * per imported module, shared by every tree that reads it and outliving all of
 * them. A single app on a single page cannot tell the difference. A test runner
 * that mounts the app once per test can, because panes one mount registered are
 * still registered when the next one starts, and a layout restored from them is a
 * layout nobody asked for — a detail pane already open, so the header stops
 * rendering the control that opens it.
 *
 * So the store belongs to the mount. Render this once at the root, above anything
 * that reads a layout hook, and everything below starts empty and is discarded with
 * the tree. Two of these in one app is two disagreeing layouts — a header reading
 * one store while the panes are registered in the other — so it goes at the root
 * and nowhere else.
 */
export function UiStoreProvider({ children }: { children: ReactNode }) {
  // No `store` prop: jotai's `Provider` creates one per mounted instance, which is
  // the lifetime this component exists to promise. Taking one from the caller would
  // let two mounts share a store again, which is the thing being removed.
  return <Provider>{children}</Provider>;
}
