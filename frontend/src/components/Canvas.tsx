import { useFlowStore, type NodeData } from '../store/useFlowStore';
import { Node, NODE_WIDTH, NODE_HEIGHT } from './Node';

function getHandlePos(node: NodeData, side: 'left' | 'right') {
  return {
    x: side === 'right' ? node.x + NODE_WIDTH : node.x,
    y: node.y + NODE_HEIGHT / 2,
  };
}

function edgePath(start: { x: number; y: number }, end: { x: number; y: number }) {
  const midX = (start.x + end.x) / 2;
  return `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
}

export function Canvas() {
  const nodes = useFlowStore((s) => s.nodes);
  const edges = useFlowStore((s) => s.edges);
  const connectingFrom = useFlowStore((s) => s.connectingFrom);
  const mousePos = useFlowStore((s) => s.mousePos);
  const setMousePos = useFlowStore((s) => s.setMousePos);
  const cancelConnection = useFlowStore((s) => s.cancelConnection);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!connectingFrom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos(e.clientX - rect.left, e.clientY - rect.top);
  };

  const onPointerUp = () => {
    if (connectingFrom) cancelConnection();
  };

  const sourceNode = connectingFrom ? nodes.find((n) => n.id === connectingFrom) : null;

  return (
    <div
      id="flow-canvas"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="relative flex-1 overflow-hidden bg-slate-50"
      style={{
        backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full">
        {edges.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <path
              key={edge.id}
              d={edgePath(getHandlePos(source, 'right'), getHandlePos(target, 'left'))}
              stroke="#6366f1"
              strokeWidth={2}
              fill="none"
            />
          );
        })}

        {connectingFrom && sourceNode && mousePos && (
          <path
            d={edgePath(getHandlePos(sourceNode, 'right'), mousePos)}
            stroke="#a5b4fc"
            strokeWidth={2}
            strokeDasharray="4 4"
            fill="none"
          />
        )}
      </svg>

      {nodes.map((node) => (
        <Node key={node.id} node={node} />
      ))}

      {nodes.length === 1 && edges.length === 0 && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-lg bg-white/80 px-3 py-1.5 text-xs text-slate-500 shadow-sm">
          Drag from the indigo dot to connect nodes · Click "+ Add Node" to create more
        </div>
      )}
    </div>
  );
}
