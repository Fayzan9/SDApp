import json
import asyncio
from enum import Enum
from typing import List, Dict, Any, Optional, Union
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from engine.core import SimulationEngine
from engine.parser import GraphParser
from engine.registry import ComponentRegistry
from engine.templates import get_templates

app = FastAPI(title="SDApp Simulation Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulationEvent(BaseModel):
    event_type: str
    source_id: str
    target_id: Optional[str] = None
    timestamp: float
    data: Optional[Dict[str, Any]] = None

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

    async def send_event(self, websocket: WebSocket, event: SimulationEvent):
        await websocket.send_text(event.json())

manager = ConnectionManager()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/api/components")
async def get_components():
    return ComponentRegistry.get_all_metadata()

@app.get("/api/templates")
async def get_all_templates():
    return get_templates()

@app.websocket("/ws/simulate")
async def websocket_simulate(websocket: WebSocket):
    await manager.connect(websocket)
    engine_task = None
    engine = None
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            command = message.get("command")
            
            if command == "START":
                graph_data = message.get("graph")
                
                def event_callback(ev):
                    asyncio.create_task(websocket.send_text(json.dumps(ev)))
                
                engine = SimulationEngine(event_callback=event_callback)
                GraphParser.parse(graph_data, engine)
                
                # Run engine in background
                if engine_task:
                    engine_task.cancel()
                engine_task = asyncio.create_task(engine.run_simulation(until=1000))
                print(f"Simulation started with {len(engine.components)} components")
                for cid, comp in engine.components.items():
                    print(f" - Component: {cid} ({type(comp).__name__})")
                
            elif command == "STOP":
                if engine_task:
                    engine_task.cancel()
                    engine_task = None
                print("Simulation stopped")
            
            elif command == "TERMINATE_NODE":
                node_id = message.get("node_id")
                if engine and node_id:
                    engine.terminate_node(node_id)
                    print(f"Node terminated: {node_id}")
            
            elif command == "RESURRECT_NODE":
                node_id = message.get("node_id")
                if engine and node_id:
                    engine.resurrect_node(node_id)
                    print(f"Node resurrected: {node_id}")
                
    except WebSocketDisconnect:
        if engine_task:
            engine_task.cancel()
        manager.disconnect(websocket)
