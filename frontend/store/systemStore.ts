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
    reconnectEdge,
} from '@xyflow/react';
import { validateConnection } from '@/lib/topologyValidator';
import { persistence } from '@/lib/persistence';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { componentApi, ComponentDefinition, Template } from '@/lib/componentApi';
import * as LucideIcons from 'lucide-react';

interface SystemState {
    nodes: Node[];
    edges: Edge[];
    selectedNodeId: string | null;
    systemId: string;
    systemName: string;

    // Component Registry State
    componentRegistry: Record<string, ComponentDefinition>;
    templates: Template[];
    categories: string[];
    isRegistryLoading: boolean;

    // Simulation State
    isSimulating: boolean;
    simEvents: any[];
    simStats: {
        totalRequests: number;
        completedRequests: number;
        failedRequests: number;
        p50Latency: number;
        p99Latency: number;
        throughput: number;
        cacheHits: number;
        cacheMisses: number;
    };
    offlineNodes: string[];

    // Actions
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (connection: Connection) => void;

    addNode: (type: string, position: { x: number; y: number }) => void;
    selectNode: (id: string | null) => void;
    updateNodeConfig: (id: string, config: any) => void;
    deleteNode: (id: string) => void;

    // Simulation Actions
    startSimulation: () => void;
    stopSimulation: () => void;
    terminateNode: (id: string) => void;
    resurrectNode: (id: string) => void;
    handleSimEvent: (event: any) => void;

    // System Actions
    saveDesign: () => void;
    loadDesign: (id: string) => void;
    clearCanvas: () => void;
    setSystemName: (name: string) => void;
    copyNode: (id: string) => void;
    pasteNode: (position: { x: number; y: number }) => void;
    onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
    deleteEdge: (id: string) => void;

    // Registry Actions
    fetchComponents: () => Promise<void>;
    fetchTemplates: () => Promise<void>;
    loadTemplate: (templateId: string) => void;
}

interface ClipboardData {
    type: string;
    config: any;
    label: string;
}

export const useStore = create<SystemState>((set, get) => ({
    nodes: [],
    edges: [],
    selectedNodeId: null,
    systemId: uuidv4(),
    systemName: 'Untitled Architecture',
    isSimulating: false,
    simEvents: [],
    simStats: {
        totalRequests: 0,
        completedRequests: 0,
        failedRequests: 0,
        p50Latency: 0,
        p99Latency: 0,
        throughput: 0,
        cacheHits: 0,
        cacheMisses: 0,
    },
    offlineNodes: [],
    componentRegistry: {},
    templates: [],
    categories: [],
    isRegistryLoading: false,

    onNodesChange: (changes: NodeChange[]) => {
        set({
            nodes: applyNodeChanges(changes, get().nodes),
        });
    },

    onEdgesChange: (changes: EdgeChange[]) => {
        let newEdges = applyEdgeChanges(changes, get().edges);

        // Bring selected edge to front for better hit testing/reconnection
        const selectChange = changes.find(c => c.type === 'select' && c.selected);
        if (selectChange && 'id' in selectChange) {
            const edgeIndex = newEdges.findIndex(e => e.id === selectChange.id);
            if (edgeIndex > -1) {
                const edge = newEdges[edgeIndex];
                newEdges = [...newEdges.slice(0, edgeIndex), ...newEdges.slice(edgeIndex + 1), edge];
            }
        }

        set({
            edges: newEdges,
        });
    },

    onConnect: (connection: Connection) => {
        const { nodes, edges, componentRegistry } = get();
        const validation = validateConnection(connection, nodes, edges, componentRegistry);

        if (!validation.isValid) {
            toast.error(validation.message || 'Invalid connection');
            return;
        }

        set({
            edges: addEdge({ ...connection, type: 'packet', animated: true }, edges),
        });
    },

    addNode: (type: string, position: { x: number; y: number }) => {
        const { componentRegistry } = get();
        const componentDef = componentRegistry[type];
        if (!componentDef) return;

        const newNode: Node = {
            id: `${type}-${uuidv4().slice(0, 8)}`,
            type: 'custom',
            position,
            data: {
                label: componentDef.label,
                type: componentDef.type,
                config: componentDef.config_schema.reduce((acc, field) => ({
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
    },

    startSimulation: async () => {
        const { nodes, edges } = get();
        const graphData = {
            nodes: nodes.map(n => ({ id: n.id, type: n.data.type, data: n.data.config })),
            edges: edges.map(e => ({ source: e.source, target: e.target }))
        };

        const { SimulationService } = await import('@/lib/simulationService');
        const service = new SimulationService((ev: any) => {
            get().handleSimEvent(ev);
        });

        set({ 
            isSimulating: true, 
            simEvents: [], 
            offlineNodes: [],
            simStats: { 
                totalRequests: 0, 
                completedRequests: 0, 
                failedRequests: 0,
                p50Latency: 0,
                p99Latency: 0,
                throughput: 0,
                cacheHits: 0,
                cacheMisses: 0
            } 
        });
        service.startSimulation(graphData);
        (window as any).simService = service;
    },

    stopSimulation: () => {
        const service = (window as any).simService;
        if (service) {
            service.stopSimulation();
            service.disconnect();
            (window as any).simService = null;
        }
        set({ isSimulating: false, offlineNodes: [] });
        toast.info('Simulation stopped');
    },

    terminateNode: (id: string) => {
        const service = (window as any).simService;
        if (service && get().isSimulating) {
            service.terminateNode(id);
            toast.warning(`Terminating node: ${id}`);
        }
    },

    resurrectNode: (id: string) => {
        const service = (window as any).simService;
        if (service && get().isSimulating) {
            service.resurrectNode(id);
            toast.success(`Resurrecting node: ${id}`);
        }
    },

    handleSimEvent: (event: any) => {
        const { simStats, simEvents } = get();

        // If it's a global stats update from the engine
        if (event.event_type === 'SIMULATION_STATS') {
            set({
                simStats: {
                    totalRequests: event.data.total_requests,
                    completedRequests: event.data.completed_requests,
                    failedRequests: event.data.failed_requests,
                    p50Latency: event.data.p50_latency,
                    p99Latency: event.data.p99_latency,
                    throughput: event.data.throughput,
                    cacheHits: event.data.cache_hits !== undefined ? event.data.cache_hits : get().simStats.cacheHits,
                    cacheMisses: event.data.cache_misses !== undefined ? event.data.cache_misses : get().simStats.cacheMisses,
                },
                simEvents: [...simEvents.slice(-50), event]
            });
            return;
        }

        if (event.event_type === 'NODE_CRASHED') {
            set({
                offlineNodes: [...get().offlineNodes, event.source_id],
                simEvents: [...simEvents.slice(-50), event]
            });
            toast.error(`Node CRASHED: ${event.source_id}`);
            return;
        }

        if (event.event_type === 'NODE_RESTORED') {
            set({
                offlineNodes: get().offlineNodes.filter(id => id !== event.source_id),
                simEvents: [...simEvents.slice(-50), event]
            });
            toast.success(`Node RESTORED: ${event.source_id}`);
            return;
        }

        const newStats = { ...simStats };
        if (event.event_type === 'REQUEST_STARTED') {
            newStats.totalRequests += 1;
        } else if (event.event_type === 'REQUEST_COMPLETED') {
            newStats.completedRequests += 1;
        } else if (event.event_type === 'FAILURE') {
            newStats.failedRequests += 1;
        }

        set({
            simStats: newStats,
            simEvents: [...simEvents.slice(-50), event]
        });
    },

    copyNode: (id: string) => {
        const node = get().nodes.find(n => n.id === id);
        if (!node) return;

        const clipboard: ClipboardData = {
            type: node.data.type as string,
            config: JSON.parse(JSON.stringify(node.data.config)),
            label: node.data.label as string,
        };

        (window as any)._sd_clipboard = clipboard;
        toast.info('Copied component');
    },

    pasteNode: (position: { x: number; y: number }) => {
        const clipboard = (window as any)._sd_clipboard as ClipboardData;
        if (!clipboard) return;

        const newNode: Node = {
            id: `${clipboard.type}-${uuidv4().slice(0, 8)}`,
            type: 'custom',
            position,
            data: {
                label: clipboard.label,
                type: clipboard.type,
                config: JSON.parse(JSON.stringify(clipboard.config))
            },
        };

        set({
            nodes: [...get().nodes, newNode],
        });
        toast.success('Pasted component');
    },

    onReconnect: (oldEdge: Edge, newConnection: Connection) => {
        const { nodes, edges, componentRegistry } = get();
        const validation = validateConnection(newConnection, nodes, edges, componentRegistry);

        if (!validation.isValid) {
            toast.error(validation.message || 'Invalid reconnection');
            return;
        }

        set({
            edges: reconnectEdge(oldEdge, newConnection, edges),
        });
        toast.success('Edge reconnected');
    },

    deleteEdge: (id: string) => {
        set({
            edges: get().edges.filter((edge) => edge.id !== id),
        });
        toast.success('Edge deleted');
    },

    fetchComponents: async () => {
        set({ isRegistryLoading: true });
        try {
            const components = await componentApi.getComponents();
            const registry: Record<string, ComponentDefinition> = {};
            const categoriesSet = new Set<string>();

            components.forEach(comp => {
                registry[comp.type] = comp;
                categoriesSet.add(comp.category);
            });

            set({
                componentRegistry: registry,
                categories: Array.from(categoriesSet),
                isRegistryLoading: false
            });
        } catch (error) {
            console.error('Failed to fetch components:', error);
            set({ isRegistryLoading: false });
            toast.error('Failed to load components from backend');
        }
    },

    fetchTemplates: async () => {
        try {
            const templates = await componentApi.getTemplates();
            set({ templates });
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    },

    loadTemplate: (templateId: string) => {
        const { templates } = get();
        const template = templates.find(t => t.id === templateId);
        if (template) {
            set({
                systemId: uuidv4(), // New ID so it saves as new
                systemName: `${template.name} (Copy)`,
                nodes: template.graph.nodes,
                edges: template.graph.edges,
                selectedNodeId: null
            });
            toast.success(`Loaded template: ${template.name}`);
        }
    }
}));
