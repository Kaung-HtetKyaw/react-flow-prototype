import { CoordinateExtent } from "@xyflow/react";
import { clustersDataset } from "./clusters";
import { containersDataset } from "./containers";
import { namespacesDataset } from "./namespaces";
import { nodesDataset } from "./nodes";
import { podsDataset } from "./pods";

export type DatasetClusterWithHierarchy = DatasetCluster & {
  namespaces: DatasetNamespace[];
  nodes: DatasetNode[];
};

export type DatasetCluster = (typeof clustersDataset)[0] & {
  tags: string[];
};

export type DatasetNode = (typeof nodesDataset)[0];

export type DatasetNamespace = (typeof namespacesDataset)[0] & {
  pods: DatasetPod[];
};

export type DatasetPod = (typeof podsDataset)[0] & {
  containers: DatasetContainer[];
};

export type DatasetContainer = (typeof containersDataset)[0];

export type VisualizationNode = {
  id: string;
  type: VisualizationNodeTypeEnum;
  parentId?: string;
  position: {
    x: number;
    y: number;
  };
  extent?: "parent" | CoordinateExtent;
  data: VisualizationNodeData;
  style?: React.CSSProperties;
  children?: VisualizationNode[];
};

export type VisualizationNodeData = {
  label: string;
  description?: string;
  type: "cluster" | "namespace" | "pod" | "container";
  backgroundColor?: string;
  color?: string;
  icon?: () => JSX.Element;
};

export const VisualizationNodeTypes = {
  custom: "custom",
  group: "group",
} as const;
export type VisualizationNodeTypeEnum = keyof typeof VisualizationNodeTypes;
