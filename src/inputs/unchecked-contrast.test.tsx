import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import { beforeAll, expect, test } from "vitest";
import { Theme } from "../types";
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

function contrast(a: number[], b: number[]): number {
  const luminance = (channels: number[]) =>
    channels.reduce((sum, c, i) => {
      const v = c / 255;
      return (
        sum +
        [0.2126, 0.7152, 0.0722][i] * (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      );
    }, 0);
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
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

test("the contrast calculation reproduces black against white", () => {
  expect(contrast([0, 0, 0], [255, 255, 255])).toBe(21);
});

test.each(cases)("$theme: the resolved boundary clears 3:1 on every surface", (expected) => {
  const boundary = rgb(`var(--color-control-${expected.theme}-boundary)`);
  expect(boundary).toEqual(expected.boundary);
  const base = rgb(`var(--color-layout-${expected.theme}-base)`);
  const inset = rgb(`var(--color-layout-${expected.theme}-inset)`);
  const deep = rgb(`var(--color-layout-${expected.theme}-deep-inset)`);
  const studio = read("../../../../apps/studio/src/index.css");
  const panel = /\.card-panel\s*\{\s*@apply dark:bg-\[(#[\da-f]+)\] bg-\[(#[\da-f]+)\];/i.exec(
    studio,
  );
  expect(panel).not.toBeNull();
  const raised = rgb(panel![expected.theme === Theme.Dark ? 1 : 2]);
  expect({ base, inset, deep, raised }).toEqual({
    base: expected.base,
    inset: expected.inset,
    deep: expected.deep,
    raised: expected.raised,
  });
  for (const [surface, color] of Object.entries({
    base,
    raised,
    inset,
    "deep-inset": deep,
    dialog: inset,
    popover: deep,
    "list row": inset,
    ...Object.fromEntries(
      [false, true].flatMap((selected) => {
        const visual = defaultResolveRowVisual(
          { focused: false, selected, emphasized: true, anchor: false },
          undefined,
        );
        const mix = /^color-mix\(in oklab, var\(--accent-color\) (\d+)%, transparent\)$/.exec(
          visual.background!,
        );
        expect(mix).not.toBeNull();
        const percent = Number(mix![1]);
        expect(percent).toBe(selected ? 18 : 8);
        // The row's default accent and the boundary use the same neutral shade.
        const alpha = percent / 100;
        return Object.entries({ base, raised, inset, deep }).map(([groundName, ground]) => [
          `${selected ? "selected" : "emphasized"} list row on ${groundName}`,
          ground.map((c, i) => boundary[i] * alpha + c * (1 - alpha)),
        ]);
      }),
    ),
  })) {
    expect(contrast(boundary, color), `${expected.theme}/${surface}`).toBeGreaterThanOrEqual(3);
  }
});

test("the compiled control classes wire the opaque inset ring to both theme tokens", () => {
  const rules: postcss.Rule[] = [];
  compiled.walkRules((rule) => {
    if (rule.selector.replace(/\s/g, "") === ".variant-checkbox-bg,.grid-list-item-indicator")
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
});

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
