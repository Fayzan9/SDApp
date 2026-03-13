import simpy
from typing import Any, Dict
from .base import BaseComponent

class Database(BaseComponent):
    registry_type = "database"

    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        self.latency = config.get("latency", 100) / 1000.0
        self.capacity = config.get("capacity", 10)
        self.resource = simpy.Resource(self.env, capacity=self.capacity)

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Database",
            "category": "Storage",
            "icon": "Database",
            "description": "Relational or NoSQL data store.",
            "config_schema": [
                {"name": "type", "label": "DB Type", "type": "select", "default": "postgresql", "options": ["postgresql", "mongodb", "mysql", "redis"]},
                {"name": "latency", "label": "Query Latency", "type": "number", "default": 100, "unit": "ms"},
            ],
            "ports": {"inputs": 1, "outputs": 0}
        }

    def handle_request(self, request_id: str, source_id: str):
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        with self.resource.request() as req:
            yield req
            self.engine.emit_event("DB_QUERY", self.id, data={"request_id": request_id})
            yield self.env.timeout(self.latency)
            self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
