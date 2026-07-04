import { useRef } from 'react';
import { useFlowStore, type NodeData } from '../store/useFlowStore';

export const NODE_WIDTH = 168;
export const NODE_HEIGHT = 64;

interface NodeProps {
  node: NodeData;
}

export function Node({ node }: NodeProps) {
  const updateNodePosition = useFlowStore((s) => s.updateNodePosition);
  const startConnection = useFlowStore((s) => s.startConnection);
  const finishConnection = useFlowStore((s) => s.finishConnection);
  const connectingFrom = useFlowStore((s) => s.connectingFrom);

  const dragOffset = useRef<{ x: number; y: number } | null>(null);

  const isSource = connectingFrom === node.id;
  const isConnecting = connectingFrom !== null;

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    const rect = e.currentTarget.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOffset.current) return;
    const canvas = document.getElementById('flow-canvas');
    if (!canvas) return;
    const canvasRect = canvas.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.current.x;
    const y = e.clientY - canvasRect.top - dragOffset.current.y;
    updateNodePosition(node.id, Math.max(0, x), Math.max(0, y));
  };

  const onPointerUp = () => {
    dragOffset.current = null;
  };

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ left: node.x, top: node.y, width: NODE_WIDTH, height: NODE_HEIGHT }}
      className={`absolute flex-row select-none items-center justify-center rounded-xl border-2 bg-white px-3 text-xs font-normal text-slate-700 shadow-md transition-colors cursor-grab active:cursor-grabbing ${
        isSource ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-300'
      }`}
    >
      {node.label}

      <div className=''><input className='text-sm transition duration-300 bg-transparent border rounded-md shadow-sm placeholder:text-slate-400 text-slate-700 border-slate-200 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 focus:shadow' placeholder='Type here...'></input></div>
      {/* input handle */}
      <div
        data-handle="input"
        onPointerUp={(e) => {
          e.stopPropagation();
          finishConnection(node.id);
        }}
        className={`absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-white shadow ${
          isConnecting && !isSource
            ? 'bg-emerald-500 hover:bg-emerald-600 cursor-crosshair'
            : 'bg-slate-400'
        }`}
        title="Connect input"
      />
      {/* output handle */}
      <div
        data-handle="output"
        onPointerDown={(e) => {
          e.stopPropagation();
          startConnection(node.id);
        }}
        className="absolute w-4 h-4 -translate-y-1/2 bg-indigo-500 border-2 border-white rounded-full shadow -right-2 top-1/2 cursor-crosshair hover:bg-indigo-600"
        title="Drag to connect"
      />
    </div>
  );
}
