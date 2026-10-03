import { useEffect } from "react";
import { getDefaultStore } from "jotai";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page, userEvent } from "vitest/browser";
import { PaneRegion } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { panesAtom, usePanes } from "../../hooks/layout-atoms";
import { Icon } from "../../icons/registry";
import { LayoutRoot } from "./root";

/**
 * `setPanes` changing several panes at once, and every change landing.
 *
 * Pins the CONTRACT, not a past bug. The previous per-item implementation passes
 * this test too — it was checked by running it against that implementation, and
 * the batch did land in full, because each write still resolved against the
 * atom's current value. What it did not do was express the batch as one write,
 * and it computed every item from a ref mirroring the atom through a
 * subscription; the studio's `use-selection-pane` documents where that shape does
 * go wrong.
 *
 * So this guards the property the expanding sidebar depends on: expanding one
 * pane while collapsing two others is a single intent, and it must not be
 * possible for a third of it to happen. Three panes rather than two, so a partial
 * write cannot coincidentally satisfy the assertion.
 */

const DESKTOP = { width: 1024, height: 800 } as const;

const paneIcon = <Icon name="action-placeholder" />;

function state(): string {
  const read = (id: string): string => {
    const element = document.querySelector<HTMLElement>(`[data-testid='flags-${id}']`);
    return element?.dataset.flag ?? "?";
  };
  return `${read("left")}/${read("right")}/${read("footer")}`;
}

function PaneHarness() {
  const { setPanes } = useLayoutActions();
  const panes = usePanes();
  const wide = panes.find((pane) => pane.id === "left")?.expanded === true;

  useEffect(() => {
    setPanes(
      [
        {
          id: "left",
          name: "Left",
          icon: paneIcon,
          size: "240px",
          region: PaneRegion.Left,
          inLeftMenu: true,
          inRightMenu: false,
          content: <p>Left body</p>,
        },
        {
          id: "right",
          name: "Right",
          icon: paneIcon,
          size: "200px",
          region: PaneRegion.Right,
          inLeftMenu: false,
          inRightMenu: true,
          content: <p>Right body</p>,
        },
        {
          id: "footer",
          name: "Footer",
          icon: paneIcon,
          size: "auto",
          region: PaneRegion.Footer,
          inLeftMenu: false,
          inRightMenu: false,
          content: <p>Footer body</p>,
        },
      ],
      true,
    );
  }, [setPanes]);

  return (
    <div className="fixed top-0 left-0 z-50 flex gap-2">
      <button
        type="button"
        onClick={() => {
          setPanes([
            { id: "left", expanded: !wide },
            { id: "right", collapsed: !wide },
            { id: "footer", collapsed: !wide },
          ]);
        }}
      >
        rearrange
      </button>
      {panes.map((pane) => (
        <span
          key={pane.id}
          data-testid={`flags-${pane.id}`}
          data-flag={`${String(pane.expanded === true)}:${String(pane.collapsed === true)}`}
        />
      ))}
    </div>
  );
}

test("one setPanes call applies every update in the batch", async () => {
  await page.viewport(DESKTOP.width, DESKTOP.height);
  await render(
    <>
      <PaneHarness />
      <LayoutRoot />
    </>,
  );

  // `expanded:collapsed` per pane, in registration order.
  await expect.poll(state).toBe("false:false/false:false/false:false");

  // Counted, because the final values alone cannot tell one write from three: the
  // previous per-item implementation reaches the same end state, so a regression
  // back to it would leave every value assertion green. The subscription is the only
  // thing here that can see the difference.
  let writes = 0;
  const unsubscribe = getDefaultStore().sub(panesAtom, () => {
    writes += 1;
  });

  await userEvent.click(page.getByRole("button", { name: "rearrange" }));
  // All three, from one call. A write that resolved any item against a snapshot
  // taken before the batch would drop the earlier ones and read
  // `false:false/false:false/false:true` here.
  await expect.poll(state).toBe("true:false/false:true/false:true");
  unsubscribe();
  expect(writes).toBe(1);

  // And back, so the batch is not passing on a one-way default.
  await userEvent.click(page.getByRole("button", { name: "rearrange" }));
  await expect.poll(state).toBe("false:false/false:false/false:false");
});
