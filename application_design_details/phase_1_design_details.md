Phase 1 should focus strictly on the **visual system builder** and **architecture persistence**, not simulation yet. The goal is that a user can **visually construct a system architecture and save/load it**. If this layer is designed correctly, Phase 2 (simulation) becomes much easier.

Below is a structured planning breakdown.

---

# Phase 1 Objective

Deliver a working **System Architecture Builder** where users can:

1. Drag components onto a canvas
2. Connect them
3. Configure component parameters
4. Save/load architectures
5. Validate topology

No request simulation yet.

---

# 1. Core Product Concepts

Your product revolves around three core models.

## Component (Node)

Represents infrastructure pieces.

Examples:

* Client
* Load Balancer
* Server
* Cache
* Database
* CDN
* API Gateway

Each node has:

```
id
type
position
config
ports
```

Example:

```
{
 id: "server-1",
 type: "server",
 position: {x: 300, y: 200},
 config: {
   instances: 2,
   latency: 50
 }
}
```

---

## Connection (Edge)

Represents **data/request flow**.

Example:

```
client → load_balancer
load_balancer → server
server → cache
```

Edge structure:

```
{
 id: "edge-1",
 source: "client-1",
 target: "lb-1"
}
```

---

## System Graph

Entire architecture.

```
{
 nodes: [],
 edges: [],
 metadata: {}
}
```

This graph becomes the **input for the simulation engine later**.

Design this well now.

---

# 2. UI Layout (From Your Sketch)

Your layout has three main areas.

## Left Panel — Component Library

Contains draggable components.

Sections:

```
Clients
Networking
Compute
Storage
Performance
```

Example items:

```
Client
Load Balancer
API Gateway
Server
Cache
Database
CDN
Queue
Blob Storage
DNS
```

Each item is a **draggable node template**.

---

## Center Canvas — System Builder

Responsibilities:

* Node placement
* Node connection
* Zoom/pan
* Multi-selection
* Deletion

This will use **React Flow**.

Canvas features needed:

```
drag node
connect nodes
move nodes
zoom
snap to grid
delete nodes
```

Future features:

```
group nodes
subgraphs
regions
```

---

## Right Panel — Configuration

Shows **selected node configuration**.

Example when selecting **Server**:

```
Server Config

Instances: 3
Latency: 20ms
Failure Rate: 1%
CPU Capacity: 100 req/sec
```

Example when selecting **Load Balancer**:

```
Algorithm:
- Round Robin
- Least Connections
- Random
```

Config must be **schema driven**.

---

# 3. Component Definition System

Instead of hardcoding components in the UI, define them in a **component registry**.

Example:

```
componentRegistry = {
 client: {...},
 loadBalancer: {...},
 server: {...}
}
```

Component definition example:

```
{
 type: "server",
 label: "Server",
 category: "compute",
 icon: "serverIcon",
 configSchema: [
   {
     name: "instances",
     type: "number",
     default: 1
   },
   {
     name: "latency",
     type: "number",
     unit: "ms"
   }
 ]
}
```

Benefits:

* scalable
* simulation engine uses same schema
* easier to add components later

---

# 4. Node Types

Your nodes must visually represent infrastructure.

Define node types.

Example:

### Client Node

Outputs requests.

Ports:

```
output
```

---

### Load Balancer

Ports:

```
input
output
```

---

### Server

Ports:

```
input
output
```

---

### Cache

Ports:

```
input
output
```

---

### Database

Ports:

```
input
```

No output.

---

Ports are important for validation later.

---

# 5. Topology Validation

Before simulation, architectures should be validated.

Rules examples:

Invalid:

```
Database → Client
Cache → Client
```

Valid:

```
Client → LB → Server → DB
```

Rules:

1. Client must be start node
2. Database must be terminal node
3. Load balancer must have multiple outputs
4. No cycles (optional)

Validation engine will run on the graph.

---

# 6. State Management

Canvas state will contain:

```
nodes
edges
selectedNode
systemMetadata
```

Recommended library:

**Zustand**

Why:

* lightweight
* easy for graph state
* works well with React Flow

---

# 7. Persistence

Users should save architectures.

Architecture model:

```
SystemDesign
```

Fields:

```
id
name
nodes
edges
createdAt
updatedAt
```

Nodes and edges stored as JSON.

Storage options:

Early stage:

```
local storage
```

Later:

```
PostgreSQL
```

---

# 8. UX Interactions

Important interactions.

## Drag from library

User drags **Server** → Canvas creates node.

---

## Connect nodes

User drags connection handle.

```
Client → LB
```

Edge created.

---

## Select node

Shows configuration panel.

---

## Delete node

Removes edges automatically.

---

## Save architecture

Stores JSON.

---

# 9. Visual System Feedback

Provide visual hints.

Examples:

Edge animation:

```
Client → Server
```

Moving dotted line indicates request flow.

Even in Phase 1 this improves UX.

---

# 10. Node Visual Design

Nodes should resemble infrastructure icons.

Example layout:

```
[icon]
Server
Instances: 3
```

Or:

```
┌───────────┐
│   Server  │
│ instances │
└───────────┘
```

Later nodes can show **live metrics**.

---

# 11. Folder Structure (Frontend)

Suggested structure.

```
/app
/system-builder

/components
  canvas
  nodeTypes
  panels
  library

/lib
  componentRegistry
  graphUtils

/store
  systemStore
```

---

# 12. Component Categories

Your left panel categories:

```
Clients
Networking
Compute
Storage
Performance
Messaging
Security
```

Example components:

Clients

```
Web Client
Mobile Client
API Client
```

Networking

```
DNS
Load Balancer
API Gateway
CDN
```

Compute

```
Server
Worker
Serverless Function
```

Storage

```
Database
Blob Storage
```

Performance

```
Cache
```

Messaging

```
Queue
Stream
```

---

# 13. Edge Types

Not all connections are the same.

Example:

```
request flow
data replication
cache lookup
```

But Phase 1 should support only:

```
request flow
```

---

# 14. Graph Utilities

Utilities you'll need.

```
addNode
deleteNode
connectNodes
validateGraph
serializeGraph
deserializeGraph
```

---

# 15. Phase 1 Deliverables

By the end you should have:

Users can:

```
drag components
connect them
configure nodes
save/load architectures
validate graph
```

Example architecture users can build:

```
Client
  ↓
Load Balancer
  ↓
Server
  ↓
Cache
  ↓
Database
```

---

# 16. Phase 1 Success Criteria

If a student can open the app and **visually recreate a system design interview diagram**, Phase 1 is successful.

Example:

```
Twitter timeline architecture
YouTube video delivery
URL shortener
```

---

If you'd like, the next step I recommend is designing **three extremely important things before coding**:

1. **The component registry system**
2. **The system graph schema**
3. **The node behavior models (for simulation)**

These decisions will determine whether your project becomes **a simple diagram tool or a true system design simulator**.
