import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TreeIndent } from "./tree-indent";
import { TreeToggle } from "./tree-toggle";
import { TreeRow } from "./tree-row";

describe("TreeIndent", () => {
  it("widens by one slot per depth level", () => {
    const d0 = renderToStaticMarkup(<TreeIndent depth={0} slotWidth={24} />);
    const d2 = renderToStaticMarkup(<TreeIndent depth={2} slotWidth={24} />);
    expect(d0).toContain("width:24px");
    expect(d2).toContain("width:72px");
  });

  it("draws a guide-line per ancestor by default", () => {
    const html = renderToStaticMarkup(<TreeIndent depth={2} />);
    expect(html.match(/w-px/g) ?? []).toHaveLength(2);
  });

  it("suppresses guide-lines for last-child ancestors", () => {
    // ancestor 0 is last (no guide), ancestor 1 is not last (guide) → 1 line
    const html = renderToStaticMarkup(<TreeIndent depth={2} ancestorIsLast={[true, false]} />);
    expect(html.match(/w-px/g) ?? []).toHaveLength(1);
  });
});

describe("TreeToggle", () => {
  it("reflects expanded state via aria-expanded", () => {
    const open = renderToStaticMarkup(<TreeToggle expanded onToggle={vi.fn()} />);
    const closed = renderToStaticMarkup(<TreeToggle expanded={false} onToggle={vi.fn()} />);
    expect(open).toContain('aria-expanded="true"');
    expect(closed).toContain('aria-expanded="false"');
    expect(closed).toContain("-rotate-90");
  });

  it("is disabled and inert when no onToggle is supplied", () => {
    const html = renderToStaticMarkup(<TreeToggle expanded />);
    expect(html).toContain("disabled");
  });

  it("always has an accessible name, defaulting to Expand/Collapse", () => {
    const collapsed = renderToStaticMarkup(<TreeToggle expanded={false} onToggle={vi.fn()} />);
    const open = renderToStaticMarkup(<TreeToggle expanded onToggle={vi.fn()} />);
    expect(collapsed).toContain('aria-label="Expand"');
    expect(open).toContain('aria-label="Collapse"');
  });

  it("prefers a caller name, and defers to aria-labelledby over aria-label", () => {
    const named = renderToStaticMarkup(
      <TreeToggle expanded onToggle={vi.fn()} ariaLabel="Collapse color" ariaControls="grp1" />,
    );
    expect(named).toContain('aria-label="Collapse color"');
    expect(named).toContain('aria-controls="grp1"');

    const labelled = renderToStaticMarkup(
      <TreeToggle expanded onToggle={vi.fn()} ariaLabel="ignored" ariaLabelledBy="lbl1" />,
    );
    expect(labelled).toContain('aria-labelledby="lbl1"');
    expect(labelled).not.toContain("aria-label=");
  });
});

describe("TreeRow", () => {
  it("renders label, editor, and actions slots", () => {
    const html = renderToStaticMarkup(
      <TreeRow
        depth={1}
        label={<span>color</span>}
        editor={<span>picker</span>}
        actions={<button type="button">menu</button>}
      />,
    );
    expect(html).toContain("color");
    expect(html).toContain("picker");
    expect(html).toContain("menu");
  });

  it("omits the editor and actions containers when those slots are absent", () => {
    // A group row with no editor (orthogonal: has a toggle icon, no editor).
    const html = renderToStaticMarkup(<TreeRow depth={0} label={<span>group</span>} />);
    expect(html).toContain("group");
    // Only the label wrapper should carry flex-1; no trailing shrink-0 editor slot.
    expect(html).not.toContain("picker");
  });

  it("paints the resolved bar and background colors", () => {
    const html = renderToStaticMarkup(
      <TreeRow depth={0} label={<span>x</span>} visual={{ bar: "red", background: "blue" }} />,
    );
    expect(html).toContain("background-color:red");
    expect(html).toContain("background-color:blue");
  });

  it("asserts no ARIA role by default, but applies the opt-in tree seams", () => {
    const plain = renderToStaticMarkup(<TreeRow depth={0} label={<span>x</span>} />);
    expect(plain).not.toContain("role=");
    expect(plain).not.toContain("aria-level");

    const treeItem = renderToStaticMarkup(
      <TreeRow depth={1} label={<span>x</span>} role="treeitem" ariaLevel={2} ariaExpanded ariaSelected={false} />,
    );
    expect(treeItem).toContain('role="treeitem"');
    expect(treeItem).toContain('aria-level="2"');
    expect(treeItem).toContain('aria-expanded="true"');
    expect(treeItem).toContain('aria-selected="false"');
  });
});
