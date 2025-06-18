import { containersDataset } from "@/dataset/containers";
import { type Edge } from "@xyflow/react";

export const getVisualizationEdges = (): Edge[] => {
  return containersDataset
    .map((container) => {
      return (container?.connections || []).map((connection) => {
        return {
          id: `${container.name}-${connection}`,
          source: container.name,
          target: connection,
          type: "smoothstep",
          data: {
            label: container.name,
          },
        };
      });
    })
    .flat()
    .map((el) => ({
      ...el,
      ...getVisualizationEdgeBaseStyle(),
    }));
};

export const getVisualizationEdgeBaseStyle = (): Partial<Edge> => {
  return {
    style: {
      stroke: "#04A1F9",
    },
    interactionWidth: 20,
    zIndex: 1000,
    type: "smoothstep",
  };
};
