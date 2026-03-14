import random
from typing import Any, Dict, List
from .base import BaseComponent

class CDN(BaseComponent):
    registry_type = "cdn"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.hit_rate = config.get("hit_rate", 90) / 100.0
        self.latency = config.get("latency", 10) / 1000.0
        self.targets = targets
        self.current_idx = 0

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "CDN",
            "category": "Networking",
            "icon": "Globe",
            "description": "Content Delivery Network for static assets.",
            "config_schema": [
                {"name": "hit_rate", "label": "Hit Rate", "type": "number", "default": 90, "unit": "%"},
                {"name": "latency", "label": "Edge Latency", "type": "number", "default": 10, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        if not self.is_alive:
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "CDN offline"})
            return

        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        
        is_hit = random.random() < self.hit_rate
        if is_hit:
            self.engine.emit_event("CDN_HIT", self.id, data={"request_id": request_id})
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
        else:
            self.engine.emit_event("CDN_MISS", self.id, data={"request_id": request_id})
            if self.targets:
                target_id = self.targets[self.current_idx]
                self.current_idx = (self.current_idx + 1) % len(self.targets)
                
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
            else:
                self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "CDN miss with no origin"})
