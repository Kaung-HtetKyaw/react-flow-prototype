import { type NodeProps } from "@xyflow/react";

export type GroupNodeData = {
  label: string;
  description: string;
  icon?: () => JSX.Element;
  color?: string;
  type: "cluster" | "namespace" | "pod" | "container";
};

export const GroupNode = ({ data, selected }: NodeProps) => {
  const { label, description, icon, color, type } = data as GroupNodeData;

  return (
    <div
      style={{
        backgroundColor: color || getBgColorByType(type),
        color: getTextColorByType(type),
      }}
      className={`flex h-[24px] w-fit items-center justify-center rounded-br-[8px] rounded-tl-[8px] p-[8px]`}
    >
      <div className="flex flex-row items-center gap-2">
        {icon && icon()}
        <span> {label}</span>
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
