from typing import Any, Dict, List
from .base import BaseComponent

class Gateway(BaseComponent):
    registry_type = "api_gateway"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.targets = targets
        self.latency = config.get("timeout", 3000) / 1000.0 # Using timeout as a proxy for latency config

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "API Gateway",
            "category": "Networking",
            "icon": "Layers",
            "description": "Entry point for all clients, handles routing and authentication.",
            "config_schema": [
                {"name": "timeout", "label": "Timeout", "type": "number", "default": 3000, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        if not self.is_alive:
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "Gateway offline"})
            return

        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        # Gateway overhead
        yield self.env.timeout(0.005) 
        self.engine.emit_event("GATEWAY_ROUTING", self.id, data={"request_id": request_id})
        
        if self.targets:
            target_id = self.targets[0] # Simple routing for now
            target = self.engine.components.get(target_id)
            if target and hasattr(target, "handle_request"):
                yield self.env.process(target.handle_request(request_id, self.id))
