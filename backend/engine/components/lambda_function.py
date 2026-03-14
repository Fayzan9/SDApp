from typing import Any, Dict, List
from .base import BaseComponent

class LambdaFunction(BaseComponent):
    registry_type = "lambda_function"

    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.cold_start = config.get("cold_start_latency", 200) / 1000.0
        self.exec_time = config.get("execution_time", 50) / 1000.0
        self.targets = targets
        self.is_warm = False

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Serverless Func",
            "category": "Compute",
            "icon": "Zap",
            "description": "Event-driven serverless computing.",
            "config_schema": [
                {"name": "cold_start_latency", "label": "Cold Start", "type": "number", "default": 200, "unit": "ms"},
                {"name": "execution_time", "label": "Exec Time", "type": "number", "default": 50, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 1}
        }

    def handle_request(self, request_id: str, source_id: str):
        if not self.is_alive:
            self.engine.emit_event("FAILURE", self.id, data={"request_id": request_id, "reason": "Lambda offline"})
            return

        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        
        delay = self.exec_time
        if not self.is_warm:
            self.engine.emit_event("LAMBDA_COLD_START", self.id, data={"request_id": request_id})
            delay += self.cold_start
            self.is_warm = True
            
        yield self.env.timeout(delay)
        self.engine.emit_event("LAMBDA_EXECUTED", self.id, data={"request_id": request_id})
        
        if self.targets:
            # Forward the request to targets
            for target_id in self.targets:
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    yield self.env.process(target.handle_request(request_id, self.id))
        else:
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
