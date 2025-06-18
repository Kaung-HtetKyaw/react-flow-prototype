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
      zIndex: 1000,
      interactionWidth: 20,
      style: {
        stroke: "#04A1F9",
      },
    }));
};
