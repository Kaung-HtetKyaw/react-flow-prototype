import { omit } from "lodash/fp";
import NamespaceIcon from "@/components/icons/NamespaceIcon";
import {
  DatasetClusterWithHierarchy,
  DatasetContainer,
  DatasetNamespace,
  DatasetPod,
  VisualizationNode,
  VisualizationNodeData,
  VisualizationNodeTypes,
} from "@/dataset/types";

export type CoordinateDimension = {
  width: number;
  height: number;
  x: number;
  y: number;
};

export const ENTITY_PER_ROW = 2;
export const ENTITY_GAP = 20;
export const ENTITY_PADDING = 30;
export const BASE_CONTAINER_WIDTH = 150;
export const BASE_CONTAINER_HEIGHT = 24;
export const BASE_GROUP_WIDTH = 200;
export const BASE_GROUP_HEIGHT = 200;
export const BASE_NAMESPACE_WIDTH = 300;
export const BASE_NAMESPACE_HEIGHT = 300;
export const DEFAULT_COORDINATE_DIMENSION: CoordinateDimension = {
  width: 0,
  height: 0,
  x: 0,
  y: 0,
};

export const getFlatVisualizationNodes = (nodes: VisualizationNode[]) => {
  const result: VisualizationNode[] = [];

  nodes.forEach((node) => {
    result.push(omit(["children"], node) as VisualizationNode);
    if (node.children) {
      result.push(...getFlatVisualizationNodes(node.children));
    }
  });

  return result.map((el) => ({
    ...el,
    style: {
      ...(el.style || {}),
      borderRadius: "9px",
    },
  }));
};

export const getVisualizationNodesForClusterList = (
  clusterList: DatasetClusterWithHierarchy[],
): VisualizationNode[] => {
  const coordinateDimensionList: Array<{
    width: number;
    height: number;
    x: number;
    y: number;
  }> = [];

  return clusterList.map((cluster, index) => {
    const visualizationNode = getVisualizationNodeForCluster(
      cluster,
      index,
      coordinateDimensionList,
    );

    coordinateDimensionList.push({
      width: visualizationNode.style?.width || 0,
      height: visualizationNode.style?.height || 0,
      x: visualizationNode.position.x,
      y: visualizationNode.position.y,
    });

    return visualizationNode;
  });
};

export const getVisualizationNodeForCluster = (
  cluster: DatasetClusterWithHierarchy,
  index: number,
  coordinateDimensionList: CoordinateDimension[] = [],
) => {
  const numberOfRows = Math.ceil(cluster.namespaces.length / ENTITY_PER_ROW);
  const padding = 2 * ENTITY_PADDING;
  const horizontalGap = (cluster.namespaces.length - 2) * ENTITY_GAP;

  const namespacesWithDimensions = getVisualizationNodesForNamespaceList(
    cluster.namespaces,
  );

  const childrenWidth = namespacesWithDimensions.reduce((acc, cur) => {
    return acc + Number(cur?.style?.width || BASE_GROUP_WIDTH);
  }, 0);

  const childrenHeight = namespacesWithDimensions
    .map((el) => (el?.style?.height as number) || BASE_GROUP_HEIGHT)
    .sort((a, b) => b - a)[0];

  const width = childrenWidth + padding + horizontalGap;

  const height =
    numberOfRows > 0
      ? childrenHeight + padding + (numberOfRows - 1) * ENTITY_GAP
      : BASE_GROUP_HEIGHT;

  const leftAdjacentCluster =
    coordinateDimensionList[index - 1] || DEFAULT_COORDINATE_DIMENSION;

  const x =
    leftAdjacentCluster.width +
    leftAdjacentCluster.x +
    numberOfRows * ENTITY_GAP;

  const y = ENTITY_GAP;

  return {
    id: cluster.id,
    type: VisualizationNodeTypes.group,
    position: {
      x,
      y,
    },
    data: {
      label: cluster.name,
      type: "cluster" as const,
    },
    style: {
      width,
      height,
      backgroundColor: "white",
      color: "#878AA9",
      padding: 0,
    },
    children: getVisualizationNodesForNamespaceList(cluster.namespaces),
  };
};

export const getVisualizationNodesForNamespaceList = (
  namespaceList: DatasetNamespace[],
): VisualizationNode[] => {
  const coordinateDimensionList: Array<{
    width: number;
    height: number;
    x: number;
    y: number;
  }> = [];

  return namespaceList.map((namespace, index) => {
    const visualizationNode = getVisualizationNodeForNamespace(
      namespace,
      index,
      coordinateDimensionList,
    );

    coordinateDimensionList.push({
      width: visualizationNode.style?.width || 0,
      height: visualizationNode.style?.height || 0,
      x: visualizationNode.position.x,
      y: visualizationNode.position.y,
    });

    return visualizationNode;
  });
};

export const getVisualizationNodeForNamespace = (
  namespace: DatasetNamespace,
  index: number,
  coordinateDimensionList: CoordinateDimension[] = [],
) => {
  const numberOfRows = Math.ceil(namespace.pods.length / ENTITY_PER_ROW);
  const padding = 2 * ENTITY_PADDING;
  const horizontalGap = ENTITY_GAP;

  const podsWithDimensions = getVisualizationNodesForPodList(namespace.pods);

  const childrenWidth =
    getHorizontalChunkedArray(podsWithDimensions)
      .map((row) =>
        row.reduce((acc, cur) => {
          return acc + Number(cur?.style?.width || BASE_CONTAINER_WIDTH);
        }, 0),
      )
      .sort((a, b) => b - a)[0] || BASE_GROUP_WIDTH;

  const childrenHeight =
    getVerticalChunkedArray(podsWithDimensions)
      .map((row) =>
        row.reduce((acc, cur) => {
          return acc + Number(cur?.style?.height || BASE_CONTAINER_HEIGHT);
        }, 0),
      )
      .sort((a, b) => b - a)[0] || BASE_GROUP_HEIGHT;

  const width = childrenWidth + padding + horizontalGap;

  const height =
    numberOfRows > 0
      ? childrenHeight +
        padding +
        (numberOfRows - 1) * ENTITY_GAP +
        ENTITY_PADDING
      : BASE_GROUP_HEIGHT;

  const leftAdjacentNamespace =
    coordinateDimensionList[index - 1] || DEFAULT_COORDINATE_DIMENSION;

  const x = leftAdjacentNamespace.width + leftAdjacentNamespace.x + ENTITY_GAP;

  const y = ENTITY_PADDING;

  return {
    id: namespace.id,
    parentId: namespace.clusterID,
    type: VisualizationNodeTypes.group,
    position: {
      x,
      y,
    },
    data: {
      label: namespace.name,
      type: "namespace" as const,
    },
    extent: "parent" as const,
    style: {
      width,
      height,
      backgroundColor: "white",
      color: "#878AA9",
      padding: 0,
    },
    children: getVisualizationNodesForPodList(namespace.pods),
  };
};

export const getVisualizationNodesForPodList = (
  podList: DatasetPod[],
): VisualizationNode[] => {
  const coordinateDimensionList: Array<{
    width: number;
    height: number;
    x: number;
    y: number;
  }> = [];

  return podList.map((pod, index) => {
    const visualizationNode = getVisualizationNodeForPod(
      pod,
      index,
      coordinateDimensionList,
    );

    coordinateDimensionList.push({
      width: visualizationNode.style?.width || 0,
      height: visualizationNode.style?.height || 0,
      x: visualizationNode.position.x,
      y: visualizationNode.position.y,
    });

    return visualizationNode;
  });
};

export const getVisualizationNodeForPod = (
  pod: DatasetPod,
  index: number,
  coordinateDimensionList: CoordinateDimension[] = [],
) => {
  const numberOfRows = Math.ceil(pod.containers.length / ENTITY_PER_ROW);
  const padding = 2 * ENTITY_PADDING;
  const horizontalGap = ENTITY_GAP;

  const width = ENTITY_PER_ROW * BASE_CONTAINER_WIDTH + padding + horizontalGap;

  const height = numberOfRows * BASE_CONTAINER_HEIGHT + padding;

  const indexPerRow = index % ENTITY_PER_ROW;

  const topPod =
    coordinateDimensionList[index - ENTITY_PER_ROW] ||
    DEFAULT_COORDINATE_DIMENSION;

  const x =
    indexPerRow > 0 ? indexPerRow * (2 * ENTITY_GAP) + width : ENTITY_PADDING;

  const y = topPod.height + topPod.y + ENTITY_PADDING;

  return {
    id: pod.id,
    parentId: pod.namespaceID,
    type: VisualizationNodeTypes.group,
    extent: "parent" as const,
    position: {
      x,
      y,
    },
    data: {
      label: pod.name,
      type: "pod" as const,
    },
    style: {
      width,
      height,
      backgroundColor: "white",
      color: "#878AA9",
      padding: 0,
    },
    children: pod.containers.map((container, containerIndex) =>
      getVisualizationNodesForContainer(container, containerIndex),
    ),
  };
};

export const getVisualizationNodesForContainer = (
  container: DatasetContainer,
  index: number,
): VisualizationNode => {
  const indexPerRow = index % ENTITY_PER_ROW;
  const rowIndex = Math.floor(index / ENTITY_PER_ROW);
  const x = indexPerRow * ENTITY_PADDING + indexPerRow * BASE_CONTAINER_WIDTH;
  const y = rowIndex * BASE_CONTAINER_HEIGHT + 2 * ENTITY_GAP;

  return {
    id: container.name,
    type: "custom",
    parentId: container.podID,
    position: {
      x,
      y,
    },
    extent: "parent" as const,
    data: {
      label: container.name,
      type: "container",
    },
    style: {
      width: BASE_CONTAINER_WIDTH,
      height: BASE_CONTAINER_HEIGHT,
      maxHeight: BASE_CONTAINER_HEIGHT,
      maxWidth: BASE_CONTAINER_WIDTH,
    },
  };
};

const getHorizontalChunkedArray = <T>(arr: Array<T>, size = ENTITY_PER_ROW) => {
  const result: Array<Array<T>> = [];

  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

const getVerticalChunkedArray = <T>(arr: Array<T>, size = ENTITY_PER_ROW) => {
  const result: Array<Array<T>> = Array.from({ length: size }, () => []);

  for (let i = 0; i < arr.length; i++) {
    const remainder = i % size;
    result[remainder].push(arr[i]);
  }

  return result;
};
