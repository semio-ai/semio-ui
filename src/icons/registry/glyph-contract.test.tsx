import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "./icon";

// Exercise the public registry boundary: styling/accessibility must reach the SVG
// even when a glyph comes from a custom factory or a curve component.
describe("Solar-style glyph props through the registry", () => {
  it("uses 60% secondary detail without changing state-controlled opacity", () => {
    const custom = renderToStaticMarkup(<Icon name="user" />);
    const key = renderToStaticMarkup(<Icon name="key" fillOpacity={0.5} />);

    expect(custom).toContain('stroke-opacity="0.6"');
    expect(key).toContain('fill-opacity="0.5"');
  });

  it.each([
    "sphere",
    "plus",
    "save",
    "vector-bezier",
    "vector-sine",
    "graph-view",
    "vertical-uniform",
    "vertical-normalize",
    "user",
    "moon",
    "sun-moon",
    "replace",
    "vertex-free",
    "vertex-paired",
    "vertex-indeterminate",
    "bezier",
    "rotate-3d",
    "time-display-milliseconds",
    "time-display-seconds",
    "time-display-frames",
    "time-display-seconds-frames",
    "time-display-ticks",
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
});
