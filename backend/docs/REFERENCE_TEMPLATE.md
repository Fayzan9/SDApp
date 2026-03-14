# Reference: Creating Architecture Templates

Templates are stored as JSON files in `backend/engine/templates/`. The system automatically loads any `.json` file in that directory.

## JSON Structure

```json
{
    "name": "Template Name",
    "description": "Short description of the architecture.",
    "graph": {
        "nodes": [
            {
                "id": "unique-node-id",
                "type": "custom",
                "position": { "x": 100, "y": 200 },
                "data": {
                    "type": "component_registry_type",
                    "label": "Display Label",
                    "config": {
                        "param1": 10,
                        "param2": "value"
                    }
                }
            }
        ],
        "edges": [
            {
                "id": "unique-edge-id",
                "source": "source-node-id",
                "target": "target-node-id",
                "type": "packet",
                "animated": true
            }
        ]
    }
}
```

## Key Requirements

1.  **Node Type**: All nodes MUST have `"type": "custom"`. This ensures they use the specialized React Flow component.
2.  **Component Type**: The actual component type (e.g., `web_client`, `server`, `database`) must be specified in `data.type`. This must match the `registry_type` in the backend component class.
3.  **Config**: The `data.config` object should contain the default values for the component's parameters as defined in its `config_schema`.
4.  **Edges**: Use `"type": "packet"` and `"animated": true` for edges to enable the simulation's visual packet flow.
5.  **Positioning**: Use the `position` object to arrange nodes logically on the canvas.
