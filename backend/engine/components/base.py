from typing import Any, Dict

class BaseComponent:
    registry_type = "base"

    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        self.engine = engine
        self.env = engine.env
        self.id = component_id
        self.config = config

    @classmethod
    def get_metadata(cls):
        return {
            "type": cls.registry_type,
            "label": "Base Component",
            "category": "Other",
            "icon": "Box",
            "description": "Base component",
            "config_schema": [],
            "ports": {"inputs": 0, "outputs": 0}
        }
