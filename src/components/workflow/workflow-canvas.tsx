"use client";

import { useCallback, useRef, type DragEvent } from "react";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
  type OnSelectionChangeFunc,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import WorkflowNodeComponent from "./canvas-node";
import type { WorkflowNode } from "./canvas-node";
import { useWorkflowStore } from "@/lib/workflow/store";
import { buildNodeData, type PaletteItem } from "@/lib/workflow/node-defaults";

const nodeTypes = { workflow: WorkflowNodeComponent };

let nextId = 100;
function generateId() {
  return `node-${Date.now()}-${nextId++}`;
}

function WorkflowCanvasInner() {
  const nodes = useWorkflowStore((s) => s.nodes);
  const edges = useWorkflowStore((s) => s.edges);
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange);
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange);
  const onConnect = useWorkflowStore((s) => s.onConnect);
  const selectNode = useWorkflowStore((s) => s.selectNode);
  const addNode = useWorkflowStore((s) => s.addNode);

  const reactFlowInstance = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange: OnSelectionChangeFunc = useCallback(
    ({ nodes: selectedNodes }) => {
      selectNode(selectedNodes.length > 0 ? selectedNodes[0].id : null);
    },
    [selectNode]
  );

  const onDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      const raw = e.dataTransfer.getData("application/llm-flow-node");
      if (!raw) return;

      let item: PaletteItem;
      try {
        item = JSON.parse(raw) as PaletteItem;
      } catch {
        return;
      }

      // Convert screen coordinates to flow coordinates
      const bounds = wrapperRef.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
      });

      const newNode: WorkflowNode = {
        id: generateId(),
        type: "workflow",
        position,
        data: buildNodeData(item),
      };

      addNode(newNode);
      selectNode(newNode.id);
    },
    [reactFlowInstance, addNode, selectNode]
  );

  return (
    <div ref={wrapperRef} className="relative flex-1 bg-canvas" onDragOver={onDragOver} onDrop={onDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={handleSelectionChange}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable
        nodesConnectable
        elementsSelectable
        panOnDrag
        zoomOnScroll
        minZoom={0.3}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: "smoothstep",
          style: { stroke: "#bfc1b7", strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: "#bfc1b7", width: 16, height: 16 },
        }}
        style={{ background: "#eeefe9" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="#bfc1b7"
          style={{ opacity: 0.4 }}
        />
      </ReactFlow>
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
