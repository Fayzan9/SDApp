# SDApp Visual Builder

The frontend of SDApp is a modern, interactive web application built with [Next.js](https://nextjs.org/) and [React Flow](https://xyflow.com/). It serves as the primary interface for users to design system architectures, configure component parameters, and visualize real-time simulations.

## 🚀 Key Features

- **Interactive Canvas**: Drag and drop system components, connect them with edges, and arrange them to build complex topologies.
- **Real-time Visualization**: See request flows as they happen with animated edges and node status indicators.
- **Dynamic Configuration**: Configure parameters for each component (e.g., Load Balancer policy, Cache hit rate, Server latency) directly on the canvas.
- **Template Gallery**: Browse and load predefined system templates to jumpstart your design process.
- **State Management**: Robust application state management using [Zustand](https://zustand-demo.pmnd.rs/), ensuring smooth interactions even with large graphs.

## 🏗️ Core Architecture

- **`app/`**: Next.js App Router for page structure and routing.
- **`components/`**: 
  - `SystemCanvas`: The main React Flow component for the visual graph.
  - `NodeComponents/`: Custom node definitions for various system components.
  - `Overlay/`: UI elements like sidebars, toolbars, and controls.
- **`store/`**: Zustand storage for graph state, simulation data, and UI preferences.
- **`lib/`**: Utility functions and the WebSocket client for backend communication.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+
- `npm` or `yarn`

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Create a `.env.local` file if you need to point to a specific backend URL:
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws/simulate
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to see the builder.

## 🛠️ Tech Stack

- **Framework**: Next.js (React 19)
- **Graph Engine**: @xyflow/react (React Flow)
- **Styling**: Tailwind CSS 4.0
- **State Management**: Zustand
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🔧 Developing Custom Nodes

Custom nodes are located in `components/NodeComponents/`. To add a new node:
1. Create the component file.
2. Register the node type in the `nodeTypes` object used by React Flow.
3. Define the controls and visual state for the new component.
