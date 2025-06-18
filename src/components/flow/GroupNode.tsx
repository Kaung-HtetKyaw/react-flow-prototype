import { VisualizationNode, VisualizationNodeData } from "@/dataset/types";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export const GroupNode = ({ data, selected }: NodeProps<VisualizationNode>) => {
  const { label, description, icon, color, type } =
    data as VisualizationNodeData;

  return (
    <div>
      {/* Left Handle */}
      <Handle
        id="left"
        type="target"
        position={Position.Left}
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "#3b82f6",
          border: "2px solid white",
        }}
      />

      {/* Right Handle */}
      <Handle
        id="right"
        type="source"
        position={Position.Right}
        style={{
          width: "12px",
          height: "12px",
          backgroundColor: "#3b82f6",
          border: "2px solid white",
        }}
      />

      <div
        style={{
          backgroundColor: getBgColorByType(type),
          color: getTextColorByType(type),
        }}
        className={`flex h-[24px] w-fit items-center justify-center rounded-br-[8px] rounded-tl-[8px] p-[8px]`}
      >
        <div className="flex flex-row items-center gap-2 text-left text-[10px]">
          {icon && icon()}
          <span> {label}</span>
        </div>
      </div>
    </div>
  );
};

export const getBgColorByType = (
  type: "cluster" | "namespace" | "pod" | "container",
) => {
  switch (type) {
    case "cluster":
      return "#00277B";
    case "namespace":
      return "#26C300";
    case "pod":
      return "#ECECF2";
    case "container":
      return "#ECECF2";
  }
};

export const getTextColorByType = (
  type: "cluster" | "namespace" | "pod" | "container",
) => {
  switch (type) {
    case "cluster":
      return "white";
    case "namespace":
      return "white";
    case "pod":
      return "#878AA9";
    case "container":
      return "#878AA9";
  }
};
