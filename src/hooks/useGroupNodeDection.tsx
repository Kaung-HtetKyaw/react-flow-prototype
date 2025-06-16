import { useRef, useCallback, useState } from "react";
import {
  Node,
  ReactFlowInstance,
  useReactFlow,
  useStore,
  Viewport,
  XYPosition,
} from "@xyflow/react";
import { GroupNodeData } from "@/components/flow/GroupNode";

interface UseGroupNodeDetectionReturn {
  detectGroupAtPosition: (
    flowPosition: XYPosition,
    includeNested?: boolean,
  ) => Node<GroupNodeData> | null;
  detectZoomTargetGroup: (
    event: MouseEvent | TouchEvent | null,
    viewport: Viewport,
  ) => Node<GroupNodeData> | null;
  getGroupChildren: (
    groupId: string,
    includeNestedChildren?: boolean,
  ) => Node[];
  getIntersectingGroups: (
    node: Node,
    partially?: boolean,
  ) => Node<GroupNodeData>[];
  isNodeInGroup: (nodeId: string, groupId: string) => boolean;
  findAbsolutePosition: (currentNode: Node, allNodes: Node[]) => XYPosition;
  getNodeDepth: (node: Node, allNodes: Node[]) => number;
  lastZoomTarget: Node<GroupNodeData> | null;
  currentZoom: number;
}

interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const useGroupNodeDetection = (): UseGroupNodeDetectionReturn => {
  const reactFlowInstance: ReactFlowInstance = useReactFlow();
  const previousZoom = useRef<number>(1);
  const [lastZoomTarget, setLastZoomTarget] =
    useState<Node<GroupNodeData> | null>(null);

  // Get current nodes from store
  const nodes: Node[] = useStore((state) => state.nodes);
  const currentZoom: number = useStore((state) => state.transform[2]);

  // Helper function to find absolute position of nested nodes
  const findAbsolutePosition = useCallback(
    (currentNode: Node, allNodes: Node[]): XYPosition => {
      if (!currentNode?.parentId) {
        return { x: currentNode.position.x, y: currentNode.position.y };
      }

      const parentNode: Node | undefined = allNodes.find(
        (n) => n.id === currentNode.parentId,
      );
      if (!parentNode) {
        return { x: currentNode.position.x, y: currentNode.position.y };
      }

      const parentPosition: XYPosition = findAbsolutePosition(
        parentNode,
        allNodes,
      );
      return {
        x: parentPosition.x + currentNode.position.x,
        y: parentPosition.y + currentNode.position.y,
      };
    },
    [],
  );

  // Detect group nodes at a specific position
  const detectGroupAtPosition = useCallback(
    (
      flowPosition: XYPosition,
      includeNested = true,
    ): Node<GroupNodeData> | null => {
      const groupNodes: Node<GroupNodeData>[] = nodes.filter(
        (node): node is Node<GroupNodeData> => node.type === "group",
      );
      const candidateGroups: any[] = [];

      groupNodes.forEach((groupNode: Node<GroupNodeData>) => {
        const absolutePos: XYPosition = findAbsolutePosition(groupNode, nodes);
        const groupBounds: GroupBounds = {
          x: absolutePos.x,
          y: absolutePos.y,
          width: Number(groupNode.style?.width || groupNode.width || 150),
          height: Number(groupNode.style?.height || groupNode.height || 100),
        };

        // Check if position is within group bounds
        if (
          flowPosition.x >= groupBounds.x &&
          flowPosition.x <= groupBounds.x + groupBounds.width &&
          flowPosition.y >= groupBounds.y &&
          flowPosition.y <= groupBounds.y + groupBounds.height
        ) {
          candidateGroups.push({
            node: groupNode,
            bounds: groupBounds,
            depth: getNodeDepth(groupNode, nodes),
          });
        }
      });

      // Sort by depth (deepest first) to get the most specific group
      candidateGroups.sort((a, b) => b.depth - a.depth);

      return includeNested ? candidateGroups : candidateGroups[0]?.node || null;
    },
    [nodes, findAbsolutePosition],
  );

  // Get node hierarchy depth
  const getNodeDepth = useCallback((node: Node, allNodes: Node[]): number => {
    let depth = 0;
    let currentNode: Node | undefined = node;

    while (currentNode?.parentId) {
      depth++;
      currentNode = allNodes.find((n: Node) => n.id === currentNode!.parentId);
    }

    return depth;
  }, []);

  // Get all child nodes of a group (including nested children)
  const getGroupChildren = useCallback(
    (groupId: string, includeNestedChildren = true): Node[] => {
      const directChildren: Node[] = nodes.filter(
        (node: Node) => node.parentId === groupId,
      );

      if (!includeNestedChildren) {
        return directChildren;
      }

      const allChildren: Node[] = [...directChildren];
      directChildren.forEach((child: Node) => {
        if (child.type === "group") {
          allChildren.push(...getGroupChildren(child.id, true));
        }
      });

      return allChildren;
    },
    [nodes],
  );

  // Detect zoom target group
  const detectZoomTargetGroup = useCallback(
    (
      event: MouseEvent | TouchEvent | null,
      viewport: Viewport,
    ): Node<GroupNodeData> | null => {
      if (!event || viewport.zoom === previousZoom.current) {
        return null;
      }

      const cursorPosition: XYPosition = { x: event.clientX, y: event.clientY };
      const flowPosition: XYPosition =
        reactFlowInstance.screenToFlowPosition(cursorPosition);

      console.log(flowPosition);
      const detectionResult = detectGroupAtPosition(flowPosition, false);
      const targetGroup: Node<GroupNodeData> | null =
        detectionResult as Node<GroupNodeData> | null;

      previousZoom.current = viewport.zoom;

      if (targetGroup) {
        setLastZoomTarget(targetGroup);
        return targetGroup;
      }

      return null;
    },
    [reactFlowInstance, detectGroupAtPosition],
  );

  // Advanced intersection detection with groups
  const getIntersectingGroups = useCallback(
    (node: Node, partially = false): Node<GroupNodeData>[] => {
      const intersectingNodes: Node[] = reactFlowInstance.getIntersectingNodes(
        node,
        partially,
      );
      return intersectingNodes.filter(
        (n): n is Node<GroupNodeData> => n.type === "group",
      );
    },
    [reactFlowInstance],
  );

  // Check if a node is inside a specific group
  const isNodeInGroup = useCallback(
    (nodeId: string, groupId: string): boolean => {
      const node: Node | undefined = nodes.find((n: Node) => n.id === nodeId);
      if (!node) return false;

      // Direct parent check
      if (node.parentId === groupId) return true;

      // Recursive parent check for nested groups
      let currentNode: Node | undefined = node;
      while (currentNode?.parentId) {
        if (currentNode.parentId === groupId) return true;
        currentNode = nodes.find((n: Node) => n.id === currentNode!.parentId);
      }

      return false;
    },
    [nodes],
  );

  return {
    detectGroupAtPosition,
    detectZoomTargetGroup,
    getGroupChildren,
    getIntersectingGroups,
    isNodeInGroup,
    findAbsolutePosition,
    getNodeDepth,
    lastZoomTarget,
    currentZoom,
  };
};
