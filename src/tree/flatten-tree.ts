/**
 * Tree → flat-row-list flattening for hierarchical, collapsible lists.
 *
 * This is the shared structural core behind hierarchical row lists (animation
 * track/control lists, the live-data table). It turns a nested tree into the
 * ordered, depth-annotated row list a renderer maps over, honoring per-group
 * collapse. It is intentionally presentation-agnostic: it knows nothing about
 * the payload `T` a consumer renders in each row.
 */

export interface TreeNode<T> {
  /** Stable identifier, unique within the tree. Used for React keys, collapse
   *  state, and ancestor bookkeeping. */
  id: string;
  /** Consumer payload rendered by the row. */
  data: T;
  /**
   * Child nodes. A node with children is a "group". Note that being a group
   * and having its own editable value are independent: a group node may still
   * carry a value/editor of its own (e.g. a `color` node that both expands to
   * `color.r/g/b` and offers an aggregate color-picker). This flattener never
   * treats the two as mutually exclusive — the payload `T` decides.
   */
  children?: TreeNode<T>[];
}

export interface FlatTreeRow<T> {
  id: string;
  data: T;
  /** Nesting depth; 0 = top level. */
  depth: number;
  /** True when the node has at least one child. */
  isGroup: boolean;
  /** For groups: whether children are shown. Always `false` for leaves. */
  expanded: boolean;
  /**
   * Root-to-parent flags, length === `depth`. `ancestorIsLast[k]` is true when
   * the ancestor at depth `k` is the last child among its siblings — i.e. no
   * continuation guide-line should be drawn at that level. Mirrors the
   * animation package's `computeAncestorIsLast` contract.
   */
  ancestorIsLast: boolean[];
}

export interface FlattenTreeOptions {
  /** Return true if the group with this id is collapsed (children hidden). */
  isCollapsed?: (id: string) => boolean;
}

/**
 * Flatten `roots` into an ordered list of visible rows. Collapsed groups keep
 * their own row but omit their descendants.
 */
export function flattenTree<T>(
  roots: TreeNode<T>[],
  options: FlattenTreeOptions = {},
): FlatTreeRow<T>[] {
  const isCollapsed = options.isCollapsed ?? (() => false);
  const rows: FlatTreeRow<T>[] = [];

  const walk = (nodes: TreeNode<T>[], depth: number, ancestorIsLast: boolean[]) => {
    nodes.forEach((node, index) => {
      const children = node.children ?? [];
      const isGroup = children.length > 0;
      const collapsed = isGroup && isCollapsed(node.id);
      rows.push({
        id: node.id,
        data: node.data,
        depth,
        isGroup,
        expanded: isGroup && !collapsed,
        ancestorIsLast,
      });
      if (isGroup && !collapsed) {
        const isLastChild = index === nodes.length - 1;
        walk(children, depth + 1, [...ancestorIsLast, isLastChild]);
      }
    });
  };

  walk(roots, 0, []);
  return rows;
}
