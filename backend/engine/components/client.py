from typing import Any, Dict, List
from .base import BaseComponent

class Client(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.rps = config.get("rps", 1.0)
        self.targets = targets
        self.action = self.env.process(self.run())
        self.current_idx = 0

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
