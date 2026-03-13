import simpy
from typing import Any, Dict
from .base import BaseComponent

class Server(BaseComponent):
    registry_type = "server"

    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 50) / 1000.0
        self.capacity = config.get("instances", 1)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)

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
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        with self.resource.request() as req:
            yield req
            self.engine.emit_event("NODE_PROCESSING", self.id, data={"request_id": request_id})
            yield self.env.timeout(self.latency)
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
