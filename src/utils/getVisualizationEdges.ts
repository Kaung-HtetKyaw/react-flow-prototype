import { clustersDataset } from "@/dataset/clusters";
import { containersDataset } from "@/dataset/containers";
import { namespacesDataset } from "@/dataset/namespaces";
import { podsDataset } from "@/dataset/pods";
import { MarkerType, type Edge } from "@xyflow/react";

export type ConnectableEntity = {
  id: string;
  name: string;
  connections: { id: string; type: ConnectableEntityType }[];
  type: ConnectableEntityType;
};

export const ConnectableEntityTypes = {
  container: "container",
  namespace: "namespace",
  pod: "pod",
  cluster: "cluster",
} as const;
export type ConnectableEntityType = keyof typeof ConnectableEntityTypes;

const dataset: ConnectableEntity[] = [
  ...clustersDataset.map((el) => ({
    id: el.id,
    name: el.name,
    connections: el.connections.map((conn) => ({
      id: conn.id,
      type: conn.type as ConnectableEntityType,
    })),
    type: ConnectableEntityTypes.cluster,
  })),
  ...namespacesDataset.map((el) => ({
    id: el.id,
    name: el.name,
    connections: el.connections.map((conn) => ({
      id: conn.id,
      type: conn.type as ConnectableEntityType,
    })),
    type: ConnectableEntityTypes.namespace,
  })),
  ...podsDataset.map((el) => ({
    id: el.id,
    name: el.name,
    connections: el.connections.map((conn) => ({
      id: conn.id,
      type: conn.type as ConnectableEntityType,
    })),
    type: ConnectableEntityTypes.pod,
  })),
  ...containersDataset.map((el) => ({
    id: `${el.name}`,
    name: el.name,
    connections: (el.connections || []).map((conn) => ({
      id: conn.id,
      type: conn.type as ConnectableEntityType,
    })),
    type: ConnectableEntityTypes.container,
  })),
];

export const getVisualizationEdges = (): Edge[] => {
  return dataset
    .map((entity) => {
      return (entity?.connections || []).map((connection) => {
        return {
          id: `${entity.name}-${connection.id}`,
          source: entity.id,
          target: connection.id,
          type: "smoothstep",
          data: {
            label: entity.name,
            sourceType: entity.type,
            targetType: connection.type,
          },
        };
      });
    })
    .flat()
    .map((el) => ({
      ...el,
      ...getVisualizationEdgeBaseStyle(el.data.targetType),
    }));
};

export const getVisualizationEdgeBaseStyle = (
  targetType: ConnectableEntityType,
): Partial<Edge> => {
  switch (targetType) {
    case ConnectableEntityTypes.container:
      return getVisualizationEdgeBaseStyleForContainer();
    case ConnectableEntityTypes.namespace:
      return getVisualizationEdgeBaseStyleForNamespace();
    case ConnectableEntityTypes.pod:
      return getVisualizationEdgeBaseStyleForPod();
    case ConnectableEntityTypes.cluster:
      return getVisualizationEdgeBaseStyleForCluster();
    default:
      return getVisualizationEdgeBaseStyleForContainer();
  }
};

export const getVisualizationEdgeBaseStyleForContainer = (): Partial<Edge> => {
  return {
    style: {
      stroke: "#04A1F9",
    },
    interactionWidth: 20,
    zIndex: 1000,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "#04A1F9",
    },
  };
};

export const getVisualizationEdgeBaseStyleForNamespace = (): Partial<Edge> => {
  return {
    style: {
      stroke: "#25BCC0",
    },
    interactionWidth: 20,
    zIndex: 1000,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "#25BCC0",
    },
  };
};

export const getVisualizationEdgeBaseStyleForCluster = (): Partial<Edge> => {
  return {
    style: {
      stroke: "#FC1706",
    },
    interactionWidth: 20,
    zIndex: 1000,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "#FC1706",
    },
  };
};

export const getVisualizationEdgeBaseStyleForPod = (): Partial<Edge> => {
  return {
    style: {
      stroke: "#04A1F9",
    },
    interactionWidth: 20,
    zIndex: 1000,
    type: "smoothstep",
    markerEnd: {
      type: MarkerType.Arrow,
      color: "#04A1F9",
    },
  };
};
