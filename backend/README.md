# SDApp Simulation Engine

The backend of SDApp is a high-performance simulation engine built with [FastAPI](https://fastapi.tiangolo.com/) and [SimPy](https://simpy.readthedocs.io/). It is responsible for parsing system design graphs, modeling component behavior, and executing real-time discrete-event simulations.

## 🚀 Key Responsibilities

- **Graph Parsing**: Converts the visual graph data from the frontend into a simulation-ready object model.
- **Component Registry**: Manages a library of system components (Load Balancers, Caches, Servers, etc.) with their associated behaviors and metadata.
- **Discrete-Event Simulation**: Uses SimPy to simulate request flows, processing delays, and resource contention.
- **Real-time Updates**: Streams simulation events (request movement, status changes) back to the frontend via WebSockets.

## 🏗️ Core Components

- `engine/core.py`: The heart of the simulation, managing the clock and component execution.
- `engine/parser.py`: Handles the transformation of frontend JSON into backend component instances.
- `engine/registry.py`: Central repository for all available component types and their schemas.
- `main.py`: The FastAPI application entry point, providing REST and WebSocket endpoints.

## 🛠️ Setup Instructions

### Prerequisites
- Python 3.10+
- `pip`

### 1. Create a Virtual Environment
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Server
```bash
uvicorn main:app --reload
```
The server will be available at [http://localhost:8000](http://localhost:8000).

## 📡 API Endpoints

- `GET /health`: Check server health.
- `GET /api/components`: Retrieve metadata for all available system components.
- `GET /api/templates`: Get predefined system architecture templates.
- `WS /ws/simulate`: WebSocket endpoint for running and controlling simulations.

## 🔧 Adding New Components

New components can be added by:
1. Defining the component class in `engine/components/`.
2. Registering the component and its metadata in `engine/registry.py`.
3. Defining the simulation behavior (e.g., request handling logic).

Refer to `application_design_details/COMPONENT_REVIEW_SUMMARY.md` for more details on component schemas.
