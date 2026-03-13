from typing import Any, Dict, List
from .base import BaseComponent

class ObjectStorage(BaseComponent):
    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 0.05) # 50ms default

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        self.engine.emit_event("BLOB_STORAGE_READ", self.id, data={"request_id": request_id})
        self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
