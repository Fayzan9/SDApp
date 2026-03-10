import pytest
import asyncio
from backend.engine.core import SimulationEngine
from backend.engine.models import Client, Server
from backend.engine.parser import GraphParser

def test_basic_simulation():
    events = []
    def callback(ev):
        events.append(ev)

    engine = SimulationEngine(event_callback=callback)
    
    # Mock graph data: Client -> Server
    graph_data = {
        "nodes": [
            {"id": "c1", "type": "client", "data": {"rps": 10}},
            {"id": "s1", "type": "server", "data": {"latency": 0.1, "capacity": 1}}
        ],
        "edges": [
            {"source": "c1", "target": "s1"}
        ]
    }

    GraphParser.parse(graph_data, engine)
    
    # Run synchronously for test (since we are using env.step)
    # Simulate 5 ticks
    for _ in range(50): # Small steps
        if engine.env.peek() > 1.0:
            break
        engine.env.step()

    # Check for event types
    event_types = [e["event_type"] for e in events]
    assert "REQUEST_STARTED" in event_types
    assert "REQUEST_MOVED" in event_types
    assert "NODE_PROCESSING" in event_types
    assert "REQUEST_COMPLETED" in event_types
