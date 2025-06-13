import { useCallback, useRef, useState } from "react";
import {
  type Node,
  type Edge,
  addEdge,
  Background,
  type Connection,
  Controls,
  useNodesState,
  useEdgesState,
  type NodeTypes,
  type EdgeTypes,
  ReactFlowProvider,
  useReactFlow,
  ReactFlow,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./CustomNode";
import { GroupNode } from "./GroupNode";
import { DraggableEdge } from "./DraggableEdge";
import { SimpleEdge } from "./SimpleEdge";
import { initialNodes, initialEdges } from "./initialData";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  group: GroupNode,
};

const edgeTypes: EdgeTypes = {
  draggable: DraggableEdge,
  simple: SimpleEdge,
};

function FlowDiagram() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [edgeType, setEdgeType] = useState<"draggable" | "simple">("draggable");
  const proximityThreshold = 100;
  const connectTimeoutRef = useRef<number>();

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      console.log("Connection params:", params);
      return setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: edgeType,
            data: { label: "new connection" },
          },
          eds,
        ),
      );
    },
    [setEdges, edgeType],
  );

  // can handle Proximity connection logic
  // can handle helper lines logic
  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setDraggedNode(node.id);

      // Clear existing timeout
      if (connectTimeoutRef.current) {
        clearTimeout(connectTimeoutRef.current);
      }

      // Check proximity to other nodes (excluding group nodes)
      connectTimeoutRef.current = setTimeout(() => {
        const otherNodes = nodes.filter(
          (n) => n.id !== node.id && n.type !== "group",
        );

        otherNodes.forEach((otherNode) => {
          const distance = Math.sqrt(
            Math.pow(node.position.x - otherNode.position.x, 2) +
              Math.pow(node.position.y - otherNode.position.y, 2),
          );

          if (distance < proximityThreshold) {
            // Check if connection already exists
            const connectionExists = edges.some(
              (edge) =>
                (edge.source === node.id && edge.target === otherNode.id) ||
                (edge.source === otherNode.id && edge.target === node.id),
            );

            if (!connectionExists) {
              const newEdge: Edge = {
                id: `proximity-${node.id}-${otherNode.id}`,
                source: node.id,
                target: otherNode.id,
                type: edgeType,
                data: { label: "auto-connected" },
                className: "stroke-green-500",
              };
              setEdges((eds) => [...eds, newEdge]);
            }
          }
        });
      }, 500);
    },
    [nodes, edges, setEdges, edgeType],
  );

  const handleNodeDragStop = useCallback(() => {
    setDraggedNode(null);
    if (connectTimeoutRef.current) {
      clearTimeout(connectTimeoutRef.current);
    }
  }, []);

  // Add new node function
  const addNode = useCallback(() => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: "custom",
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `Node ${nodes.filter((n) => n.type === "custom").length + 1}`,
        description: "New node",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [nodes, setNodes]);

  // Add new group function
  const addGroup = useCallback(() => {
    const newGroup: Node = {
      id: `group-${Date.now()}`,
      type: "group",
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      data: {
        label: `Group ${nodes.filter((n) => n.type === "group").length + 1}`,
        description: "New group container",
      },
      style: {
        width: 250,
        height: 180,
      },
    };
    setNodes((nds) => [...nds, newGroup]);
  }, [nodes, setNodes]);

  return (
    <div className="h-screen w-full bg-gray-50">
      <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2 space-x-2">
        <button
          onClick={addNode}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-blue-600"
        >
          Add Node
        </button>
        <button
          onClick={addGroup}
          className="rounded-lg bg-purple-500 px-4 py-2 text-white shadow-lg transition-colors hover:bg-purple-600"
        >
          Add Group
        </button>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">
            Edge Type:
          </label>
          <select
            value={edgeType}
            onChange={(e) =>
              setEdgeType(e.target.value as "draggable" | "simple")
            }
            className="rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="draggable">Draggable (Orthogonal)</option>
            <option value="simple">Simple (Bezier)</option>
          </select>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
        defaultEdgeOptions={{
          type: edgeType,
        }}
      >
        <Controls className="border border-gray-200 bg-white shadow-lg" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-gray-100"
          color="#d1d5db"
        />
      </ReactFlow>
    </div>
  );
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <FlowDiagram />
    </ReactFlowProvider>
  );
}
