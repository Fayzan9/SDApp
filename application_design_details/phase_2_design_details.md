# Phase 2 Design Details: Simulation Engine

Phase 2 focuses on making the static architecture "come alive." We will implement a discrete-event simulation engine on the backend and stream the results back to the frontend in real-time.

---

## Phase 2 Objectives

Deliver a working **Simulation Engine** where users can:
1. Click "Run Simulation" to start the process.
2. See "requests" (visual packets) moving along connections in real-time.
3. Observe component behavior (queues building up, latency delays).
4. View basic performance metrics (Throughput, P50/P99 Latency).

---

## 1. Backend Architecture (FastAPI + SimPy)

We will introduce a Python backend to handle the heavy lifting of system modeling.

### The Simulation Engine (SimPy)
- **Discrete Event Simulation**: Every request is an "event" with a timestamp.
- **Resource Modeling**: Servers and Load Balancers are modeled as SimPy `Resources` with limited capacity.
- **Process Flow**:
    1. **Generator process** (Client): Creates requests at a configured interval.
    2. **Routing process** (LB): Decides which downstream node gets the request.
    3. **Processing process** (Server): Holds the request for `latency` duration.
    4. **Sink process**: Marks the request as completed and records metrics.

### Real-Time Streaming (WebSockets)
- The backend will push "events" as they happen in "simulation time" (mapped to real time).
- Event Types: `REQUEST_STARTED`, `REQUEST_MOVED`, `NODE_PROCESSING`, `REQUEST_COMPLETED`, `FAILURE`.

---

## 2. Component Behavior Models

Each component from Phase 1 gets a corresponding logic model in Phase 2.

### Client
- **Configuration**: Requests per second (RPS).
- **Behavior**: Generates a new unique `RequestID` every `1/RPS` seconds.

### Load Balancer
- **Configuration**: Algorithm (Round Robin, Least Connections).
- **Behavior**: Inspects downstream server states and forwards the request.

### Server
- **Configuration**: Base Latency, Max Concurrent Requests.
- **Behavior**: If at capacity, requests enter a queue. Processing takes `Base Latency`.

### Connection (Edge)
- **Behavior**: Adds a slight "wire delay" to the simulation to make the movement visible.

---

## 3. Frontend Visualization

Visualizing the simulation without breaking the builder experience.

### Motion Visualization
- **Packet Animation**: Small circles or icons moving along the React Flow edges.
- **Node State**: Nodes change color (e.g., pulse blue when processing, red on failure).

### Metrics Dashboard
- A sliding panel or overlay showing:
    - **Total Requests**: successfully processed.
    - **TPS (Transactions Per Second)**: Live throughput.
    - **Latency Distribution**: Simple chart showing p50/p95.

---

## 4. MVP Simulation Flow

1. **Serialize**: Frontend converts the React Flow graph into a clean `SystemGraph` JSON.
2. **Post**: Send JSON to `/api/simulate`.
3. **Stream**: Backend initializes SimPy and opens a WebSocket.
4. **Animate**: Frontend listens to WebSocket and triggers animations on the canvas.

---

## 5. Phase 2 Success Criteria

- A user can build a `Client -> LB -> Server` architecture.
- Click "Run".
- See 100 requests flow through the LB and split between servers.
- See the TPS metric stabilize around the configured RPS of the client.
