import asyncio
from engine.core import SimulationEngine
from engine.parser import GraphParser

def mock_event_callback(event):
    data = event.get('data', {})
    req_id = data.get('request_id', 'N/A')
    print(f"[{event['timestamp']:4.3f}] {event['event_type']:18} | {event['source_id']:^10} -> {str(event['target_id']):^10} | {req_id}")

async def test_pubsub_fanout():
    engine = SimulationEngine(mock_event_callback)
    
    # Test Flow:
    # Client -> PubSub -> (Server1, Server2)
    # Client -> Lambda -> (Server1, Server2)
    graph_data = {
        "nodes": [
            {"id": "client", "type": "web_client", "data": {"requests_per_sec": 0.5}},
            {"id": "ps1",    "type": "pub_sub",    "data": {"latency": 10}},
            {"id": "func1",  "type": "lambda_function", "data": {"cold_start_latency": 100, "execution_time": 50}},
            {"id": "s1",     "type": "server",     "data": {"latency": 50}},
            {"id": "s2",     "type": "server",     "data": {"latency": 50}}
        ],
        "edges": [
            {"source": "client", "target": "ps1"},
            {"source": "client", "target": "func1"},
            {"source": "ps1",    "target": "s1"},
            {"source": "ps1",    "target": "s2"},
            {"source": "func1",  "target": "s1"},
            {"source": "func1",  "target": "s2"}
        ]
    }
    
    print("\n" + "="*80)
    print("RUNNING PUBSUB AND LAMBDA FAN-OUT TEST")
    print("="*80)
    GraphParser.parse(graph_data, engine)
    
    await engine.run_simulation(until=2.0)
    print("="*80)

if __name__ == "__main__":
    asyncio.run(test_pubsub_fanout())
