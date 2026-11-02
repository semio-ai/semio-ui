import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

// Exercise the public registry boundary: styling/accessibility must reach the SVG
// even when a glyph comes from a custom factory wrapper.
describe("Solar-style glyph props through the registry", () => {
  it.each([
    "hide",
    "mute",
    "state-hidden",
    "state-muted",
    "state-unmuted",
    "speaker",
    "unmute",
    "eye-off",
    "speaker-off",
  ] as const)("%s uses the shared secondary opacity", (name) => {
    const html = renderToStaticMarkup(<Icon name={name} />);
    const partial = [...html.matchAll(/(?:stroke-opacity|fill-opacity|opacity)="(0\.\d+)"/g)].map(
      ([, value]) => value,
    );

    expect(partial.length).toBeGreaterThan(0);
    expect(new Set(partial)).toEqual(new Set(["0.6"]));
  });

  it("uses 60% secondary detail", () => {
    const custom = renderToStaticMarkup(<Icon name="user" />);

    expect(custom).toContain('stroke-opacity="0.6"');
  });

  it.each([
    "fit-horizontal",
    "fit-vertical",
    "plus",
    "save",
    "user",
    "moon",
    "sun-moon",
    "replace",
    "sort-updated",
  ] as const)("%s forwards accessibility, color, mirroring, and caller styles", (name) => {
    const html = renderToStaticMarkup(
      <Icon
        name={name}
        size="none"
        className="caller-icon"
        color="rebeccapurple"
        alt="Accessible glyph"
        aria-label="Example"
        mirrored
        style={{ opacity: 0.7 }}
      />,
    );
    expect(html).toContain('width="18px"');
    expect(html).toContain('class="');
    expect(html).toContain("caller-icon");
    expect(html).toContain('aria-label="Example"');
    expect(html).toContain("<title>Accessible glyph</title>");
    expect(html).toContain("rebeccapurple");
    expect(html).toContain('transform="scale(-1, 1)"');
    expect(html).toContain("opacity:0.7");
    expect(html).not.toContain('mirrored="');
    expect(html).not.toContain('alt="');
  });
  it("rotates the fit artwork vertically", () => {
    const horizontal = renderToStaticMarkup(<Icon name="fit-horizontal" />);
    const vertical = renderToStaticMarkup(<Icon name="fit-vertical" />);
    expect(vertical).toContain('transform="rotate(90 12 12)"');
    expect([...vertical.matchAll(/<path[^>]+>/g)].map(([path]) => path)).toEqual(
      [...horizontal.matchAll(/<path[^>]+>/g)].map(([path]) => path),
    );
  });
});
