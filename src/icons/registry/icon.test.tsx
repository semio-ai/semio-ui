import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Icon } from "./icon";
import { IconProvider } from "./icon-provider";

/** Minimal stand-in glyphs so tests don't depend on any concrete icon's markup. */
function Star({ className }: { className?: string }) {
  return <svg data-glyph="star" className={className} />;
}
function Heart({ className }: { className?: string }) {
  return <svg data-glyph="heart" className={className} />;
}

describe("Icon resolution", () => {
  it("resolves a key from the default registry (custom @semio/ui icon)", () => {
    const html = renderToStaticMarkup(<Icon name="home" />);
    expect(html).toContain("<svg");
  });

  it("resolves a key from the default registry (curated Tabler icon)", () => {
    const html = renderToStaticMarkup(<Icon name="chevron-down" />);
    expect(html).toContain("<svg");
  });

  it("resolves a key registered via IconProvider", () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <Icon name="star" />
      </IconProvider>,
    );
    expect(html).toContain('data-glyph="star"');
  });
});

describe("IconProvider extend vs replace", () => {
  it("extend (default) merges over the inherited registry — both resolve", () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <Icon name="star" />
        <Icon name="chevron-down" />
      </IconProvider>,
    );
    expect(html).toContain('data-glyph="star"'); // newly registered
    expect(html).toContain("tabler-icon-chevron-down"); // still inherited from default
  });

  it("replace (extend=false) drops the inherited registry", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }} extend={false}>
        <Icon name="star" />
        <Icon name="chevron-down" />
      </IconProvider>,
    );
    expect(html).toContain('data-glyph="star"');
    expect(html).not.toContain("chevron-down"); // no longer resolvable
    warn.mockRestore();
  });

  it("nested providers compose; the nearest key wins", () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <IconProvider registry={{ heart: Heart, star: Heart }}>
          <Icon name="heart" />
          <Icon name="star" />
        </IconProvider>
      </IconProvider>,
    );
    // both rendered glyphs are Heart — `star` overridden by the nearer provider
    expect(html.match(/data-glyph="heart"/g)).toHaveLength(2);
    expect(html).not.toContain('data-glyph="star"');
  });
});

describe("Icon fallback", () => {
  it("renders nothing and warns (dev) for an unknown name", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const html = renderToStaticMarkup(<Icon name="definitely-not-a-real-icon" />);
    expect(html).toBe("");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });
});

describe("Icon sizing (single source of truth)", () => {
  it("applies the standard size class by default", () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <Icon name="star" />
      </IconProvider>,
    );
    expect(html).toContain("icon-standard");
    expect(html).not.toContain("icon-larger");
  });

  it('applies the larger size class for size="larger"', () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <Icon name="star" size="larger" />
      </IconProvider>,
    );
    expect(html).toContain("icon-larger");
  });

  it("merges a caller className with the size class", () => {
    const html = renderToStaticMarkup(
      <IconProvider registry={{ star: Star }}>
        <Icon name="star" className="text-red-500" />
      </IconProvider>,
    );
    expect(html).toContain("icon-standard");
    expect(html).toContain("text-red-500");
  });
});
