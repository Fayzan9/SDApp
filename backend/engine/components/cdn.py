import random
from typing import Any, Dict, List
from .base import BaseComponent

class CDN(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.hit_rate = config.get("hit_rate", 0.9)
        self.latency = config.get("latency", 0.01)
        self.targets = targets

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        
        is_hit = random.random() < self.hit_rate
        if is_hit:
            self.engine.emit_event("CDN_HIT", self.id, data={"request_id": request_id})
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
        else:
            self.engine.emit_event("CDN_MISS", self.id, data={"request_id": request_id})
            if self.targets:
                target_id = self.targets[0]
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
