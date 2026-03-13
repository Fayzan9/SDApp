import asyncio
from engine.core import SimulationEngine
from engine.parser import GraphParser

def mock_event_callback(event):
    data = event.get('data', {})
    req_id = data.get('request_id', 'N/A')
    # Compact format for easier reading
    print(f"[{event['timestamp']:4.3f}] {event['event_type']:18} | {event['source_id']:^10} -> {str(event['target_id']):^10} | {req_id}")

async def test_deep_flow():
    engine = SimulationEngine(mock_event_callback)
    
    # ADVANCED FLOW:
    # User -> CDN (Miss) -> Firewall -> Gateway -> LB -> 
    #   LB -> Cache (Miss) -> Server -> MessageQueue -> DB
    #   LB -> Lambda -> ObjectStorage
    graph_data = {
        "nodes": [
            {"id": "user1",   "type": "web_client",    "data": {"requests_per_sec": 1}},
            {"id": "cdn1",    "type": "cdn",           "data": {"hit_rate": 0.1, "latency": 10}}, # Fixed: low hit rate to see flow
            {"id": "fw1",     "type": "firewall",      "data": {"drop_rate": 0.05}},
            {"id": "gw1",     "type": "api_gateway",   "data": {"latency": 15}},
            {"id": "lb1",     "type": "load_balancer", "data": {}},
            {"id": "cache1",  "type": "cache",         "data": {"hit_rate": 0.1, "latency": 5}},  # Force miss
            {"id": "server1", "type": "server",        "data": {"latency": 30}},
            {"id": "mq1",     "type": "message_queue", "data": {}},
            {"id": "db1",     "type": "database",      "data": {"latency": 50}},
            {"id": "func1",   "type": "lambda_function","data": {"cold_start_latency": 200, "execution_time": 20}},
            {"id": "s3_1",    "type": "blob_storage",  "data": {"latency": 100}}
        ],
        "edges": [
            {"source": "user1",   "target": "cdn1"},
            {"source": "cdn1",    "target": "fw1"},
            {"source": "fw1",     "target": "gw1"},
            {"source": "gw1",     "target": "lb1"},
            # Two paths from LB
            {"source": "lb1",     "target": "cache1"},
            {"source": "lb1",     "target": "func1"},
            
            {"source": "cache1",  "target": "server1"},
            {"source": "server1", "target": "mq1"},
            {"source": "mq1",     "target": "db1"},
            
            {"source": "func1",   "target": "s3_1"}
        ]
    }
    
    print("\n" + "="*80)
    print("RUNNING DEEP SYSTEM SIMULATION (Lowered Hit Rates to Force Backend Flow)")
    print("="*80)
    GraphParser.parse(graph_data, engine)
    
    await engine.run_simulation(until=3.0)
    print("="*80)

if __name__ == "__main__":
    asyncio.run(test_deep_flow())
