import random
from typing import Any, Dict, List
from .base import BaseComponent

class Firewall(BaseComponent):
    registry_type = "firewall"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.drop_rate = config.get("drop_rate", 0) / 100.0
        self.latency = config.get("latency", 2) / 1000.0
        self.targets = targets

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Firewall",
            "category": "Security",
            "icon": "ShieldCheck",
            "description": "Filters incoming traffic based on security rules.",
            "config_schema": [
                {"name": "drop_rate", "label": "Drop Rate", "type": "number", "default": 0, "unit": "%"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        
        is_blocked = random.random() < self.drop_rate
        if is_blocked:
            self.engine.emit_event("FIREWALL_BLOCKED", self.id, data={"request_id": request_id})
        else:
            self.engine.emit_event("FIREWALL_ALLOWED", self.id, data={"request_id": request_id})
            if self.targets:
                target_id = self.targets[0]
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
