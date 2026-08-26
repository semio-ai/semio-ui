import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Markdown } from "./markdown";

/**
 * The first block of tests is a security boundary, not a formatting preference.
 *
 * Everything `Markdown` renders was written by one user and is shown to others, so
 * "raw HTML in the source stays inert" is the property that keeps a description
 * from becoming stored XSS. It holds because the renderer builds a React element
 * tree and `rehype-raw` is deliberately absent — both of which are one line away
 * from being undone by someone adding a plugin to make an embedded `<br>` work.
 * These tests are what should stop that.
 */
describe("Markdown does not render raw HTML", () => {
  it("renders an HTML block as text, not as markup", () => {
    const html = renderToStaticMarkup(
      <Markdown>{`<div style="background: red">boom</div>`}</Markdown>,
    );
    // The source text survives (escaped), but no div carrying that style exists.
    expect(html).toContain("boom");
    expect(html).not.toContain('<div style="background: red"');
  });

  it("does not emit a script element", () => {
    const html = renderToStaticMarkup(<Markdown>{`<script>alert(1)</script>`}</Markdown>);
    expect(html).not.toContain("<script");
  });

  it("does not emit an inline event handler", () => {
    const html = renderToStaticMarkup(<Markdown>{`<img src=x onerror="alert(1)">`}</Markdown>);
    // Asserted as "no img ELEMENT", not "the string `onerror` is absent": the whole
    // tag comes through as escaped text, so the handler's name is still present in
    // the output — as characters on the page, which is the safe outcome.
    expect(html).toContain("&lt;img");
    expect(html).not.toContain("<img");
  });

  it("drops a javascript: link destination", () => {
    // Markdown source goes through a variable rather than inline JSX children
    // throughout this file: as literal children, `{`, `}` and newlines are JSX
    // syntax, so half these fixtures could not be written that way at all.
    const source = "[click](javascript:alert(1))";
    const html = renderToStaticMarkup(<Markdown>{source}</Markdown>);
    expect(html).toContain("click");
    expect(html).not.toContain("javascript:");
  });

  it("opens author-supplied links with noreferrer noopener", () => {
    const source = "[docs](https://example.com)";
    const html = renderToStaticMarkup(<Markdown>{source}</Markdown>);
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('rel="noreferrer noopener"');
  });
});

describe("Markdown structure", () => {
  it("shifts headings down one level so the page keeps its h1", () => {
    const html = renderToStaticMarkup(<Markdown>{`# Top\n\n## Second`}</Markdown>);
    // `#` becomes h2 and `##` becomes h3: the embedding surface already used h1
    // for the thing being described, so a second h1 would claim a second subject.
    expect(html).toContain("<h2");
    expect(html).toContain("<h3");
    expect(html).not.toContain("<h1");
  });

  it("renders a fenced block through Snippet rather than a bare pre", () => {
    const html = renderToStaticMarkup(<Markdown>{"```typescript\nconst x = 1;\n```"}</Markdown>);
    // Asserted on what `Snippet` contributes — its language header and its copy
    // control — rather than on the code text, which syntax highlighting splits
    // across a span per token, so no contiguous "const x = 1;" survives.
    expect(html).toContain("typescript");
    expect(html).toContain("<button");
    expect(html).toContain("token keyword");
  });

  it("keeps inline code quiet and distinct from a fenced block", () => {
    const source = "call `resolve()` first";
    const html = renderToStaticMarkup(<Markdown>{source}</Markdown>);
    expect(html).toContain("<code");
    expect(html).not.toContain("<button");
  });

  it("renders GFM tables in their own scroll container", () => {
    const source = "| a | b |\n|---|---|\n| 1 | 2 |";
    const html = renderToStaticMarkup(<Markdown>{source}</Markdown>);
    expect(html).toContain("<table");
    // Wide content scrolls in its own box rather than the page scrolling sideways.
    expect(html).toContain("overflow-x-auto");
  });

  it("renders nothing at all for empty or whitespace-only source", () => {
    expect(renderToStaticMarkup(<Markdown>{"   \n  "}</Markdown>)).toBe("");
    expect(renderToStaticMarkup(<Markdown>{null}</Markdown>)).toBe("");
    expect(renderToStaticMarkup(<Markdown>{undefined}</Markdown>)).toBe("");
  });
});
