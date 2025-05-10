"use client";
import React, { useCallback, useRef } from "react";
import {
  ReactFlowProvider,
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  XYPosition,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const blockPresets = [
  {
    type: "button",
    label: "Button",
    data: { label: "Button", variant: "primary" },
  },
  {
    type: "input",
    label: "Input",
    data: { label: "Input", placeholder: "Type here..." },
  },
  {
    type: "card",
    label: "Card",
    data: { label: "Card", content: "Card content" },
  },
];

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "Start building!" },
    position: { x: 250, y: 5 },
  },
];

const initialEdges: Edge[] = [];

function Sidebar() {
  return (
    <aside className="w-48 bg-gray-50 border-r p-4 flex flex-col gap-4">
      <h2 className="font-bold mb-2">Blocks</h2>
      {blockPresets.map((block) => (
        <div
          key={block.type}
          className="cursor-grab p-2 bg-white border rounded shadow hover:bg-blue-50"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "application/reactflow",
              JSON.stringify(block)
            );
            e.dataTransfer.effectAllowed = "move";
          }}
        >
          {block.label}
        </div>
      ))}
    </aside>
  );
}

function BuilderFlow() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = React.useState<any>(null);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");
      if (!data) return;
      const block = JSON.parse(data);
      const position: XYPosition = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode: Node = {
        id: `${block.type}-${+new Date()}`,
        type: "default",
        position,
        data: block.data,
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  return (
    <div className="flex h-full">
      <Sidebar />
      <div
        className="flex-1 h-full relative"
        ref={reactFlowWrapper}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={setReactFlowInstance}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <div className="h-[80vh] w-full p-8">
      <h1 className="text-2xl font-bold mb-4">Visual Component Builder</h1>
      <div className="h-full border rounded-lg overflow-hidden bg-white flex">
        <ReactFlowProvider>
          <BuilderFlow />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
