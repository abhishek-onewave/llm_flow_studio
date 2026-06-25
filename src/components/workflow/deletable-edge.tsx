"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from "@xyflow/react";
import { X } from "lucide-react";
import { useWorkflowStore } from "@/lib/workflow/store";

export type DeletableEdge = Edge<Record<string, never>, "deletable">;

export default function DeletableEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps<DeletableEdge>) {
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge path={edgePath} style={style} markerEnd={markerEnd} />
      {selected && (
        <EdgeLabelRenderer>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdgesChange([{ id, type: "remove" }]);
            }}
            className="nodrag nopan pointer-events-auto absolute flex h-5 w-5 items-center justify-center rounded-full border border-hairline bg-surface-card text-mute shadow-sm transition-colors hover:bg-accent-red-soft hover:text-accent-red"
            style={{
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
            aria-label="Delete connection"
            title="Delete connection"
          >
            <X size={10} />
          </button>
        </EdgeLabelRenderer>
      )}
    </>
  );
}
