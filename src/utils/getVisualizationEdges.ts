import { containersDataset } from "@/dataset/containers";
import { type Edge } from "@xyflow/react";

export const getVisualizationEdges = (): Edge[] => {
  return containersDataset
    .map((container) => {
      return (container?.connections || []).map((connection) => {
        return {
          id: container.name,
          source: container.name,
          target: connection,
          type: "smoothstep",
          data: {
            label: container.name,
          },
        };
      });
    })
    .flat();
};
