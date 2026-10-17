import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Checkbox } from "./checkbox";
import { Switch } from "./switch";
import { ToggleSquare } from "./toggle-square";

const ignore = () => undefined;

test("checkbox labels target the native button and its indicator keeps checked state", () => {
  const html = renderToStaticMarkup(<Checkbox id="agreement" checked onCheckedChange={ignore} />);
  expect(html).toMatch(/<button[^>]*id="agreement"[^>]*>/);
  expect(html).toMatch(/<button[^>]*type="button"[^>]*data-state="checked"/);
  expect(html).toMatch(/<span[^>]*data-state="checked"/);
  expect(html).not.toMatch(/<input[^>]*id="agreement"/);
  expect(html).toContain('aria-checked="true"');
  expect(html).not.toContain('tabindex="0"');
});

test("disabled switches keep a native button and checked state on the thumb", () => {
  const html = renderToStaticMarkup(
    <Switch id="power" checked disabled onCheckedChange={ignore} />,
  );
  expect(html).toMatch(/<button[^>]*id="power"/);
  expect(html).toMatch(/<button[^>]*\sdisabled=""/);
  expect(html).toMatch(/<button[^>]*data-state="checked"/);
  expect(html).toMatch(/<span[^>]*data-state="checked"/);
  expect(/<button[^>]*>/.exec(html)?.[0]).not.toContain("tabindex=");
  expect(html).not.toContain("aria-disabled=");
});

test("partial toggle squares expose mixed checkbox state on a native button", () => {
  const html = renderToStaticMarkup(<ToggleSquare value="partial" onChange={ignore} />);
  expect(html).toMatch(/<button[^>]*role="checkbox"/);
  expect(html).toContain('aria-checked="mixed"');
  expect(html).toContain('data-state="indeterminate"');
  expect(html).toContain('type="button"');
  expect(/<button[^>]*>/.exec(html)?.[0]).not.toContain("tabindex=");
});
