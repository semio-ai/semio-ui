import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ListRow } from "./list/list-row";
import { TreeRow } from "./tree/tree-row";
import { ROW_HEIGHT, ROW_HEIGHT_PX } from "./row-metrics";
import { Size } from "./types";

const SIZES = [Size.Xs, Size.Sm, Size.Md, Size.Lg, Size.Xl];

describe("row rhythm", () => {
  it("gives a list row and a tree row the same height at every size", () => {
    // The reason the table is shared rather than duplicated: a listing and a tree at the
    // same size must be the same height, or two surfaces built from the same system read
    // as differently-built things.
    for (const size of SIZES) {
      const list = renderToStaticMarkup(
        <ListRow columns={[{ key: "a" }]} cells={[<span key="a">x</span>]} size={size} />,
      );
      const tree = renderToStaticMarkup(<TreeRow depth={0} label={<span>x</span>} size={size} />);
      expect(list).toContain(ROW_HEIGHT[size]);
      expect(tree).toContain(ROW_HEIGHT[size]);
    }
  });

  it("defaults both rows to the Md anchor", () => {
    // `Md` is `h-9`, the density `TreeRow` was fixed at and the animation package's track
    // rows use. Changing the default would silently re-space every existing listing.
    expect(ROW_HEIGHT[Size.Md]).toBe("h-9");
    expect(renderToStaticMarkup(<TreeRow depth={0} label={<span>x</span>} />)).toContain("h-9");
    expect(
      renderToStaticMarkup(<ListRow columns={[{ key: "a" }]} cells={[<span key="a">x</span>]} />),
    ).toContain("h-9");
  });

  it("keeps the px estimates in step with the classes they stand for", () => {
    // The estimates are the `rem` classes resolved at a 16px root. If a class changes and
    // the number does not, a windowed list's spacers describe rows that no longer exist at
    // that height — so the relationship is asserted rather than assumed.
    const remOfClass: Record<string, number> = {
      "h-6": 1.5,
      "h-8": 2,
      "h-9": 2.25,
      "h-11": 2.75,
      "h-13": 3.25,
    };
    for (const size of SIZES) {
      const rem = remOfClass[ROW_HEIGHT[size]];
      expect(rem, `no rem known for ${ROW_HEIGHT[size]}`).toBeDefined();
      expect(ROW_HEIGHT_PX[size]).toBe(rem * 16);
    }
  });
});
