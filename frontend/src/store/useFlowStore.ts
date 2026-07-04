import { create } from 'zustand';

export interface NodeData {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
}

interface FlowState {
  nodes: NodeData[];
  edges: EdgeData[];
  connectingFrom: string | null;
  mousePos: { x: number; y: number } | null;

  addNode: () => void;
  updateNodePosition: (id: string, x: number, y: number) => void;
  startConnection: (id: string) => void;
  finishConnection: (id: string) => void;
  cancelConnection: () => void;
  setMousePos: (x: number, y: number) => void;
  submit: () => { nodes: NodeData[]; edges: EdgeData[] };
}

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;

let nodeCounter = 1;

export const useFlowStore = create<FlowState>((set, get) => ({
  // A single node is present at start.
  nodes: [{ id: 'node-1', x: 120, y: 160, label: 'Input 1' }],
  edges: [],
  connectingFrom: null,
  mousePos: null,

  addNode: () =>
    set((state) => {
      nodeCounter += 1;
      const offset = state.nodes.length * 48;
      return {
        nodes: [
          ...state.nodes,
          {
            id: createId(),
            x: 160 + (offset % 480),
            y: 160 + Math.floor(offset / 480) * 140,
            label: `Input ${nodeCounter}`,
          },
        ],
      };
    }),

  updateNodePosition: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),

  startConnection: (id) => set({ connectingFrom: id }),

  finishConnection: (id) =>
    set((state) => {
      if (!state.connectingFrom || state.connectingFrom === id) {
        return { connectingFrom: null, mousePos: null };
      }
      const alreadyExists = state.edges.some(
        (e) => e.source === state.connectingFrom && e.target === id
      );
      if (alreadyExists) {
        return { connectingFrom: null, mousePos: null };
      }
      return {
        edges: [
          ...state.edges,
          { id: createId(), source: state.connectingFrom, target: id },
        ],
        connectingFrom: null,
        mousePos: null,
      };
    }),

  cancelConnection: () => set({ connectingFrom: null, mousePos: null }),

  setMousePos: (x, y) => set({ mousePos: { x, y } }),

  submit: () => {
    const { nodes, edges } = get();
    return { nodes, edges };
  },
}));
