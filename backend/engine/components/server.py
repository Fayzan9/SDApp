import simpy
from typing import Any, Dict
from .base import BaseComponent

class Server(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 0.5)
        self.capacity = config.get("capacity", 1)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        with self.resource.request() as req:
            yield req
            self.engine.emit_event("NODE_PROCESSING", self.id, data={"request_id": request_id})
            yield self.env.timeout(self.latency)
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
