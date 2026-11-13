import { DropdownMenu } from "radix-ui";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";
import "../test-stylesheet";
import { Icon } from "../icons/registry";
import { NestedChild } from "./configured-render";
import { NestedRadio } from "./radio";

test("a radio option too long for its menu stays on one line, cut short, at row height", async () => {
  const long = "Robotics Collective of Greater Portland · @robotics-collective-pdx";
  await render(
    <DropdownMenu.Root open>
      <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <div style={{ width: 220 }}>
          <NestedRadio
            value="short"
            options={[
              { value: "short", label: "Semio" },
              { value: "long", label: long },
            ]}
          />
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[role="menuitemradio"]'));
  const [short, longRow] = rows.map((row) => row.getBoundingClientRect());
  // The row's height is fixed either way, so it cannot show a wrap: the text's own
  // line boxes can. A wrapped label lays out a second line below the first.
  expect(longRow.height).toBe(short.height);
  const walker = document.createTreeWalker(rows[1], NodeFilter.SHOW_TEXT);
  let text: Node | null = walker.nextNode();
  while (text && text.textContent !== long) text = walker.nextNode();
  expect(text?.textContent).toBe(long);
  const range = document.createRange();
  range.selectNodeContents(text!);
  const lines = new Set(Array.from(range.getClientRects(), (rect) => Math.round(rect.top)));
  expect(lines.size).toBe(1);
  // Cut short inside the row rather than running past the menu's edge.
  const label = text!.parentElement!;
  expect(label.scrollWidth).toBeGreaterThan(label.clientWidth);
  expect(label.getBoundingClientRect().right).toBeLessThanOrEqual(longRow.right);
});

// A fixed-size square, as a consumer's status indicator is. Sized inline: the
// package's stylesheet carries only the utilities its own components name.
const indicator = (
  <span
    data-testid="indicator"
    className="grid place-items-center rounded-xs"
    style={{ width: 20, height: 20 }}
  >
    <span className="icon-slot">
      <Icon name="status-info" />
    </span>
  </span>
);

test("a submenu's trailing indicator keeps its size beside the disclosure, which keeps its own", async () => {
  await render(
    <DropdownMenu.Root open>
      <DropdownMenu.Trigger>Open</DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <div style={{ width: 220 }}>
          <NestedChild
            type="menu"
            id="submenu"
            label="With indicator"
            left="search"
            right={indicator}
          >
            {[]}
          </NestedChild>
          <NestedChild type="menu" id="plain" label="Without" left="search">
            {[]}
          </NestedChild>
          <NestedChild type="item" id="item" left="search" right={indicator}>
            Invitations
          </NestedChild>
        </div>
      </DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  const [submenu, item] = Array.from(
    document.querySelectorAll<HTMLElement>('[data-testid="indicator"]'),
    (element) => element.getBoundingClientRect(),
  );
  expect([submenu.width, submenu.height]).toEqual([20, 20]);
  expect([item.width, item.height]).toEqual([20, 20]);
  // The disclosure glyph is the same box beside an indicator as without one.
  const disclosure = (label: string) => {
    const trigger = Array.from(document.querySelectorAll<HTMLElement>(".group\\/item")).find(
      (element) => element.textContent === label,
    )!;
    const glyphs = trigger.querySelectorAll("svg");
    return glyphs[glyphs.length - 1].getBoundingClientRect();
  };
  const beside = disclosure("With indicator");
  const alone = disclosure("Without");
  expect(alone.width).toBeGreaterThan(0);
  expect([beside.width, beside.height]).toEqual([alone.width, alone.height]);
});
