from typing import List, Dict, Any
from .components import Client, Server, LoadBalancer, Database, Cache, Gateway, MessageQueue, CDN, Firewall, LambdaFunction, ObjectStorage, PubSub
from .core import SimulationEngine

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
            node_type = node["type"]
            config = node.get("data", {})
            targets = out_edges.get(node_id, [])
            
            if node_type in ["web_client", "mobile_client"]:
                config["rps"] = config.get("requests_per_sec", 1.0)
                comp = Client(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "server":
                config["latency"] = config.get("latency", 50) / 1000.0
                comp = Server(engine, node_id, config)
                engine.register_component(node_id, comp)
            elif node_type == "load_balancer":
                comp = LoadBalancer(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "api_gateway":
                config["latency"] = config.get("latency", 20) / 1000.0
                comp = Gateway(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "database":
                config["latency"] = config.get("latency", 100) / 1000.0
                comp = Database(engine, node_id, config)
                engine.register_component(node_id, comp)
            elif node_type == "cache":
                config["latency"] = config.get("latency", 5) / 1000.0
                comp = Cache(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "message_queue":
                comp = MessageQueue(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "cdn":
                config["latency"] = config.get("latency", 10) / 1000.0
                comp = CDN(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "firewall":
                comp = Firewall(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "lambda_function":
                config["cold_start"] = config.get("cold_start_latency", 200) / 1000.0
                config["exec_time"] = config.get("execution_time", 20) / 1000.0
                comp = LambdaFunction(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            elif node_type == "blob_storage":
                config["latency"] = config.get("latency", 100) / 1000.0
                comp = ObjectStorage(engine, node_id, config)
                engine.register_component(node_id, comp)
            elif node_type == "pub_sub":
                config["latency"] = config.get("latency", 5) / 1000.0
                comp = PubSub(engine, node_id, config, targets)
                engine.register_component(node_id, comp)
            else:
                print(f"Warning: Node type '{node_type}' is not yet supported in simulation.")
            
        return engine
