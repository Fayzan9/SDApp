import simpy
from typing import Dict, Any, List, Callable, Optional
import asyncio

class SimulationEngine:
    def __init__(self, event_callback: Callable[[Dict[str, Any]], None]):
        self.env = simpy.Environment()
        self.event_callback = event_callback
        self.components: Dict[str, Any] = {}
        self.is_running = False

    def emit_event(self, event_type: str, source_id: str, target_id: Optional[str] = None, data: Optional[Dict[str, Any]] = None):
        event = {
            "event_type": event_type,
            "source_id": source_id,
            "target_id": target_id,
            "timestamp": self.env.now,
            "data": data or {}
        }
        print(f"[SimEngine] Event: {event_type} | Source: {source_id} | Target: {target_id} | Now: {self.env.now}")
        self.event_callback(event)

    def register_component(self, component_id: str, component: Any):
        self.components[component_id] = component

    async def run_simulation(self, until: float = 100):
        self.is_running = True
        start_time = asyncio.get_event_loop().time()
        
        while self.is_running and self.env.peek() < until:
            # How much simulation time SHOULD have passed based on real time
            elapsed_real = asyncio.get_event_loop().time() - start_time
            # For 1:1 speed, target_sim_time = elapsed_real
            target_sim_time = elapsed_real 
            
            # Catch up: process all events that should have happened by now
            while self.env.peek() <= target_sim_time and self.env.peek() < until:
                self.env.step()
                
            # If we are ahead of real time, sleep a bit to maintain real-time feel
            # Use smaller sleep for higher resolution
            await asyncio.sleep(0.01) 
        
        self.is_running = False
