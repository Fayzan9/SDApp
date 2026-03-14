import simpy
from typing import Dict, Any, List, Callable, Optional
import asyncio
import statistics

class SimulationEngine:
    def __init__(self, event_callback: Callable[[Dict[str, Any]], None]):
        self.env = simpy.Environment()
        self.event_callback = event_callback
        self.components: Dict[str, Any] = {}
        self.is_running = False
        
        # Metrics Tracking
        self.stats = {
            "total_requests": 0,
            "completed_requests": 0,
            "failed_requests": 0,
            "latencies": [],
            "start_times": {} # request_id -> start_time
        }
        
        self.killed_nodes = set()
        
        # Register the stats reporter process
        self.env.process(self.stats_reporter())

    def stats_reporter(self):
        """SimPy process that reports stats every 1 second of simulation time."""
        while True:
            yield self.env.timeout(1.0) 
            self.emit_stats()

    def emit_stats(self):
        """Calculates and emits SIMULATION_STATS event."""
        latencies = self.stats["latencies"]
        
        # Calculate percentiles
        if latencies:
            p50 = statistics.median(latencies)
            # quantiles is available in 3.8+
            try:
                p99 = statistics.quantiles(latencies, n=100)[98] if len(latencies) >= 100 else max(latencies)
            except:
                p99 = max(latencies)
        else:
            p50 = 0
            p99 = 0
            
        stats_event = {
            "event_type": "SIMULATION_STATS",
            "source_id": "engine",
            "target_id": None,
            "timestamp": self.env.now,
            "data": {
                "total_requests": self.stats["total_requests"],
                "completed_requests": self.stats["completed_requests"],
                "failed_requests": self.stats["failed_requests"],
                "p50_latency": round(p50 * 1000, 2), # ms
                "p99_latency": round(p99 * 1000, 2), # ms
                "throughput": round(self.stats["completed_requests"] / max(self.env.now, 1), 2)
            }
        }
        self.event_callback(stats_event)

    def terminate_node(self, node_id: str):
        """Disables a node manually (Chaos Engineering)."""
        self.emit_event("NODE_CRASHED", node_id)
        self.killed_nodes.add(node_id)

    def resurrect_node(self, node_id: str):
        """Re-enables a node (Recovery Engineering)."""
        if node_id in self.killed_nodes:
            self.killed_nodes.remove(node_id)
            self.emit_event("NODE_RESTORED", node_id)

    def emit_event(self, event_type: str, source_id: str, target_id: Optional[str] = None, data: Optional[Dict[str, Any]] = None):
        # Ignore events from killed nodes
        if source_id in self.killed_nodes:
            return

        event = {
            "event_type": event_type,
            "source_id": source_id,
            "target_id": target_id,
            "timestamp": self.env.now,
            "data": data or {}
        }
        
        # Track metrics
        if event_type == "REQUEST_STARTED":
            self.stats["total_requests"] += 1
            request_id = event["data"].get("request_id")
            if request_id:
                self.stats["start_times"][request_id] = self.env.now
        
        elif event_type == "REQUEST_COMPLETED":
            self.stats["completed_requests"] += 1
            request_id = event["data"].get("request_id")
            if request_id and request_id in self.stats["start_times"]:
                latency = self.env.now - self.stats["start_times"][request_id]
                self.stats["latencies"].append(latency)
                del self.stats["start_times"][request_id]
        
        elif event_type == "FAILURE":
            self.stats["failed_requests"] += 1

        print(f"[SimEngine] Event: {event_type} | Source: {source_id} | Target: {target_id} | Now: {self.env.now}")
        self.event_callback(event)

    def register_component(self, component_id: str, component: Any):
        self.components[component_id] = component

    async def run_simulation(self, until: float = 1000):
        self.is_running = True
        start_time = asyncio.get_event_loop().time()
        
        try:
            while self.is_running and self.env.peek() < until:
                # Synchronize sim time with real time
                elapsed_real = asyncio.get_event_loop().time() - start_time
                target_sim_time = elapsed_real 
                
                while self.env.peek() <= target_sim_time and self.env.peek() < until:
                    self.env.step()
                    
                await asyncio.sleep(0.01) 
        except Exception as e:
            print(f"Simulation Error: {e}")
        finally:
            self.is_running = False
            # Final stats report
            self.emit_stats()

