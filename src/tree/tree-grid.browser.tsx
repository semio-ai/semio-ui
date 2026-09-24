import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";
import { userEvent } from "vitest/browser";
import { TreeGrid } from "./tree-grid";
import type { TreeNode } from "./flatten-tree";

interface Row {
  label: string;
}

const tree: TreeNode<Row>[] = [
  {
    id: "head",
    data: { label: "head" },
    children: [
      { id: "head/pitch", data: { label: "pitch" } },
      { id: "head/yaw", data: { label: "yaw" } },
    ],
  },
  { id: "root", data: { label: "root" } },
];

const renderLabel = (row: { data: Row }) => <span>{row.data.label}</span>;

function Grid(props: { onSelectionChange?: (s: Set<string>) => void }) {
  return (
    <TreeGrid
      nodes={tree}
      ariaLabel="test tree"
      getLabel={renderLabel}
      onSelectionChange={props.onSelectionChange}
    />
  );
}

const sorted = (set: Set<string>) => [...set].sort((a, b) => a.localeCompare(b));

const treeitems = () => document.querySelectorAll('[role="treeitem"]');
const labels = () => [...treeitems()].map((el) => el.textContent?.trim());

test("renders the flattened tree with levels and an expandable group", async () => {
  await render(<Grid />);
  expect(labels()).toEqual(["head", "pitch", "yaw", "root"]);
  const head = treeitems()[0];
  expect(head.getAttribute("aria-level")).toBe("1");
  expect(head.getAttribute("aria-expanded")).toBe("true");
  expect(treeitems()[1].getAttribute("aria-level")).toBe("2");
});

test("Left collapses the focused group and Right expands it", async () => {
  await render(<Grid />);
  await userEvent.click(document.querySelectorAll('[role="treeitem"]')[0] as HTMLElement);

  await userEvent.keyboard("{ArrowLeft}");
  expect(labels()).toEqual(["head", "root"]); // children hidden
  expect(treeitems()[0].getAttribute("aria-expanded")).toBe("false");

  await userEvent.keyboard("{ArrowRight}");
  expect(labels()).toEqual(["head", "pitch", "yaw", "root"]);
});

test("click selects a row; ArrowDown moves focus without selecting; Space selects the focused row", async () => {
  const onSelectionChange = vi.fn();
  await render(<Grid onSelectionChange={onSelectionChange} />);

  await userEvent.click(treeitems()[0] as HTMLElement); // select 'head'
  expect([...onSelectionChange.mock.lastCall![0]]).toEqual(["head"]);

  onSelectionChange.mockClear();
  await userEvent.keyboard("{ArrowDown}"); // focus 'pitch', no selection change
  expect(onSelectionChange).not.toHaveBeenCalled();
  expect(document.activeElement?.getAttribute("aria-level")).toBe("2");

  await userEvent.keyboard(" "); // Space selects the focused row
  expect([...onSelectionChange.mock.lastCall![0]]).toEqual(["head/pitch"]);
});

test("Ctrl+Space toggles selection membership", async () => {
  const onSelectionChange = vi.fn();
  await render(<Grid onSelectionChange={onSelectionChange} />);

  await userEvent.click(treeitems()[1] as HTMLElement); // select 'pitch'
  await userEvent.keyboard("{ArrowDown}"); // focus 'yaw'
  await userEvent.keyboard("{Control>} {/Control}"); // Ctrl+Space → add 'yaw'
  expect(sorted(onSelectionChange.mock.lastCall![0])).toEqual(["head/pitch", "head/yaw"]);
});

test("leaf rows get a default icon in the reserved slot", async () => {
  await render(<Grid />);
  // head/pitch, head/yaw, root are leaves → 3 default dots (the head group gets a chevron).
  expect(document.querySelectorAll(".tree-leaf-dot").length).toBe(3);
});

test("defaultLeafIcon={null} suppresses the leaf icon for bare labels", async () => {
  await render(<TreeGrid nodes={tree} ariaLabel="bare" getLabel={renderLabel} defaultLeafIcon={null} />);
  expect(document.querySelectorAll(".tree-leaf-dot").length).toBe(0);
});

// `tree` = head[pitch,yaw] + root. `head` is NOT the last root-level node
// (root follows), so pitch's guides don't reveal the last-child rule. Use a
// nested tree where the deepest branch hangs off a LAST child.
const nested: TreeNode<Row>[] = [
  {
    id: "a",
    data: { label: "a" },
    children: [
      {
        id: "a/b",
        data: { label: "b" },
        children: [{ id: "a/b/c", data: { label: "c" } }],
      },
    ],
  },
];

test("guideLines='full' (default) draws a guide in every indentation column", async () => {
  await render(<TreeGrid nodes={nested} ariaLabel="full" getLabel={renderLabel} />);
  // 'c' is at depth 2 → 2 ancestor columns, both ruled regardless of last-child.
  const c = [...document.querySelectorAll('[role="treeitem"]')].find(
    (r) => r.textContent?.includes("c"),
  )!;
  expect(c.querySelectorAll(".w-px").length).toBe(2);
});

test("guideLines='last-child' omits the continuation below last-child ancestors", async () => {
  await render(<TreeGrid nodes={nested} ariaLabel="lc" getLabel={renderLabel} guideLines="last-child" />);
  // 'a' and 'a/b' are each their parent's last child → both continuation lines
  // are omitted, so 'c' shows no guides.
  const c = [...document.querySelectorAll('[role="treeitem"]')].find(
    (r) => r.textContent?.includes("c"),
  )!;
  expect(c.querySelectorAll(".w-px").length).toBe(0);
});

test("Shift+Space extends a range from the anchor", async () => {
  const onSelectionChange = vi.fn();
  await render(<Grid onSelectionChange={onSelectionChange} />);

  await userEvent.click(treeitems()[1] as HTMLElement); // anchor 'pitch'
  await userEvent.keyboard("{ArrowDown}"); // focus 'yaw'
  await userEvent.keyboard("{ArrowDown}"); // focus 'root'
  await userEvent.keyboard("{Shift>} {/Shift}"); // Shift+Space → pitch..root
  expect(sorted(onSelectionChange.mock.lastCall![0])).toEqual(["head/pitch", "head/yaw", "root"]);
});
