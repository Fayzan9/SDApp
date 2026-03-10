from typing import List, Dict, Any
from .models import Client, Server, LoadBalancer
from .core import SimulationEngine

class GraphParser:
    @staticmethod
    def parse(graph_data: Dict[str, Any], engine: SimulationEngine):
        """
        Parses a frontend graph (nodes and edges) and populates the simulation engine.
        Expected format (simplified):
        {
            "nodes": [{"id": "n1", "type": "client", "data": {"rps": 5}}, ...],
            "edges": [{"source": "n1", "target": "n2"}, ...]
        }
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
            node_type = node["type"]
            config = node.get("data", {})
            targets = out_edges.get(node_id, [])
            
            if node_type in ["web_client", "mobile_client"]:
                # Map requests_per_sec from frontend
                config["rps"] = config.get("requests_per_sec", 1.0)
                comp = Client(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "server":
                # Convert latency from ms to seconds
                config["latency"] = config.get("latency", 50) / 1000.0
                comp = Server(engine, node_id, config)
                engine.register_component(node_id, comp)
            elif node_type == "load_balancer":
                comp = LoadBalancer(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "api_gateway":
                # API Gateway behaves similarly to a Load Balancer/Router
                comp = LoadBalancer(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            else:
                print(f"Warning: Node type '{node_type}' is not yet supported in simulation.")
            # Add more types (LoadBalancer, Cache, etc.) here
            
        return engine
