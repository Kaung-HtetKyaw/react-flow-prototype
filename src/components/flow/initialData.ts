import { type Node, type Edge } from "@xyflow/react";

export const initialNodes: Node[] = [
  // Root level nodes
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 100 },
    data: { label: "Node 0", description: "Root node" },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 400, y: 100 },
    data: { label: "Node 1", description: "Another root node" },
  },

  // Group A
  {
    id: "group-a",
    type: "group",
    position: { x: 50, y: 200 },
    data: { label: "kube-system", description: "Container for A nodes" },
    style: {
      width: 500,
      height: 700,
      // border: "1px solid rgba(255,255,255,1)",
      borderRadius: "8px",
      // backgroundColor: "rgba(255,255,255,0.5)",
      padding: "0px",
    },
  },
  {
    id: "a1",
    type: "custom",
    position: { x: 20, y: 50 },
    data: { label: "Node A.1", description: "Child of Group A" },
    parentId: "group-a",
    extent: "parent" as const,
  },

  // Group B with nested structure
  {
    id: "group-b",
    type: "group",
    position: { x: 700, y: 200 },
    data: { label: "kube-ai", description: "Container for B nodes" },
    style: {
      width: 500,
      height: 700,
      borderRadius: "8px",
      // border: "1px solid rgba(255,255,255,1)",
      // backgroundColor: "rgba(255,255,255,0.5)",
      padding: "0px",
    },
  },
  {
    id: "b1",
    type: "custom",
    position: { x: 20, y: 50 },
    data: { label: "Node B.1", description: "Child of Group B" },
    parentId: "group-b",
    extent: "parent" as const,
  },

  // Nested Group B.A inside Group B
  {
    id: "group-ba",
    type: "group",
    position: { x: 100, y: 150 },
    data: { label: "kube-ctl", description: "Nested group" },
    parentId: "group-b",
    extent: "parent" as const,
    style: {
      width: 300,
      height: 400,
      // backgroundColor: "rgba(147, 51, 234, 0.1)",
    },
  },
  {
    id: "ba1",
    type: "custom",
    position: { x: 20, y: 40 },
    data: { label: "Node B.A.1", description: "Nested child" },
    parentId: "group-ba",
    extent: "parent" as const,
  },
  {
    id: "ba2",
    type: "custom",
    position: { x: 120, y: 80 },
    data: { label: "Node B.A.2", description: "Another nested child" },
    parentId: "group-ba",
    extent: "parent" as const,
  },
];

export const initialEdges: Edge[] = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    type: "draggable",
    data: { label: "draggable edge" },
  },
  {
    id: "e1-a1",
    source: "1",
    target: "a1",
    type: "simple",
    data: { label: "simple edge" },
  },
  {
    id: "e2-b1",
    source: "2",
    target: "b1",
    type: "draggable",
    data: { label: "to group B" },
  },
  {
    id: "eb1-ba1",
    source: "b1",
    target: "ba1",
    type: "draggable",
    data: { label: "nested" },
  },
  {
    id: "eba1-ba2",
    source: "ba1",
    target: "ba2",
    type: "simple",
    data: { label: "internal" },
  },
];
