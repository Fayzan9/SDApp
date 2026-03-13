from typing import Any, Dict, List
import simpy
from .base import BaseComponent

class ObjectStorage(BaseComponent):
    registry_type = "blob_storage"

    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 100) / 1000.0
        self.capacity = config.get("capacity", 100)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Blob Storage",
            "category": "Storage",
            "icon": "HardDrive",
            "description": "Unstructured object storage (e.g. S3).",
            "config_schema": [
                {"name": "latency", "label": "Access Latency", "type": "number", "default": 100, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 0}
        }

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        yield self.env.timeout(self.latency)
        self.engine.emit_event("BLOB_STORAGE_READ", self.id, data={"request_id": request_id})
        self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
