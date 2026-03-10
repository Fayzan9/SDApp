import { Node, Edge } from '@xyflow/react';

export interface SystemGraph {
    id: string;
    name: string;
    nodes: Node[];
    edges: Edge[];
    updatedAt: number;
}

const STORAGE_KEY = 'systemflow_architectures';

export const persistence = {
    save: (graph: Omit<SystemGraph, 'updatedAt'>) => {
        const data: SystemGraph = {
            ...graph,
            updatedAt: Date.now(),
        };

        const existing = persistence.getAll();
        const index = existing.findIndex(g => g.id === graph.id);

        if (index >= 0) {
            existing[index] = data;
        } else {
            existing.push(data);
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        return data;
    },

    getAll: (): SystemGraph[] => {
        if (typeof window === 'undefined') return [];
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    },

    getById: (id: string): SystemGraph | undefined => {
        return persistence.getAll().find(g => g.id === id);
    },

    delete: (id: string) => {
        const existing = persistence.getAll().filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    },

    clearAll: () => {
        localStorage.removeItem(STORAGE_KEY);
    }
};
