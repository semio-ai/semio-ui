import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import { Icon } from "../icons/registry/icon";
import { Text, TextRole } from "../text";
import { EmptyState } from "./empty-state";
import "../test-stylesheet";

/**
 * What `EmptyState` claims about its paint and its glyph, measured against the real
 * stylesheet.
 *
 * Every colour assertion is paired with a control that must come out different. Without
 * the stylesheet every colour computes to the same default and an equality check agrees
 * with itself; the controls are what make each equality mean something.
 */

type Theme = "light" | "dark";
const THEMES: Theme[] = ["light", "dark"];

async function measure<T>(
  theme: Theme,
  node: React.ReactNode,
  read: (root: HTMLElement) => T,
): Promise<T> {
  const html = document.documentElement;
  const previous = html.className;
  html.className = theme === "dark" ? "dark" : "";
  const host = document.createElement("div");
  document.body.appendChild(host);
  try {
    const view = await render(<>{node}</>, { container: host });
    const result = read(host);
    await view.unmount();
    return result;
  } finally {
    host.remove();
    html.className = previous;
  }
}

const glyphBox = (root: HTMLElement) =>
  root.querySelector<HTMLElement>("[data-empty-state-glyph]")!;
const glyph = (root: HTMLElement) => glyphBox(root).querySelector<SVGElement>("svg")!;
const sentence = (root: HTMLElement) => root.querySelector<HTMLElement>("p")!;

/** Opacity as painted: the product of every ancestor's up to the host. */
function paintedOpacity(el: Element, stop: Element): number {
  let value = 1;
  for (let node: Element | null = el; node && node !== stop; node = node.parentElement) {
    value *= Number(getComputedStyle(node).opacity);
  }
  return value;
}

describe.each(THEMES)("in %s", (theme) => {
  test("the glyph is painted in the sentence's colour, which is the Note role's", async () => {
    const { glyphColor, sentenceColor, note, body } = await measure(
      theme,
      <>
        <EmptyState icon="info">Nothing here yet.</EmptyState>
        <Text role={TextRole.Note} data-testid="note">
          control
        </Text>
        <Text role={TextRole.Body} data-testid="body">
          control
        </Text>
      </>,
      (root) => ({
        glyphColor: getComputedStyle(glyph(root)).color,
        sentenceColor: getComputedStyle(sentence(root)).color,
        note: getComputedStyle(root.querySelector("[data-testid='note']")!).color,
        body: getComputedStyle(root.querySelector("[data-testid='body']")!).color,
      }),
    );
    expect(sentenceColor).toBe(note);
    expect(glyphColor).toBe(sentenceColor);
    // Control: a different role paints differently, so the equalities above are not
    // two defaults agreeing.
    expect(body).not.toBe(note);
  });

  test("neither the glyph nor the sentence is dimmed", async () => {
    const { shipped, handRolled } = await measure(
      theme,
      <>
        <div data-testid="shipped">
          <EmptyState icon="info">Nothing here yet.</EmptyState>
        </div>
        {/* The treatment this component replaces, as a control that must read lower. */}
        <div data-testid="hand-rolled">
          <Icon name="info" size="none" className="size-8 opacity-30" />
        </div>
      </>,
      (root) => {
        const shippedRoot = root.querySelector("[data-testid='shipped']")!;
        const handRolledRoot = root.querySelector("[data-testid='hand-rolled']")!;
        return {
          shipped: [
            paintedOpacity(glyph(shippedRoot as HTMLElement), shippedRoot),
            paintedOpacity(sentence(shippedRoot as HTMLElement), shippedRoot),
          ],
          handRolled: paintedOpacity(handRolledRoot.querySelector("svg")!, handRolledRoot),
        };
      },
    );
    expect(shipped).toEqual([1, 1]);
    expect(handRolled).toBeCloseTo(0.3);
  });
});

test("the two themes paint the glyph differently", async () => {
  // Serially, not concurrently: each measurement sets the theme on <html>.
  const read = (r: HTMLElement) => getComputedStyle(glyph(r)).color;
  const light = await measure("light", <EmptyState icon="info">x</EmptyState>, read);
  const dark = await measure("dark", <EmptyState icon="info">x</EmptyState>, read);
  expect(light).not.toBe(dark);
});

test("the glyph takes the explicit Xl step through .icon-standard, and an opted-out glyph keeps its own size", async () => {
  const { standard, optedOut } = await measure(
    "light",
    <>
      <div data-testid="standard">
        <EmptyState icon="info">x</EmptyState>
      </div>
      <div data-testid="opted-out">
        <EmptyState icon={<Icon name="info" size="none" className="size-10" />}>x</EmptyState>
      </div>
    </>,
    (root) => {
      const rect = (id: string) =>
        glyph(root.querySelector<HTMLElement>(`[data-testid='${id}']`)!).getBoundingClientRect();
      const s = rect("standard");
      const o = rect("opted-out");
      return { standard: [s.width, s.height], optedOut: [o.width, o.height] };
    },
  );
  expect(standard).toEqual([28, 28]);
  expect(optedOut).toEqual([40, 40]);
});

test("the title is a heading painted as Value, and a colour on the root does not reach the text", async () => {
  const { tag, titleColor, value, sentenceColor, note } = await measure(
    "light",
    <>
      <EmptyState title="Not available" titleAs="h1" className="text-red-500">
        This does not exist.
      </EmptyState>
      <Text role={TextRole.Value} data-testid="value">
        control
      </Text>
      <Text role={TextRole.Note} data-testid="note">
        control
      </Text>
    </>,
    (root) => {
      const title = root.querySelector("h1")!;
      return {
        tag: title.tagName,
        titleColor: getComputedStyle(title).color,
        value: getComputedStyle(root.querySelector("[data-testid='value']")!).color,
        sentenceColor: getComputedStyle(sentence(root)).color,
        note: getComputedStyle(root.querySelector("[data-testid='note']")!).color,
      };
    },
  );
  expect(tag).toBe("H1");
  expect(titleColor).toBe(value);
  expect(sentenceColor).toBe(note);
  expect(titleColor).not.toBe(sentenceColor);
});

test("the title defaults to h2, and nothing is rendered for an absent glyph, title or actions", async () => {
  const counts = await measure("light", <EmptyState>Only a sentence.</EmptyState>, (root) => ({
    h2: root.querySelectorAll("h2").length,
    glyph: root.querySelectorAll("[data-empty-state-glyph]").length,
    children: root.firstElementChild!.children.length,
  }));
  expect(counts).toEqual({ h2: 0, glyph: 0, children: 1 });

  const withTitle = await measure(
    "light",
    <EmptyState title="Heading">Sentence.</EmptyState>,
    (root) => root.querySelectorAll("h2").length,
  );
  expect(withTitle).toBe(1);
});
