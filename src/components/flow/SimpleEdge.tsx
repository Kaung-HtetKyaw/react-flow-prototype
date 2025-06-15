import { useState } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";

export const SimpleEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data?.label as string) || "Edge");
  const { setEdges } = useReactFlow();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleLabelChange = (newLabel: string) => {
    setLabel(newLabel);
    setEdges((edges) =>
      edges.map((edge) =>
        edge.id === id
          ? { ...edge, data: { ...edge.data, label: newLabel } }
          : edge,
      ),
    );
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        className="stroke-gray-400 stroke-2 hover:stroke-blue-500"
        style={{ zIndex: 9999 }}
      />
      {/* <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={() => {
                setIsEditing(false);
                handleLabelChange(label);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsEditing(false);
                  handleLabelChange(label);
                }
              }}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:border-blue-500 focus:outline-none"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="rounded border border-gray-300 bg-white px-2 py-1 text-xs shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {label}
            </button>
          )}
        </div>
      </EdgeLabelRenderer> */}
    </>
  );
};
