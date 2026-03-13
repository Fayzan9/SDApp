export interface ConfigField {
    name: string;
    label: string;
    type: 'number' | 'string' | 'select' | 'boolean';
    default: any;
    unit?: string;
    options?: string[];
}

export interface ComponentDefinition {
    type: string;
    label: string;
    category: string;
    icon: string; // This will be the Lucide icon name
    description: string;
    config_schema: ConfigField[];
    ports: {
        inputs: number;
        outputs: number;
    };
}

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export const componentApi = {
    async getComponents(): Promise<ComponentDefinition[]> {
        try {
            const response = await fetch(`${BACKEND_URL}/api/components`);
            if (!response.ok) {
                throw new Error('Failed to fetch components');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching components:', error);
            return [];
        }
    }
};
