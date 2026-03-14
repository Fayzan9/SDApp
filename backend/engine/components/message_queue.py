import simpy
from typing import Any, Dict, List
from .base import BaseComponent

class MessageQueue(BaseComponent):
    registry_type = "message_queue"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.targets = targets
        self.store = simpy.Store(self.env)
        self.action = self.env.process(self.run())
        self.current_idx = 0

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Message Queue",
            "category": "Messaging",
            "icon": "MessageSquare",
            "description": "Asynchronous message broker.",
            "config_schema": [
                {"name": "latency", "label": "Processing Delay", "type": "number", "default": 100, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        if not self.is_alive:
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "Queue offline"})
            return

        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        self.engine.emit_event("MSG_ENQUEUED", self.id, data={"request_id": request_id})
        yield self.store.put(request_id)

    def run(self):
        while True:
            request_id = yield self.store.get()
            self.engine.emit_event("MSG_DEQUEUED", self.id, data={"request_id": request_id})
            
            # Distribute messages to workers/consumers (Round Robin)
            if self.targets:
                target_id = self.targets[self.current_idx]
                self.current_idx = (self.current_idx + 1) % len(self.targets)
                
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    self.env.process(target.handle_request(request_id, self.id))
            
            # Processing delay
            latency = self.config.get("latency", 100) / 1000.0
            yield self.env.timeout(latency)
