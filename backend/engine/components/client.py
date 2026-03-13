from typing import Any, Dict, List
from .base import BaseComponent

class WebClient(BaseComponent):
    registry_type = "web_client"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.rps = config.get("requests_per_sec", 10.0)
        self.targets = targets
        self.action = self.env.process(self.run())
        self.current_idx = 0

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Web Client",
            "category": "Clients",
            "icon": "Globe",
            "description": "A browser-based user client.",
            "config_schema": [
                {"name": "requests_per_sec", "label": "Requests/sec", "type": "number", "default": 10, "unit": "req/s"},
            ],
            "ports": {"inputs": 0, "outputs": 1}
        }

    def run(self):
        while True:
            # Generate request
            request_id = f"req_{self.env.now:.3f}_{self.id}"
            self.engine.emit_event("REQUEST_STARTED", self.id, data={"request_id": request_id})
            
            # Send to targets
            if self.targets:
                # Pick target using Round Robin
                target_id = self.targets[self.current_idx]
                self.current_idx = (self.current_idx + 1) % len(self.targets)
                
                # Trigger target handling
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    self.env.process(target.handle_request(request_id, self.id))

            yield self.env.timeout(1.0 / self.rps)

class MobileClient(WebClient):
    registry_type = "mobile_client"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config, targets)
        self.rps = config.get("requests_per_sec", 5.0)

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Mobile Client",
            "category": "Clients",
            "icon": "Smartphone",
            "description": "A mobile application client.",
            "config_schema": [
                {"name": "requests_per_sec", "label": "Requests/sec", "type": "number", "default": 5, "unit": "req/s"},
            ],
            "ports": {"inputs": 0, "outputs": 1}
        }

class Client(WebClient):
    """Deprecated: Use WebClient or MobileClient instead."""
    pass
