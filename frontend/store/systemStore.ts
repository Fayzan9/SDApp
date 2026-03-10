import { create } from 'zustand';
import {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    applyNodeChanges,
    applyEdgeChanges,
} from '@xyflow/react';
import { COMPONENT_REGISTRY } from '@/lib/componentRegistry';
import { validateConnection } from '@/lib/topologyValidator';
import { persistence } from '@/lib/persistence';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface SystemState {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    systemId: string;
    systemName: string;

    // Actions
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;

    addNode: (type: string, position: { x: number; y: number }) => void;
    selectNode: (id: string | null) => void;
    updateNodeConfig: (id: string, config: any) => void;
    deleteNode: (id: string) => void;

    // System Actions
    saveDesign: () => void;
    loadDesign: (id: string) => void;
    clearCanvas: () => void;
    setSystemName: (name: string) => void;
}

export const useStore = create<SystemState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    systemId: uuidv4(),
    systemName: 'Untitled Architecture',

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        set({
            edges: applyEdgeChanges(changes, get().edges),
        });
    },

    onConnect: (connection: Connection) => {
        const { nodes, edges } = get();
        const validation = validateConnection(connection, nodes, edges);

        if (!validation.isValid) {
            toast.error(validation.message || 'Invalid connection');
            return;
        }

        set({
            edges: addEdge({ ...connection, animated: true, style: { strokeWidth: 2 } }, edges),
        });
    },

    addNode: (type: string, position: { x: number; y: number }) => {
        const componentDef = COMPONENT_REGISTRY[type];
        if (!componentDef) return;

        const newNode: Node = {
            id: `${type}-${uuidv4().slice(0, 8)}`,
            type: 'custom',
            position,
            data: {
                label: componentDef.label,
                type: componentDef.type,
                config: componentDef.configSchema.reduce((acc, field) => ({
                    ...acc,
                    [field.name]: field.default
                }), {})
            },
        };

        set({
            nodes: [...get().nodes, newNode],
        });
    },

    selectNode: (id: string | null) => {
        set({ selectedNodeId: id });
    },

    updateNodeConfig: (id: string, config: any) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === id) {
                    return {
                        ...node,
                        data: {
                            ...node.data,
                            config: {
                                ...(node.data.config as any || {}),
                                ...config,
                            },
                        },
                    };
                }
                return node;
            }),
        });
    },

    deleteNode: (id: string) => {
        set({
            nodes: get().nodes.filter((node) => node.id !== id),
            edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
            selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
        });
        toast.success('Node deleted');
    },

    saveDesign: () => {
        const { systemId, systemName, nodes, edges } = get();
        persistence.save({ id: systemId, name: systemName, nodes, edges });
        toast.success('Architecture saved successfully!');
    },

    loadDesign: (id: string) => {
        const saved = persistence.getById(id);
        if (saved) {
            set({
                systemId: saved.id,
                systemName: saved.name,
                nodes: saved.nodes,
                edges: saved.edges,
            });
            toast.success(`Loaded: ${saved.name}`);
        }
    },

    clearCanvas: () => {
        set({ nodes: [], edges: [], selectedNodeId: null });
        toast.success('Canvas cleared');
    },

    setSystemName: (name: string) => {
        set({ systemName: name });
    }
}));
