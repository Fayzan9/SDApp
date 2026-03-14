import simpy
from typing import Any, Dict, List
from .base import BaseComponent

class Server(BaseComponent):
    registry_type = "server"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str] = None):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 50) / 1000.0
        self.capacity = config.get("instances", 1)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)
        self.targets = targets or []

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "App Server",
            "category": "Compute",
            "icon": "Server",
            "description": "A generic application server.",
            "config_schema": [
                {"name": "instances", "label": "Instances", "type": "number", "default": 1},
                {"name": "latency", "label": "Base Latency", "type": "number", "default": 50, "unit": "ms"},
                {"name": "failure_rate", "label": "Failure Rate", "type": "number", "default": 0.1, "unit": "%"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        if not self.is_alive:
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "Node offline"})
            return

        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        
        # Check for failure based on configured rate (failure_rate is in %)
        import random
        failure_rate = self.config.get("failure_rate", 0.0) / 100.0
        if random.random() < failure_rate:
            yield self.env.timeout(0.02) # Simulated failure detection time
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "Server error"})
            return

        with self.resource.request() as req:
            yield req
            self.engine.emit_event("NODE_PROCESSING", self.id, data={"request_id": request_id})
            yield self.env.timeout(self.latency)
            
            if self.targets:
                target_id = self.targets[0]
                print(f"[Server {self.id}] Forwarding request {request_id} to {target_id}")
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
            else:
                self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
