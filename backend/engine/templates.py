import os
import json
from typing import Dict, List, Any
from pathlib import Path

def get_templates() -> List[Dict[str, Any]]:
    templates_dir = Path(__file__).parent / "templates"
    templates = []
    
    if not templates_dir.exists():
        return []
    
    for file in templates_dir.glob("*.json"):
        try:
            with open(file, "r") as f:
                data = json.load(f)
                template_id = file.stem
                templates.append({
                    "id": template_id,
                    "name": data.get("name", template_id.replace("_", " ").title()),
                    "description": data.get("description", ""),
                    "graph": data.get("graph", {"nodes": [], "edges": []})
                })
        except Exception as e:
            print(f"Error loading template {file}: {e}")
            
    return templates
