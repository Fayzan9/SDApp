from typing import Any, Dict, List
from .base import BaseComponent

class Gateway(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.targets = targets
        self.latency = config.get("latency", 0.02)

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        self.engine.emit_event("GATEWAY_ROUTING", self.id, data={"request_id": request_id})
        
        if self.targets:
            target_id = self.targets[0] # Simple routing for now
            target = self.engine.components.get(target_id)
            if target and hasattr(target, "handle_request"):
                yield self.env.process(target.handle_request(request_id, self.id))
