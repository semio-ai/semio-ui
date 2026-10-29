import { readFileSync } from "node:fs";
import { createElement, Fragment, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { beforeAll, expect, test } from "vitest";
import { Theme, Variant } from "../types";
import { defaultResolveRowVisual } from "../tree/resolve-row-visual";
import { Checkbox } from "./checkbox";
import { ToggleSquare } from "./toggle-square";
import { Switch } from "./switch";

const read = (path: string) => readFileSync(new URL(path, import.meta.url), "utf8");
const theme = postcss.parse(
  readFileSync(new URL(import.meta.resolve("tailwindcss/theme.css")), "utf8") +
    read("../../public/theme.css"),
);
const tokens = new Map<string, string>();
theme.walkDecls((decl) => {
  tokens.set(decl.prop, decl.value);
});

/** Resolve the neutral tokens from the shipped theme, failing on unsupported syntax. */
function rgb(value: string): number[] {
  const variable = /^var\((--[\w-]+)\)$/.exec(value);
  if (variable) {
    const resolved = tokens.get(variable[1]);
    if (!resolved) throw new Error(`Missing token: ${variable[1]}`);
    return rgb(resolved);
  }
  if (/^#[\da-f]{6}$/i.test(value)) {
    return [1, 3, 5].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
  }
  const neutral = /^oklch\(([\d.]+)(%?) 0 0\)$/.exec(value);
  if (!neutral) throw new Error(`Unsupported neutral: ${value}`);
  const linear = (Number(neutral[1]) / (neutral[2] ? 100 : 1)) ** 3;
  const channel = linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
  return Array<number>(3).fill(Math.round(channel * 255));
}

let compiled: postcss.Root;
beforeAll(async () => {
  const entry = new URL("../../make-kit/make.css", import.meta.url);
  const result = await postcss([tailwindcss()]).process(readFileSync(entry, "utf8"), {
    from: entry.pathname,
  });
  compiled = result.root;
});

const cases = [
  {
    theme: Theme.Light,
    boundary: [82, 82, 82],
    base: [204, 204, 204],
    inset: [229, 229, 229],
    deep: [237, 237, 237],
    raised: [220, 220, 220],
  },
  {
    theme: Theme.Dark,
    boundary: [161, 161, 161],
    base: [51, 51, 51],
    inset: [38, 38, 38],
    deep: [23, 23, 23],
    raised: [37, 37, 37],
  },
];

test.each(cases)("$theme: disclosure boundary and surface tokens remain pinned", (expected) => {
  expect(rgb(`var(--color-control-${expected.theme}-boundary)`)).toEqual(expected.boundary);
  expect(rgb(`var(--color-layout-${expected.theme}-base)`)).toEqual(expected.base);
  expect(rgb(`var(--color-layout-${expected.theme}-inset)`)).toEqual(expected.inset);
  expect(rgb(`var(--color-layout-${expected.theme}-deep-inset)`)).toEqual(expected.deep);
  const panel = /\.card-panel\s*\{\s*@apply dark:bg-\[(#[\da-f]+)\] bg-\[(#[\da-f]+)\];/i.exec(
    read("../../../../apps/studio/src/index.css"),
  );
  expect(panel).not.toBeNull();
  expect(rgb(panel![expected.theme === Theme.Dark ? 1 : 2])).toEqual(expected.raised);
  for (const selected of [false, true]) {
    expect(
      defaultResolveRowVisual(
        { focused: false, selected, emphasized: true, anchor: false },
        undefined,
      ).background,
    ).toBe(`color-mix(in oklab, var(--accent-color) ${selected ? 18 : 8}%, transparent)`);
  }
});

test("the opaque edge uses the scoped variant colour and preserves neutral disclosure tokens", () => {
  const rules: postcss.Rule[] = [];
  compiled.walkRules((rule) => {
    if (
      rule.selector.replace(/\s/g, "") ===
      ".variant-checkbox-bg:not(.toggle-square-content),.grid-list-item-indicator"
    )
      rules.push(rule);
  });
  expect(rules).toHaveLength(1);
  const ring = rules[0];
  const declarations = Object.fromEntries(
    ring.nodes
      .filter((node): node is postcss.Declaration => node.type === "decl")
      .map((decl) => [decl.prop, decl.value]),
  );
  expect(declarations).toMatchObject({
    "--control-boundary-color": "var(--color-control-light-boundary)",
    "box-shadow": "inset 0 0 0 1px var(--control-boundary-color), var(--control-state-shadow)",
  });
  const dark = ring.nodes.find(
    (node) => node.type === "rule" && node.selector === "&:where(.dark, .dark *)",
  ) as postcss.Rule;
  expect(
    dark?.nodes.some(
      (node) =>
        node.type === "decl" &&
        node.prop === "--control-boundary-color" &&
        node.value === "var(--color-control-dark-boundary)",
    ),
  ).toBe(true);
  const scoped = ring.nodes.find(
    (node) => node.type === "rule" && node.selector === "&.variant-scope",
  ) as postcss.Rule;
  expect(
    scoped?.nodes.some(
      (node) =>
        node.type === "decl" &&
        node.prop === "--control-boundary-color" &&
        node.value === "var(--standard-color)",
    ),
  ).toBe(true);
  const hoverEdges: postcss.Declaration[] = [];
  compiled.walkDecls("--control-boundary-color", (decl) => {
    if (decl.value === "var(--accent-color)") hoverEdges.push(decl);
  });
  expect(hoverEdges).toHaveLength(1);
  expect((hoverEdges[0].parent as postcss.AtRule).params).toBe("(hover: hover)");
  // Fragments built with createElement: an empty or falsy-only fragment is the case.
  const fragment = (...children: ReactNode[]) => createElement(Fragment, null, ...children);
  for (const children of [
    undefined,
    null,
    false,
    "",
    [],
    ["", null, false],
    fragment(),
    fragment(false, null),
    fragment(fragment(), ""),
  ]) {
    const markup = renderToStaticMarkup(
      <ToggleSquare value={false} onChange={() => {}}>
        {children}
      </ToggleSquare>,
    );
    expect(markup).toContain("variant-checkbox-bg");
    expect(markup).not.toContain("toggle-square-content");
  }
  const iconInFragment = renderToStaticMarkup(
    <ToggleSquare value={false} onChange={() => {}}>
      {fragment(<svg key="icon" />)}
    </ToggleSquare>,
  );
  expect(iconInFragment).toContain("toggle-square-content");
  const indicator = renderToStaticMarkup(
    <ToggleSquare value={false} asIndicator onChange={() => {}}>
      <svg />
    </ToggleSquare>,
  );
  expect(indicator).toContain("grid-list-item-indicator");
  expect(indicator).not.toContain("toggle-square-content");
});

test.each(
  [false, true].flatMap((disabled) =>
    [false, true, "partial" as const]
      .filter((value) => disabled || value !== "partial")
      .map((value) => ({ value, disabled })),
  ),
)("content toggle value=$value disabled=$disabled has no inset edge", ({ value, disabled }) => {
  const markup = renderToStaticMarkup(
    <ToggleSquare value={value} disabled={disabled} onChange={() => {}}>
      <svg />
    </ToggleSquare>,
  );
  expect(markup).toContain("toggle-square-content");
  compiled.walkDecls("box-shadow", (decl) => {
    if (decl.value.includes("--control-boundary-color")) {
      expect((decl.parent as postcss.Rule).selectors).toEqual([
        ".variant-checkbox-bg:not(.toggle-square-content)",
        ".grid-list-item-indicator",
      ]);
    }
  });
});

test.each([undefined, "#f56b29"])(
  "content partial toggle color=%s wires a 1px standard inset and accent hover",
  (color) => {
    const markup = renderToStaticMarkup(
      <ToggleSquare value="partial" color={color} onChange={() => {}}>
        <svg />
      </ToggleSquare>,
    );
    expect(markup).toContain("toggle-square-content");
    if (color) {
      expect(markup).toContain("custom-color");
      expect(markup).toContain(`--custom-color:${color}`);
    }
    const partials: postcss.Rule[] = [];
    compiled.walkRules(
      '&.toggle-square-content:not(:disabled)[data-state="indeterminate"]',
      (rule) => {
        partials.push(rule);
      },
    );
    expect(partials).toHaveLength(1);
    expect((partials[0].parent as postcss.Rule).selector).toBe(".variant-checkbox-bg");
    const shadows: string[] = [];
    partials[0].walkDecls("box-shadow", (decl) => {
      shadows.push(decl.value);
      if (decl.value.includes("--accent-color")) {
        expect((decl.parent as postcss.AtRule).params).toBe("(hover: hover)");
        expect((decl.parent?.parent as postcss.Rule).selector).toBe("&:hover");
      }
    });
    expect(shadows).toEqual([
      "inset 0 0 0 1px var(--standard-color)",
      "inset 0 0 0 1px var(--accent-color)",
    ]);
  },
);

test("off and disabled controls do not dim their boundary with opacity utilities", () => {
  for (const disabled of [false, true]) {
    for (const indicator of [false, true]) {
      const markup = renderToStaticMarkup(
        <>
          <Checkbox
            checked={false}
            disabled={disabled}
            asIndicator={indicator}
            onCheckedChange={() => {}}
          />
          <ToggleSquare
            value={false}
            disabled={disabled}
            asIndicator={indicator}
            onChange={() => {}}
          />
          <Switch checked={false} disabled={disabled} onCheckedChange={() => {}} />
        </>,
      );
      for (const className of markup.matchAll(/<button[^>]*class="([^"]*)"/g)) {
        expect(className[1]).not.toMatch(/opacity-/);
      }
    }
  }
  const source = read("../../public/styles.css");
  const indicator = source.slice(
    source.lastIndexOf("  .grid-list-item-indicator {"),
    source.indexOf("  .list-item-extra {"),
  );
  expect(indicator).not.toMatch(/opacity-/);
});

test("each variant and custom colour supplies its own checked-fill token", () => {
  const scope: postcss.Rule[] = [];
  compiled.walkRules(".variant-scope", (rule) => {
    scope.push(rule);
  });
  expect(scope).toHaveLength(1);
  for (const variant of Object.values(Variant).filter((value) => value !== Variant.Default)) {
    const rule = scope[0].nodes.find(
      (node) => node.type === "rule" && node.selector === `&:where(.${variant})`,
    ) as postcss.Rule;
    expect(
      rule?.nodes.some(
        (node) =>
          node.type === "decl" &&
          node.prop === "--standard-color" &&
          node.value === `var(--color-${variant}-500)`,
      ),
    ).toBe(true);
  }
  expect(tokens.has("--color-default-500")).toBe(true);
  expect(read("../../public/styles.css")).toContain("--standard-color: var(--custom-color)");
});

test.each(
  [false, true].flatMap((disabled) => [false, true].map((checked) => ({ disabled, checked }))),
)(
  "switch checked=$checked disabled=$disabled animates its scoped thumb colour with translate",
  ({ checked, disabled }) => {
    const markup = renderToStaticMarkup(
      <Switch checked={checked} disabled={disabled} onCheckedChange={() => {}} />,
    );
    const thumbClass = /<span[^>]*class="([^"]*)"/.exec(markup)?.[1];
    expect(thumbClass).toBeDefined();
    expect(thumbClass).not.toMatch(/bg-current|currentColor/);
    expect(thumbClass).toContain(
      checked ? "bg-[var(--on-standard-color)]" : "bg-[var(--standard-color)]",
    );
    expect(markup).toContain("transition-[translate,background-color]");
    expect(markup).toContain("duration-160 ease-out");
    expect(markup.includes("opacity-50")).toBe(disabled);
  },
);
