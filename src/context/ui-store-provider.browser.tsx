import { useEffect } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PaneRegion } from "../types";
import { useActionItems, useMenuState, usePanes } from "../hooks/layout-atoms";
import { useLayoutActions } from "../hooks/use-layout-actions";
import { UiStoreProvider } from "./ui-store-provider";

/**
 * What a scoped store has to keep true.
 *
 * Two claims, and the second is the one that is easy to get wrong. Scoping the
 * atoms is only half of it: every path that reads them has to read the SAME store,
 * and the ones that do not go through a hook — the `observe` subscriptions
 * `useLayoutActions` mirrors into refs — take the store they are handed and
 * silently fall back to jotai's module-global default. Under a provider that
 * fallback is a store nothing writes to, so the mirrors sit at their initial values
 * and every action folding an update into one loses whatever is really registered.
 * It is invisible from the outside, which is why it is asserted here.
 */

function PaneProbe({ paneId }: { paneId: string }) {
  const { setPane } = useLayoutActions();
  const panes = usePanes();
  useEffect(() => {
    setPane({ id: paneId, region: PaneRegion.Right });
  }, [paneId, setPane]);
  return <div data-testid={`panes-${paneId}`}>{panes.map((pane) => pane.id).join(",")}</div>;
}

test("two providers register panes in stores that cannot see each other", async () => {
  await render(
    <>
      <UiStoreProvider>
        <PaneProbe paneId="alpha" />
      </UiStoreProvider>
      <UiStoreProvider>
        <PaneProbe paneId="beta" />
      </UiStoreProvider>
    </>,
  );

  // Each subtree sees its own pane and only its own. Asserting both directions
  // matters: one probe rendering nothing would satisfy "does not contain the
  // other" on its own, and prove only that it never registered anything.
  await expect.element(page.getByTestId("panes-alpha")).toHaveTextContent("alpha");
  await expect.element(page.getByTestId("panes-beta")).toHaveTextContent("beta");
  expect(page.getByTestId("panes-alpha").element().textContent).not.toContain("beta");
  expect(page.getByTestId("panes-beta").element().textContent).not.toContain("alpha");
});

function MenuProbe() {
  const { toggleMenu } = useLayoutActions();
  const expanded = useMenuState();
  return (
    <button type="button" onClick={toggleMenu}>
      {expanded ? "expanded" : "collapsed"}
    </button>
  );
}

test("the menu toggle reads back what it wrote", async () => {
  await render(
    <UiStoreProvider>
      <MenuProbe />
    </UiStoreProvider>,
  );

  await page.getByRole("button", { name: "expanded" }).click();
  // The second press is the assertion. `toggleMenu` writes the NEGATION of a
  // mirrored value, so a mirror pointing at another store re-writes the same
  // answer forever and the menu can be collapsed but never re-expanded.
  await page.getByRole("button", { name: "collapsed" }).click();
  await expect.element(page.getByRole("button", { name: "expanded" })).toBeVisible();
});

function ActionItemsProbe() {
  const { setActionItems } = useLayoutActions();
  const items = useActionItems();
  useEffect(() => {
    // No `replace`, which is the merging path: each item is folded into what is
    // already registered, read through the mirror rather than from the atom.
    setActionItems([
      { id: "first", label: "First", children: [] },
      { id: "second", label: "Second", children: [] },
    ]);
  }, [setActionItems]);
  return <div data-testid="action-items">{items.map((item) => item.id).join(",")}</div>;
}

test("a merged registration keeps every item, not just the last", async () => {
  await render(
    <UiStoreProvider>
      <ActionItemsProbe />
    </UiStoreProvider>,
  );

  await expect.element(page.getByTestId("action-items")).toHaveTextContent("first,second");
});
