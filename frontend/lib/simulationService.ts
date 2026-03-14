export class SimulationService {
    private ws: WebSocket | null = null;
    private onEvent: (event: any) => void;

    constructor(onEvent: (event: any) => void) {
        this.onEvent = onEvent;
    }

    connect() {
        if (this.ws) return;
        this.ws = new WebSocket('ws://localhost:8000/ws/simulate');

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.onEvent(data);
            } catch (e) {
                console.error('Failed to parse simulation event', e);
            }
        };

        this.ws.onclose = () => {
            this.ws = null;
            console.log('Simulation WebSocket closed');
        };
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    async startSimulation(graphData: any) {
        if (!this.ws) this.connect();

        let attempts = 0;
        while (this.ws?.readyState !== WebSocket.OPEN && attempts < 10) {
            await new Promise(r => setTimeout(r, 500));
            attempts++;
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ command: 'START', graph: graphData }));
        }
    }

    stopSimulation() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ command: 'STOP' }));
        }
    }

    terminateNode(nodeId: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ command: 'TERMINATE_NODE', node_id: nodeId }));
        }
    }

    resurrectNode(nodeId: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ command: 'RESURRECT_NODE', node_id: nodeId }));
        }
    }
}
