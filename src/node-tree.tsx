import { useState, ReactNode } from "react";
import { DisclosureIcon } from "./icons/registry";

type NodeMap = Record<string, any>;

interface TreeProps {
  node: any;
  nodeMap: NodeMap;
  indentLevel?: number;
  renderNode: (node: any) => ReactNode;
}

/**
 * Renders a tree component.
 *
 * @param node - The current node to render.
 * @param nodeMap - A map of all nodes in the tree.
 * @param indentLevel - The level of indentation for the current node.
 * @param renderNode - A function that renders the content of each node.
 * @returns The rendered tree component.
 */
function Tree({ node, nodeMap, indentLevel = 0, renderNode }: TreeProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  if (!node) {
    return null;
  }

  const isCollapsed = collapsedNodes.has(node.id as string);

  const toggleCollapse = () => {
    setCollapsedNodes((prevCollapsedNodes) => {
      const newCollapsedNodes = new Set(prevCollapsedNodes);
      if (newCollapsedNodes.has(node.id as string)) {
        newCollapsedNodes.delete(node.id as string);
      } else {
        newCollapsedNodes.add(node.id as string);
      }
      return newCollapsedNodes;
    });
  };

  return (
    <>
      <div className="flex flex-row items-center text-neutral-700 dark:text-neutral-300">
        <button type="button" onClick={toggleCollapse} style={{ cursor: "pointer" }}>
          <DisclosureIcon open={!isCollapsed} className="size-4 mr-2" />
        </button>
        {renderNode({ item: node })}
      </div>

      <div style={{ marginLeft: indentLevel }}>
        {isCollapsed && <div className="border border-neutral-500" />}
        {!isCollapsed &&
          node.children?.map((childId: string) => (
            <Tree
              key={childId}
              node={nodeMap[childId]}
              nodeMap={nodeMap}
              indentLevel={indentLevel + 1}
              renderNode={renderNode}
            />
          ))}
      </div>
    </>
  );
}

/**
 * Remaps the children of a node list to create a node map.
 *
 * Nodes are expected to have an `id` field and either a `children` or a `child` and `parent` field.
 *
 * @param nodeList - The list of nodes to remap.
 * @returns The remapped node map using just the `children` field.
 */
function remapChildren(nodeList: any[]): NodeMap {
  const nodes: NodeMap = {};
  nodeList.forEach((node) => {
    nodes[node.id] = { children: [], ...node };
  });

  nodeList.forEach((node) => {
    if (node.child) {
      if (!nodes[node.id].children) {
        nodes[node.id].children = [];
        (nodes[node.id].children as string[]).push(node.child as string);
      } else {
        nodes[node.id].children = [...nodes[node.id].children, node.child];
      }
    }
    if (node.parent) {
      if (!nodes[node.parent].children) {
        nodes[node.parent].children = [];
        (nodes[node.parent].children as string[]).push(node.id as string);
      } else {
        nodes[node.parent].children = [...nodes[node.parent].children, node.id];
      }
    }
  });
  return nodes;
}

/**
 * Renders a tree of nodes.
 *
 * @deprecated Superseded by the `tree/` primitives (`flattenTree`,
 * `useCollapsibleTree`, `TreeRow`, `TreeIndent`, `TreeToggle`). This
 * `any`-typed recursive tree predates them and has no current consumers;
 * prefer the typed primitives for new hierarchical lists. Slated for removal
 * once nothing references it.
 *
 * @param nodeList - The list of nodes to render.
 * @param renderNode - The function that renders each individual node.
 * @returns The rendered tree component.
 */
export function NodeTree({
  nodeList,
  renderNode,
}: {
  nodeList: any[];
  renderNode: (node: any) => ReactNode;
}) {
  const root = nodeList.find((node) => node.root); // TODO: turn into a selector for the root
  const rootId = root?.id ?? nodeList[0].id;
  const nodeMap = remapChildren(nodeList);

  return <Tree node={nodeMap[rootId]} nodeMap={nodeMap} renderNode={renderNode} />;
}
