from typing import Any, Dict, List
from .base import BaseComponent

class LambdaFunction(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.cold_start = config.get("cold_start_latency", 0.5)
        self.exec_time = config.get("execution_time", 0.1)
        self.is_warm = False
        self.targets = targets

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        
        delay = self.exec_time
        if not self.is_warm:
            self.engine.emit_event("LAMBDA_COLD_START", self.id, data={"request_id": request_id})
            delay += self.cold_start
            self.is_warm = True
            
        yield self.env.timeout(delay)
        self.engine.emit_event("LAMBDA_EXECUTED", self.id, data={"request_id": request_id})
        
        if self.targets:
            # Fan out to all targets in parallel
            for target_id in self.targets:
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
