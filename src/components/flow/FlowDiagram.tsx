/* eslint-disable @typescript-eslint/ban-ts-comment */
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
  OnMove,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "./CustomNode";
import { GroupNode } from "./GroupNode";
import { DraggableEdge } from "./DraggableEdge";
import { SimpleEdge } from "./SimpleEdge";
import { initialDiagramData, initialDiagramEdges } from "./initialData";
import { clustersDataset } from "@/dataset/clusters";
import {
  getClusterHierarchyFromDataset,
  getNamespaceHierarchyFromDataset,
  getPodHierarchyFromDataset,
} from "@/utils/getClusterHierarchyFromDataset";
import {
  getFlatVisualizationNodes,
  getVisualizationNodeForPod,
  getVisualizationNodesForClusterList,
  getVisualizationNodesForNamespaceList,
  getVisualizationNodesForPodList,
} from "@/utils/getVisualizationNodesFromCluster";
import { VisualizationNode } from "@/dataset/types";
import { namespacesDataset } from "@/dataset/namespaces";
import { podsDataset } from "@/dataset/pods";
import {
  getVisualizationEdgeBaseStyle,
  getVisualizationEdges,
} from "@/utils/getVisualizationEdges";

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  // @ts-ignore
  group: GroupNode,
};

const edgeTypes: EdgeTypes = {
  draggable: DraggableEdge,
  simple: SimpleEdge,
};

function FlowDiagram({
  visualizationNodes,
  visualizationEdges,
}: {
  visualizationNodes: VisualizationNode[];
  visualizationEdges: Edge[];
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(visualizationNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(visualizationEdges);
  // const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [edgeType, setEdgeType] = useState<"draggable" | "simple">("simple");
  const proximityThreshold = 100;
  const connectTimeoutRef = useRef<number>();
  const previousZoom = useRef<number>(0);
  const reactFlowInstance = useReactFlow();
  const [zoomedInGroups, setZoomedInGroups] = useState<Node[]>([]);

  const onConnect = useCallback(
    (params: Edge | Connection) => {
      console.log("Connection params:", params);
      // @ts-ignore
      return setEdges((eds) =>
        addEdge(
          {
            ...params,
            data: { label: "new connection" },
            ...getVisualizationEdgeBaseStyle("cluster"),
          },
          eds,
        ),
      );
    },
    [setEdges],
  );

  // can handle Proximity connection logic
  // can handle helper lines logic
  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setDraggedNode(node.id);

      // // Clear existing timeout
      // if (connectTimeoutRef.current) {
      //   clearTimeout(connectTimeoutRef.current);
      // }

      // // Check proximity to other nodes (excluding group nodes)
      // connectTimeoutRef.current = setTimeout(() => {
      //   const otherNodes = nodes.filter(
      //     (n) => n.id !== node.id && n.type !== "group",
      //   );

      //   otherNodes.forEach((otherNode) => {
      //     const distance = Math.sqrt(
      //       Math.pow(node.position.x - otherNode.position.x, 2) +
      //         Math.pow(node.position.y - otherNode.position.y, 2),
      //     );

      //     if (distance < proximityThreshold) {
      //       // Check if connection already exists
      //       const connectionExists = edges.some(
      //         (edge) =>
      //           // @ts-ignore
      //           (edge.source === node.id && edge.target === otherNode.id) ||
      //           // @ts-ignore
      //           (edge.source === otherNode.id && edge.target === node.id),
      //       );

      //       if (!connectionExists) {
      //         const newEdge: Edge = {
      //           id: `proximity-${node.id}-${otherNode.id}`,
      //           source: node.id,
      //           target: otherNode.id,
      //           type: edgeType,
      //           data: { label: "auto-connected" },
      //           className: "stroke-green-500",
      //         };
      //         // @ts-ignore
      //         setEdges((eds) => [...eds, newEdge]);
      //       }
      //     }
      //   });
      // }, 500);
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
  // const addNode = useCallback(() => {
  //   const newNode: Node = {
  //     id: `node-${Date.now()}`,
  //     type: "custom",
  //     position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
  //     data: {
  //       label: `Node ${nodes.filter((n) => n.type === "custom").length + 1}`,
  //       description: "New node",
  //     },
  //   };
  //   setNodes((nds) => [...nds, newNode]);
  // }, [nodes, setNodes]);

  // Add new group function
  // const addGroup = useCallback(() => {
  //   const newGroup: Node = {
  //     id: `group-${Date.now()}`,
  //     type: "group",
  //     position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
  //     data: {
  //       label: `Group ${nodes.filter((n) => n.type === "group").length + 1}`,
  //       description: "New group container",
  //     },
  //     style: {
  //       width: 250,
  //       height: 180,
  //     },
  //   };
  //   setNodes((nds) => [...nds, newGroup]);
  // }, [nodes, setNodes]);

  // const onMove: OnMove = (event, viewport) => {
  //   if (event instanceof MouseEvent) {
  //     const centerPosition = reactFlowInstance.screenToFlowPosition({
  //       x: event.clientX,
  //       y: event.clientY,
  //     });

  //     // Create a small rectangle around the cursor position
  //     const searchArea = {
  //       x: centerPosition.x - 10,
  //       y: centerPosition.y - 10,
  //       width: 20,
  //       height: 20,
  //     };

  //     const intersectingNodes = reactFlowInstance.getIntersectingNodes(
  //       searchArea,
  //       false,
  //     );

  //     setZoomedInGroups(
  //       intersectingNodes.filter((node) => node.type === "group"),
  //     );
  //   }
  //   previousZoom.current = viewport.zoom;
  // };
  console.log(edges);
  return (
    <div className="h-screen w-full bg-gray-50">
      {zoomedInGroups.length > 0 && (
        <div className="flex flex-col items-center bg-white">
          <h3 className="mb-[10px] text-[20px] font-bold text-black">
            You zoomed in on these groups:
          </h3>
          <ul className="flex flex-col gap-2 text-black">
            {zoomedInGroups.map((group) => (
              <li key={group.id}>
                <span>Querying for: </span>
                <span>{group.data.label as string}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

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
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        className="bg-white"
        defaultEdgeOptions={{
          type: edgeType,
          zIndex: 1000,
          style: {
            stroke: "black",
          },
        }}
      >
        <Controls className="border border-gray-200 bg-white shadow-lg" />
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          className="bg-white"
          color="#d1d5db"
        />
      </ReactFlow>
    </div>
  );
}

export default function Page() {
  const clusterDataset = clustersDataset
    .map((el) => getClusterHierarchyFromDataset(el.id))
    .filter((el) => !!el && el !== null);

  const visualizationNodes = getFlatVisualizationNodes(
    getVisualizationNodesForClusterList(clusterDataset),
  );

  const visualizationEdges = getVisualizationEdges();

  return (
    <ReactFlowProvider>
      <FlowDiagram
        visualizationNodes={visualizationNodes}
        visualizationEdges={visualizationEdges}
      />
    </ReactFlowProvider>
  );
}
