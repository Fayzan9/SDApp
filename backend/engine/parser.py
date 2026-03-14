from typing import List, Dict, Any
from .core import SimulationEngine
from .registry import ComponentRegistry

class GraphParser:
    @staticmethod
    def parse(graph_data: Dict[str, Any], engine: SimulationEngine):
        """
        Parses a frontend graph (nodes and edges) and populates the simulation engine.
        """
        nodes = graph_data.get("nodes", [])
        edges = graph_data.get("edges", [])

        # Create adjacency list for easy lookup
        out_edges = {}
        for edge in edges:
            src = edge["source"]
            tgt = edge["target"]
            if src not in out_edges:
                out_edges[src] = []
            out_edges[src].append(tgt)

        # Instantiate components
        for node in nodes:
            node_id = node["id"]
            node_data = node.get("data", {})
            node_type = node_data.get("type", node.get("type"))  # Support both formats
            config = node_data.get("config", {})
            targets = out_edges.get(node_id, [])
            
            comp_class = ComponentRegistry.get_component_class(node_type)
            if comp_class:
                # Check if component takes targets (clients, load balancers, etc.)
                import inspect
                sig = inspect.signature(comp_class.__init__)
                if "targets" in sig.parameters:
                    comp = comp_class(engine, node_id, config, targets)
                else:
                    comp = comp_class(engine, node_id, config)
                
                engine.register_component(node_id, comp)
            else:
                print(f"Warning: Node type '{node_type}' is not yet supported in simulation.")
            
        return engine
