from typing import Any, Dict, List
from .base import BaseComponent

class LoadBalancer(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.targets = targets
        self.strategy = config.get("strategy", "round_robin")
        self.current_idx = 0

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        
        if not self.targets:
            return

        # Simple Round Robin
        target_id = self.targets[self.current_idx]
        self.current_idx = (self.current_idx + 1) % len(self.targets)
        
        target = self.engine.components.get(target_id)
        if target and hasattr(target, "handle_request"):
            yield self.env.process(target.handle_request(request_id, self.id))
