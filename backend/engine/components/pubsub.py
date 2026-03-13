from typing import Any, Dict, List
from .base import BaseComponent

class PubSub(BaseComponent):
    registry_type = "pub_sub"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.targets = targets
        self.latency = config.get("latency", 5) / 1000.0 # Very low overhead

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Pub/Sub",
            "category": "Messaging",
            "icon": "Activity",
            "description": "Asynchronous event bus for fan-out messaging.",
            "config_schema": [
                {"name": "latency", "label": "Bus Latency", "type": "number", "default": 5, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        self.engine.emit_event("PUB_PUBLISHED", self.id, data={"request_id": request_id, "subscriber_count": len(self.targets)})
        
        # Fan out! Process all targets in parallel
        for target_id in self.targets:
            target = self.engine.components.get(target_id)
            if target and hasattr(target, "handle_request"):
                self.env.process(target.handle_request(request_id, self.id))
