import { useEffect, type ReactNode } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { PaneRegion, type PaneSpec } from "../../types";
import { useLayoutActions } from "../../hooks/use-layout-actions";
import { ScrollArea } from "../scroll-area";
import "../../test-stylesheet";
import { LayoutRoot } from "./root";

/** Exceeds the middle row's available height beside a 260px footer at 1100x620. */
const SIDE_HEIGHT = 480;

function Panes({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  const { setPanes } = useLayoutActions();
  useEffect(() => {
    const panes: PaneSpec[] = [
      {
        id: "tall-side",
        name: "Tall side",
        icon: "action-placeholder",
        size: "240px",
        region: PaneRegion.Left,
        inLeftMenu: false,
        inRightMenu: false,
        content: children,
      },
    ];
    if (footer) {
      panes.push({
        id: "footer",
        name: "Footer",
        icon: "action-placeholder",
        size: "auto",
        region: PaneRegion.Footer,
        inLeftMenu: false,
        inRightMenu: false,
        content: (
          <div aria-label="Fixed footer" style={{ height: 260 }}>
            Footer
          </div>
        ),
      });
    }
    setPanes(panes, true);
    return () => setPanes([], true);
  }, [children, footer, setPanes]);
  return null;
}

test("tall left content gives the footer its declared height inside the desktop layout", async () => {
  await page.viewport(1100, 620);
  const view = await render(
    <>
      <Panes>
        <div style={{ height: SIDE_HEIGHT }}>Tall content without scrolling</div>
      </Panes>
      <LayoutRoot />
    </>,
  );
  try {
    const root = view.container.querySelector<HTMLElement>(".app-layout")!;
    const footer = view.container.querySelector<HTMLElement>('[aria-label="Fixed footer"]')!;
    const footerArea = root.querySelector<HTMLElement>(".grid-area-footer")!;
    const pane = footer.parentElement!;
    await expect.poll(() => Math.round(footerArea.getBoundingClientRect().height)).toBe(260);
    await expect
      .poll(() => Math.round(pane.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(root.getBoundingClientRect().bottom);
    await expect.poll(() => document.documentElement.scrollHeight).toBe(window.innerHeight);
  } finally {
    await view.unmount();
  }
});

test("a left ScrollArea pane scrolls within the middle row beside a 260px footer", async () => {
  await page.viewport(1100, 620);
  const view = await render(
    <>
      <Panes>
        <ScrollArea orientation="vertical">
          <div style={{ height: 2000 }}>Scrollable side content</div>
        </ScrollArea>
      </Panes>
      <LayoutRoot />
    </>,
  );
  try {
    const root = view.container.querySelector<HTMLElement>(".app-layout")!;
    const footerArea = root.querySelector<HTMLElement>(".grid-area-footer")!;
    const middleRow = root.querySelector<HTMLElement>(".grid-area-left")!;
    const viewport = middleRow.querySelector<HTMLElement>("[data-scroll-area-viewport]")!;
    await expect.poll(() => Math.round(footerArea.getBoundingClientRect().height)).toBe(260);
    await expect.poll(() => document.documentElement.scrollHeight).toBe(window.innerHeight);
    await expect
      .poll(() => ({
        fitsRow: viewport.clientHeight <= Math.ceil(middleRow.getBoundingClientRect().height),
        overflows: viewport.scrollHeight > viewport.clientHeight,
      }))
      .toEqual({ fitsRow: true, overflows: true });
    viewport.scrollTop = 300;
    await expect.poll(() => viewport.scrollTop).toBeGreaterThan(0);
  } finally {
    await view.unmount();
  }
});

test("a left pane is clipped to its row; it scrolls its own content", async () => {
  await page.viewport(1100, 620);
  const view = await render(
    <>
      <Panes footer={false}>
        <div aria-label="In-flow side content" style={{ height: 900 }}>
          Tall content without scrolling
        </div>
      </Panes>
      <LayoutRoot />
    </>,
  );
  try {
    const root = view.container.querySelector<HTMLElement>(".app-layout")!;
    const content = root.querySelector<HTMLElement>('[aria-label="In-flow side content"]')!;
    const pane = content.parentElement!;
    await expect.poll(() => document.documentElement.scrollHeight).toBe(window.innerHeight);
    await expect
      .poll(() => Math.round(pane.getBoundingClientRect().bottom))
      .toBeLessThanOrEqual(root.getBoundingClientRect().bottom);
  } finally {
    await view.unmount();
  }
});
