import type { Edge, Node } from '@xyflow/react';
import type { KnowledgeFlowNodeData } from '../components/KnowledgeFlowNode';

const NODE_WIDTH_STEP = 420;
const NODE_HEIGHT_STEP = 380;

/**
 * Computes a clean top-down hierarchical tree layout for inquiry nodes
 * without requiring an external heavy graph layout library.
 */
export function layoutInquiryTree(
  nodes: Node<KnowledgeFlowNodeData>[],
  edges: Edge[],
): Node<KnowledgeFlowNodeData>[] {
  if (nodes.length === 0) return nodes;

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const childrenMap = new Map<string, string[]>();
  const hasParent = new Set<string>();

  for (const edge of edges) {
    if (!nodeById.has(edge.source) || !nodeById.has(edge.target)) continue;
    const list = childrenMap.get(edge.source) ?? [];
    if (!list.includes(edge.target)) {
      list.push(edge.target);
      childrenMap.set(edge.source, list);
    }
    hasParent.add(edge.target);
  }

  // Fallback to parentNodeId if edge was not yet created
  for (const node of nodes) {
    const pid = node.data.parentNodeId;
    if (pid && nodeById.has(pid)) {
      const list = childrenMap.get(pid) ?? [];
      if (!list.includes(node.id)) {
        list.push(node.id);
        childrenMap.set(pid, list);
      }
      hasParent.add(node.id);
    }
  }

  const roots = nodes.filter((n) => !hasParent.has(n.id)).map((n) => n.id);
  if (roots.length === 0) {
    roots.push(nodes[0].id);
  }

  const visited = new Set<string>();
  const subtreeSpan = new Map<string, number>();

  const measureSpan = (id: string): number => {
    if (visited.has(id)) return 1;
    visited.add(id);
    const kids = (childrenMap.get(id) ?? []).filter((kid) => !visited.has(kid));
    if (kids.length === 0) {
      subtreeSpan.set(id, 1);
      return 1;
    }
    const total = kids.reduce((sum, kid) => sum + measureSpan(kid), 0);
    subtreeSpan.set(id, Math.max(1, total));
    return Math.max(1, total);
  };

  for (const rootId of roots) {
    measureSpan(rootId);
  }

  const positioned = new Map<string, { x: number; y: number }>();
  const placed = new Set<string>();

  const assignCoords = (id: string, leftSlot: number, depth: number) => {
    if (placed.has(id)) return;
    placed.add(id);

    const kids = (childrenMap.get(id) ?? []).filter((kid) => !placed.has(kid));
    const span = subtreeSpan.get(id) ?? 1;

    // Place node centered above its subtree span
    const centerSlot = leftSlot + (span - 1) / 2;
    positioned.set(id, {
      x: Math.round(centerSlot * NODE_WIDTH_STEP),
      y: 24 + depth * NODE_HEIGHT_STEP,
    });

    let cursor = leftSlot;
    for (const kid of kids) {
      const kidSpan = subtreeSpan.get(kid) ?? 1;
      assignCoords(kid, cursor, depth + 1);
      cursor += kidSpan;
    }
  };

  let nextRootSlot = 0;
  for (const rootId of roots) {
    assignCoords(rootId, nextRootSlot, 0);
    nextRootSlot += (subtreeSpan.get(rootId) ?? 1) + 0.5;
  }

  // Handle any disconnected nodes gracefully
  for (const node of nodes) {
    if (!positioned.has(node.id)) {
      positioned.set(node.id, {
        x: Math.round(nextRootSlot * NODE_WIDTH_STEP),
        y: 24,
      });
      nextRootSlot += 1;
    }
  }

  return nodes.map((node) => ({
    ...node,
    position: positioned.get(node.id) ?? node.position,
  }));
}

/**
 * Returns the ancestor-to-selected ordered chain of node IDs for breadcrumb & path highlighting.
 */
export function getActivePathIds(
  selectedNodeId: string | null,
  nodes: Node<KnowledgeFlowNodeData>[],
): string[] {
  if (!selectedNodeId) return [];
  const map = new Map(nodes.map((n) => [n.id, n]));
  const chain: string[] = [];
  const seen = new Set<string>();

  let currentId: string | null = selectedNodeId;
  while (currentId && map.has(currentId) && !seen.has(currentId)) {
    seen.add(currentId);
    chain.unshift(currentId);
    currentId = map.get(currentId)?.data.parentNodeId ?? null;
  }

  return chain;
}

/**
 * Creates a styled TATTVA graph edge connecting parent -> child question node.
 */
export function createInquiryEdge(source: string, target: string, label?: string): Edge {
  return {
    id: `e-${source}-${target}`,
    source,
    target,
    type: 'smoothstep',
    label,
    animated: false,
    style: { stroke: '#c59a67', strokeWidth: 1.8 },
    labelStyle: { fontSize: 10, fontWeight: 700, fill: '#c59a67', fontFamily: 'monospace' },
    labelBgStyle: { fill: '#13161b', stroke: '#c59a67', strokeWidth: 0.8 },
    labelBgPadding: [6, 3],
    labelBgBorderRadius: 4,
  };
}
