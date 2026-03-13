import {
    Server,
    Database,
    Cpu,
    Globe,
    Smartphone,
    Layout,
    Zap,
    Repeat,
    Layers,
    HardDrive,
    MessageSquare,
    ShieldCheck,
    Search,
    Activity
} from 'lucide-react';

export type ComponentCategory = 'Clients' | 'Networking' | 'Compute' | 'Storage' | 'Performance' | 'Messaging' | 'Security';

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
    category: ComponentCategory;
    icon: any;
    description: string;
    configSchema: ConfigField[];
    ports: {
        inputs: number;
        outputs: number;
    };
}

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
    web_client: {
        type: 'web_client',
        label: 'Web Client',
        category: 'Clients',
        icon: Globe,
        description: 'A browser-based user client.',
        configSchema: [
            { name: 'requests_per_sec', label: 'Requests/sec', type: 'number', default: 10, unit: 'req/s' },
        ],
        ports: { inputs: 0, outputs: 1 }
    },
    mobile_client: {
        type: 'mobile_client',
        label: 'Mobile Client',
        category: 'Clients',
        icon: Smartphone,
        description: 'A mobile application client.',
        configSchema: [
            { name: 'requests_per_sec', label: 'Requests/sec', type: 'number', default: 5, unit: 'req/s' },
        ],
        ports: { inputs: 0, outputs: 1 }
    },
    load_balancer: {
        type: 'load_balancer',
        label: 'Load Balancer',
        category: 'Networking',
        icon: Repeat,
        description: 'Distributes incoming traffic across multiple servers.',
        configSchema: [
            { name: 'algorithm', label: 'Algorithm', type: 'select', default: 'round_robin', options: ['round_robin', 'least_connections', 'random'] },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    api_gateway: {
        type: 'api_gateway',
        label: 'API Gateway',
        category: 'Networking',
        icon: Layers,
        description: 'Entry point for all clients, handles routing and authentication.',
        configSchema: [
            { name: 'timeout', label: 'Timeout', type: 'number', default: 3000, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    server: {
        type: 'server',
        label: 'App Server',
        category: 'Compute',
        icon: Server,
        description: 'A generic application server.',
        configSchema: [
            { name: 'instances', label: 'Instances', type: 'number', default: 1 },
            { name: 'latency', label: 'Base Latency', type: 'number', default: 50, unit: 'ms' },
            { name: 'failure_rate', label: 'Failure Rate', type: 'number', default: 0.1, unit: '%' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    worker: {
        type: 'worker',
        label: 'Worker',
        category: 'Compute',
        icon: Cpu,
        description: 'Background job processor.',
        configSchema: [
            { name: 'concurrency', label: 'Concurrency', type: 'number', default: 5 },
        ],
        ports: { inputs: 1, outputs: 0 }
    },
    database: {
        type: 'database',
        label: 'Database',
        category: 'Storage',
        icon: Database,
        description: 'Relational or NoSQL data store.',
        configSchema: [
            { name: 'type', label: 'DB Type', type: 'select', default: 'postgresql', options: ['postgresql', 'mongodb', 'mysql', 'redis'] },
            { name: 'latency', label: 'Query Latency', type: 'number', default: 100, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 0 }
    },
    cache: {
        type: 'cache',
        label: 'Cache',
        category: 'Performance',
        icon: Zap,
        description: 'In-memory data store for fast access.',
        configSchema: [
            { name: 'hit_rate', label: 'Hit Rate', type: 'number', default: 80, unit: '%' },
            { name: 'ttl', label: 'Default TTL', type: 'number', default: 3600, unit: 's' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    cdn: {
        type: 'cdn',
        label: 'CDN',
        category: 'Networking',
        icon: Globe,
        description: 'Content Delivery Network for static assets.',
        configSchema: [
            { name: 'hit_rate', label: 'Hit Rate', type: 'number', default: 90, unit: '%' },
            { name: 'latency', label: 'Edge Latency', type: 'number', default: 10, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    firewall: {
        type: 'firewall',
        label: 'Firewall',
        category: 'Security',
        icon: ShieldCheck,
        description: 'Filters incoming traffic based on security rules.',
        configSchema: [
            { name: 'drop_rate', label: 'Drop Rate', type: 'number', default: 0, unit: '%' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    lambda_function: {
        type: 'lambda_function',
        label: 'Serverless Func',
        category: 'Compute',
        icon: Zap,
        description: 'Event-driven serverless computing.',
        configSchema: [
            { name: 'cold_start_latency', label: 'Cold Start', type: 'number', default: 200, unit: 'ms' },
            { name: 'execution_time', label: 'Exec Time', type: 'number', default: 50, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 1 }
    },
    blob_storage: {
        type: 'blob_storage',
        label: 'Blob Storage',
        category: 'Storage',
        icon: HardDrive,
        description: 'Unstructured object storage (e.g. S3).',
        configSchema: [
            { name: 'latency', label: 'Access Latency', type: 'number', default: 100, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 0 }
    },
    message_queue: {
        type: 'message_queue',
        label: 'Message Queue',
        category: 'Messaging',
        icon: MessageSquare,
        description: 'Asynchronous message broker.',
        configSchema: [],
        ports: { inputs: 1, outputs: 1 }
    },
    pub_sub: {
        type: 'pub_sub',
        label: 'Pub/Sub',
        category: 'Messaging',
        icon: Activity,
        description: 'Asynchronous event bus for fan-out messaging.',
        configSchema: [
            { name: 'latency', label: 'Bus Latency', type: 'number', default: 5, unit: 'ms' },
        ],
        ports: { inputs: 1, outputs: 1 }
    }
};

export const CATEGORIES: ComponentCategory[] = ['Clients', 'Networking', 'Compute', 'Storage', 'Performance', 'Messaging', 'Security'];
