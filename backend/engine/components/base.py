from typing import Any, Dict

class BaseComponent:
    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        self.engine = engine
        self.env = engine.env
        self.id = component_id
        self.config = config
