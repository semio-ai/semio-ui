import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Accordion } from "./accordion";

test("a stuck accordion header paints above positioned panel content", async () => {
  const view = await render(
    <div style={{ height: 140, overflowY: "auto" }}>
      <Accordion
        sticky
        defaultOpen
        items={[
          {
            key: "rows",
            header: "Positioned rows",
            content: Array.from({ length: 20 }, (_, index) => (
              <div key={index} style={{ position: "relative", height: 40 }}>
                Row {index}
              </div>
            )),
          },
        ]}
      />
    </div>,
  );
  try {
    const scroll = view.container.firstElementChild as HTMLElement;
    const header = scroll.querySelector<HTMLElement>("h3")!;
    const text = header.querySelector("button > span")!;
    const range = document.createRange();
    range.selectNodeContents(text);
    const hit = () => {
      const rect = range.getBoundingClientRect();
      return document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    };
    expect(header.contains(hit())).toBe(true);
    scroll.scrollTop = 96;
    await expect.poll(() => scroll.scrollTop).toBe(96);
    await expect
      .poll(() => header.getBoundingClientRect().top)
      .toBe(scroll.getBoundingClientRect().top);
    const rect = range.getBoundingClientRect();
    expect(
      [...scroll.querySelectorAll<HTMLElement>('[style*="relative"]')].some((row) => {
        const box = row.getBoundingClientRect();
        return box.top < rect.y + rect.height / 2 && box.bottom > rect.y + rect.height / 2;
      }),
    ).toBe(true);
    await expect.poll(() => header.contains(hit())).toBe(true);
  } finally {
    await view.unmount();
  }
});

test("an ordinary accordion header keeps its automatic stacking order", async () => {
  const view = await render(
    <Accordion items={[{ key: "plain", header: "Plain", content: "Panel" }]} />,
  );
  try {
    const style = getComputedStyle(view.container.querySelector("h3")!);
    expect(style.position).toBe("static");
    expect(style.zIndex).toBe("auto");
  } finally {
    await view.unmount();
  }
});
