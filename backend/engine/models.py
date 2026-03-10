import simpy
from typing import Any, Dict, List

class BaseComponent:
    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        self.engine = engine
        self.env = engine.env
        self.id = component_id
        self.config = config

class Client(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any], targets: List[str]):
        super().__init__(engine, component_id, config)
        self.rps = config.get("rps", 1.0)
        self.targets = targets
        self.action = self.env.process(self.run())

    def run(self):
        while True:
            # Generate request
            request_id = f"req_{self.env.now}_{self.id}"
            self.engine.emit_event("REQUEST_STARTED", self.id, data={"request_id": request_id})
            
            # Send to targets (for now just pick first or broadcast)
            if self.targets:
                target_id = self.targets[0] # Simplest: first target
                # Trigger target handling
                target = self.engine.components.get(target_id)
                if target and hasattr(target, "handle_request"):
                    self.env.process(target.handle_request(request_id, self.id))

            yield self.env.timeout(1.0 / self.rps)

class Server(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 0.5)
        self.capacity = config.get("capacity", 1)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        with self.resource.request() as req:
            yield req
            self.engine.emit_event("NODE_PROCESSING", self.id, data={"request_id": request_id})
            yield self.env.timeout(self.latency)
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})

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
