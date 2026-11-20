import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Accordion } from "./accordion";
import { Collapse } from "./collapse";

test("open accordion items, headers, triggers and panels expose Base UI state and size variables", () => {
  const html = renderToStaticMarkup(
    <Accordion defaultOpen items={[{ key: "first", header: "First", content: "Content" }]} />,
  );
  const containers = [...html.slice(0, html.indexOf("<h3")).matchAll(/<div\b[^>]*>/g)];
  expect(containers).toHaveLength(2);
  expect(containers[1][0]).toContain('data-open=""');
  expect(html).toMatch(/<h3[^>]*data-open=""/);
  expect(html).toMatch(/<button[^>]*data-panel-open=""/);
  expect(html).toMatch(/<div[^>]*data-open=""[^>]*role="region"/);
  for (const dimension of ["height", "width"]) {
    expect(html).toContain(`--accordion-panel-${dimension}:`);
  }
  expect(html).not.toContain("--radix-");
});

test("open collapses expose root, trigger and panel state and Base UI size variables", () => {
  const html = renderToStaticMarkup(
    <Collapse title="Details" open>
      Content
    </Collapse>,
  );
  expect(html).toMatch(/^<div[^>]*data-open=""/);
  expect(html).toMatch(/<button[^>]*data-panel-open=""/);
  expect([...html.matchAll(/<div[^>]*data-open=""/g)]).toHaveLength(2);
  for (const dimension of ["height", "width"]) {
    expect(html).toContain(`--collapsible-panel-${dimension}:`);
  }
  expect(html).not.toContain("--radix-");
});

test("disabled collapse triggers expose native disabled state", () => {
  const html = renderToStaticMarkup(
    <Collapse title="Locked" disabled>
      Content
    </Collapse>,
  );
  const trigger = /<button\b[^>]*>/.exec(html)?.[0];
  expect(trigger).toMatch(/\sdisabled=""/);
  expect(trigger).not.toContain("aria-disabled=");
});
