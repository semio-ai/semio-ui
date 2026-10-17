import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { Accordion } from "./accordion";
import { Collapse } from "./collapse";

test("open accordion items and panels keep disclosure state and all public size aliases", () => {
  const html = renderToStaticMarkup(
    <Accordion defaultOpen items={[{ key: "first", header: "First", content: "Content" }]} />,
  );
  const containers = [...html.slice(0, html.indexOf("<h3")).matchAll(/<div\b[^>]*>/g)];
  expect(containers).toHaveLength(2);
  expect(containers[1][0]).toContain('data-state="open"');
  expect(html).toMatch(/<h3[^>]*data-state="open"/);
  expect(html).toMatch(/<div[^>]*role="region"[^>]*data-state="open"/);
  for (const dimension of ["height", "width"]) {
    for (const part of ["accordion", "collapsible"]) {
      expect(html).toContain(
        `--radix-${part}-content-${dimension}:var(--accordion-panel-${dimension})`,
      );
    }
  }
});

test("open collapses keep root state and both public size aliases", () => {
  const html = renderToStaticMarkup(
    <Collapse title="Details" open>
      Content
    </Collapse>,
  );
  expect(html).toMatch(/^<div[^>]*data-state="open"/);
  expect(html).toMatch(/<button[^>]*data-state="open"/);
  expect([...html.matchAll(/<div[^>]*data-state="open"/g)]).toHaveLength(2);
  for (const dimension of ["height", "width"]) {
    expect(html).toContain(
      `--radix-collapsible-content-${dimension}:var(--collapsible-panel-${dimension})`,
    );
  }
});
