import { useCallback, useRef, useState, useEffect } from "react";
import { drag } from "d3-drag";
import { select } from "d3-selection";
import {
  BaseEdge,
  EdgeLabelRenderer,
  type EdgeProps,
  useReactFlow,
  useStore,
} from "@xyflow/react";

// Store for edge offsets to persist across re-renders
const storeYVal: Record<string, number> = {};
let zoom = 1;

// Utility function to get edge center
function getEdgeCenter({
  sourceX,
  sourceY,
  targetX,
  targetY,
}: {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}) {
  const xOffset = Math.abs(targetX - sourceX) / 2;
  const centerX = targetX < sourceX ? targetX + xOffset : targetX - xOffset;

  const yOffset = Math.abs(targetY - sourceY) / 2;
  const centerY = targetY < sourceY ? targetY + yOffset : targetY - yOffset;

  return { centerX, centerY, xOffset, yOffset };
}

export const DraggableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style = {},
  data,
}: EdgeProps) => {
  const { centerX, centerY } = getEdgeCenter({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const [labelPointY, setLabelPointY] = useState(storeYVal?.[id] || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data?.label as string) || "Edge");
  const { setEdges } = useReactFlow();

  // Get zoom level from store
  useStore((state) => {
    zoom = state.transform[2];
  });

  const edgeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (edgeRef.current) {
      const d3Selection = select(edgeRef.current);

      d3Selection.call(
        drag<HTMLDivElement, unknown>().on("drag", (event) => {
          const newOffset = (storeYVal[id] || 0) - event.dy / zoom;
          setLabelPointY(newOffset);
          storeYVal[id] = newOffset;
        }),
      );
    }
  }, [id]);

  // Generate orthogonal edge path
  function generateOrthogonalEdgePath(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    padding: number,
    Hoffset = 0,
  ) {
    const dx = endX - startX;
    const dy = endY - startY;

    let path = `M${startX},${startY} `;
    path += `V${startY + dy / 2 - Hoffset} `;
    path += `H${endX - padding} `;
    path += `V${endY}`;

    return path;
  }

  const path = generateOrthogonalEdgePath(
    sourceX,
    sourceY,
    targetX,
    targetY,
    0,
    labelPointY,
  );

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
        path={path}
        style={{ ...style, strokeWidth: 2, zIndex: 9999 }}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        {/* Draggable control point */}
        <div
          ref={edgeRef}
          style={{
            position: "absolute",
            left: `${centerX - 6}px`,
            top: `${centerY - 6 - labelPointY}px`,
            zIndex: 9999,
            width: "12px",
            height: "12px",
            pointerEvents: "all",
            borderRadius: "50%",
            background: "#ef4444",
            border: "2px solid white",
            cursor: "grab",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
          title="Drag to reshape edge"
        />

        {/* Editable label */}
        <div
          style={{
            position: "absolute",
            left: `${centerX}px`,
            top: `${centerY - labelPointY + 20}px`,
            transform: "translate(-50%, 0)",
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
      </EdgeLabelRenderer>
    </>
  );
};
