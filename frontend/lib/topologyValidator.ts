import { Connection, Node, Edge } from '@xyflow/react';
import { ComponentDefinition } from './componentApi';

export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export const validateConnection = (
    connection: Connection,
    nodes: Node[],
    edges: Edge[],
    componentRegistry: Record<string, ComponentDefinition>
): ValidationResult => {
    const sourceNode = nodes.find(n => n.id === connection.source);
    const targetNode = nodes.find(n => n.id === connection.target);

    if (!sourceNode || !targetNode) {
        return { isValid: false, message: 'Source or target node not found' };
    }

    const sourceDef = componentRegistry[sourceNode.data.type as string];
    const targetDef = componentRegistry[targetNode.data.type as string];

    if (!sourceDef || !targetDef) {
        return { isValid: false, message: 'Component definition not found' };
    }

    // Prevent self-connections
    if (connection.source === connection.target) {
        return { isValid: false, message: 'Cannot connect a node to itself.' };
    }

    // Basic rule: can't connect more than outputs allow (if we had such a rule)
    // For now, let's just use the ports info if needed.
    
    // Check if target has inputs
    if (targetDef.ports.inputs === 0) {
        return { 
            isValid: false, 
            message: `${targetDef.label} does not accept incoming connections` 
        };
    }

    // Check if source has outputs
    if (sourceDef.ports.outputs === 0) {
        return { 
            isValid: false, 
            message: `${sourceDef.label} does not have outgoing ports` 
        };
    }

    // Prevent duplicate connections
    const existingEdge = edges.find(
        (e) => e.source === connection.source && e.target === connection.target
    );
    if (existingEdge) {
        return { isValid: false, message: 'Connection already exists.' };
    }

    return { isValid: true };
};

export const validateGraph = (
    nodes: Node[], 
    edges: Edge[],
    componentRegistry: Record<string, ComponentDefinition>
): ValidationResult => {
    if (nodes.length === 0) return { isValid: true };

    // Rule: Must have at least one Client to be a valid system
    const hasClient = nodes.some(n =>
        componentRegistry[n.data.type as string]?.category === 'Clients'
    );

    if (!hasClient) {
        return { isValid: false, message: 'Architecture must include at least one Client.' };
    }

    // Rule: All nodes (except clients) should have an input
    const orphanNodes = nodes.filter(n => {
        const def = componentRegistry[n.data.type as string];
        if (!def || def.category === 'Clients') return false;
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
