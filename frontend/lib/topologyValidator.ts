import { Node, Edge, Connection } from '@xyflow/react';
import { COMPONENT_REGISTRY } from './componentRegistry';

export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export const validateConnection = (
    connection: Connection,
    nodes: Node[],
    edges: Edge[]
): ValidationResult => {
    const sourceNode = nodes.find((n) => n.id === connection.source);
    const targetNode = nodes.find((n) => n.id === connection.target);

    if (!sourceNode || !targetNode) {
        return { isValid: false, message: 'Source or target node not found.' };
    }

    const sourceDef = COMPONENT_REGISTRY[sourceNode.data.type as string];
    const targetDef = COMPONENT_REGISTRY[targetNode.data.type as string];

    // 1. Check Port Availability (Phase 1 basic: just check if they have ports)
    if (sourceDef.ports.outputs === 0) {
        return { isValid: false, message: `${sourceDef.label} cannot have outgoing connections.` };
    }
    if (targetDef.ports.inputs === 0) {
        return { isValid: false, message: `${targetDef.label} cannot have incoming connections.` };
    }

    // 2. Specific Rules from Phase 1 requirements
    // Rule: Database must be terminal (already handled by ports.outputs = 0)
    // Rule: Client must be start (already handled by ports.inputs = 0)

    // 3. Prevent self-connections
    if (connection.source === connection.target) {
        return { isValid: false, message: 'Cannot connect a node to itself.' };
    }

    // 4. Prevent duplicate connections
    const existingEdge = edges.find(
        (e) => e.source === connection.source && e.target === connection.target
    );
    if (existingEdge) {
        return { isValid: false, message: 'Connection already exists.' };
    }

    return { isValid: true };
};

export const validateGraph = (nodes: Node[], edges: Edge[]): ValidationResult => {
    if (nodes.length === 0) return { isValid: true };

    // Rule: Must have at least one Client to be a valid system
    const hasClient = nodes.some(n =>
        COMPONENT_REGISTRY[n.data.type as string]?.category === 'Clients'
    );

    if (!hasClient) {
        return { isValid: false, message: 'Architecture must include at least one Client.' };
    }

    // Rule: All nodes (except clients) should have an input
    const orphanNodes = nodes.filter(n => {
        const def = COMPONENT_REGISTRY[n.data.type as string];
        if (def.category === 'Clients') return false;
        return !edges.some(e => e.target === n.id);
    });

    if (orphanNodes.length > 0) {
        return {
            isValid: false,
            message: `System has disconnected components: ${orphanNodes.map(n => n.data.label).join(', ')}`
        };
    }

    return { isValid: true };
};
