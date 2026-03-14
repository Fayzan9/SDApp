# Reference: Creating New Backend Components

To add a new component to the simulation engine, follow this structure.

## 1. Create the Component File
Create a new file in `backend/engine/components/your_component.py`.

```python
from typing import Any, Dict, List
import simpy
from .base import BaseComponent

class YourComponent(BaseComponent):
    # This must match the type used in frontend and templates
    registry_type = "your_component_type"

    def __init__(self, engine, component_id: str, config: Dict[str, Any]):
        super().__init__(engine, component_id, config)
        # Initialize your component's specific parameters from config
        self.latency = config.get("latency", 50) / 1000.0  # ms to seconds
        # If it's a resource-constrained component:
        self.resource = simpy.Resource(self.env, capacity=config.get("capacity", 1))

    @classmethod
    def get_metadata(cls):
        """
        Metadata used by the frontend to render the component in the library
        and generate the configuration panel.
        """
        return {
            "type": cls.registry_type,
            "label": "Your Component Label",
            "category": "Compute", # Categories: Clients, Compute, Storage, Networking, Messaging
            "icon": "Cpu",        # Use any Lucide-React icon name
            "description": "Short description of what this component does.",
            "config_schema": [
                {
                    "name": "latency", 
                    "label": "Base Latency", 
                    "type": "number", 
                    "default": 50, 
                    "unit": "ms"
                },
                {
                    "name": "algorithm",
                    "label": "Strategy",
                    "type": "select",
                    "default": "round_robin",
                    "options": ["round_robin", "least_connections"]
                }
            ],
            "ports": {"inputs": 1, "outputs": 1} # 0 or 1 for standard handles
        }

    def handle_request(self, request_id: str, source_id: str):
        """
        Logic for processing an incoming request.
        """
        # Emit event to show packet movement in UI
        self.engine.emit_event("REQUEST_MOVED", source_id, self.id, data={"request_id": request_id})
        
        # Simulate processing time
        yield self.env.timeout(self.latency)
        
        # Emit completion/processing event
        self.engine.emit_event("NODE_PROCESSING", self.id, data={"request_id": request_id})
        
        # Usually, if it's a terminal node:
        self.engine.emit_event("REQUEST_COMPLETED", self.id, data={"request_id": request_id})
```

## 2. Export in `__init__.py`
Add your class to `backend/engine/components/__init__.py`.

## 3. Register the Component
Add your class to the mapping in `backend/engine/registry.py`.

```python
_components: Dict[str, Type[BaseComponent]] = {
    # ... existing components
    "your_component_type": YourComponent,
}
```
