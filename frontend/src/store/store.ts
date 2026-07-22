import { create } from 'zustand'

type NodeState = { status: 'idle' | 'streaming' | 'done'; text: string }

type FlowState = {
    nodes: Record<string, NodeState>,
    setStatus: (id: string, status: NodeState['status']) => void,
    appendChunk: (id: string, chunk: string) => void
}

export const useFlowStore = create<FlowState>((set) => ({
    nodes: {},
    setStatus: (id, status) => set(s => ({ nodes: { ...s.nodes, [id]: { ...(s.nodes[id] ?? { text: '' }), status } } })),
    appendChunk: (id, chunk) =>
        set(s => {
            const cur = s.nodes[id] ?? { status: 'streaming' as const, text: '' };
            return { nodes: { ...s.nodes, [id]: { ...cur, text: cur.text + chunk } } };
        })
}))