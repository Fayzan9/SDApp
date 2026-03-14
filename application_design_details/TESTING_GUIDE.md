# System Design Simulator - Template Testing Guide

This guide provides comprehensive instructions for testing each template flow to ensure all components and connections are working correctly.

## Overview

The system includes multiple pre-built templates that demonstrate different architectural patterns. Each template exercises specific components and connection types.

## Available Templates

### 1. Basic Web App
**File:** `basic_web_app.json`
**Architecture:** 3-tier web application
**Components Used:** Web Client, Load Balancer, Servers, Database

#### What It Tests
- ✓ Basic client-to-server flow
- ✓ Load balancing with round-robin distribution
- ✓ Multiple servers handling requests
- ✓ Database query processing
- ✓ Request completion tracking

#### How to Test

1. **Load the template** in the frontend UI or start backend simulation
2. **Run simulation for 10-15 seconds**
3. **Verify the following:**
   - Client generates requests at configured rate (10 req/s)
   - Load balancer distributes requests evenly between srv-1 and srv-2
   - Both servers process requests with 50ms latency
   - Database receives queries from both servers
   - Requests complete successfully

4. **Check metrics:**
   - Total requests should be ~100-150 after 10 seconds
   - Completed requests should be > 90%
   - P50 latency should be ~150-200ms (50ms server + 100ms DB)
   - No errors unless database is overloaded

5. **Chaos testing:**
   - Kill one server node (srv-1 or srv-2)
   - Verify traffic redirects to remaining server
   - Resurrection should restore normal operation

#### Expected Events
```
REQUEST_STARTED → REQUEST_MOVED (to LB) → REQUEST_MOVED (to Server) → 
NODE_PROCESSING → REQUEST_MOVED (to DB) → DB_QUERY → REQUEST_COMPLETED
```

---

### 2. Comprehensive System Architecture
**File:** `comprehensive_system.json`
**Architecture:** Full-featured enterprise system
**Components Used:** All available components

#### What It Tests
- ✓ Multi-client scenarios (web + mobile)
- ✓ Security layer (firewall filtering)
- ✓ CDN caching for static content
- ✓ API Gateway routing
- ✓ Cache hit/miss logic
- ✓ Message queue async processing
- ✓ Pub/Sub fan-out pattern
- ✓ Serverless Lambda execution
- ✓ Multiple storage backends

#### How to Test

1. **Load the template**
2. **Run simulation for 15-20 seconds**
3. **Verify different paths:**

   **Path A: Static Content (CDN)**
   - Web/mobile client → Firewall → CDN
   - On CDN HIT: Request completes immediately
   - On CDN MISS: Falls back to blob-storage-2 (CDN origin)
   - Expected CDN hit rate: ~85%

   **Path B: Dynamic Content (Full stack)**
   - Client → Firewall → Gateway → LB → Server → Cache → Database
   - On CACHE HIT: Faster response (~55ms)
   - On CACHE MISS: Full DB query (~155ms)
   - Expected cache hit rate: ~75%

   **Path C: Async Processing (Message Queue)**
   - Server → Message Queue → Pub/Sub → Multiple Lambdas → Storage
   - Verify pub/sub fans out to both lambda-1 and lambda-2
   - Check for LAMBDA_COLD_START events on first execution
   - Subsequent requests should be faster (warm lambdas)

4. **Check metrics:**
   - Total requests: ~200-260 (13 req/s combined from both clients)
   - Firewall should drop ~2% of requests
   - CDN hits: ~85% of requests
   - Cache hits: ~75% of database requests
   - P50 latency varies by path (50-200ms)
   - Server failure rate: ~1%

#### Expected Events Per Path
```
CDN Path: REQUEST_STARTED → FIREWALL_ALLOWED → CDN_HIT → REQUEST_COMPLETED
Full Stack: REQUEST_STARTED → FIREWALL_ALLOWED → GATEWAY_ROUTING → 
  REQUEST_MOVED (LB) → NODE_PROCESSING → CACHE_HIT/MISS → REQUEST_COMPLETED
Async Path: MSG_ENQUEUED → MSG_DEQUEUED → PUB_PUBLISHED → 
  LAMBDA_EXECUTED (x2) → BLOB_STORAGE_READ
```

---

### 3. E-Commerce Platform
**File:** `ecommerce_system.json`
**Architecture:** Production e-commerce system
**Components Used:** Web Client, Mobile Client, Firewall, API Gateway, Load Balancer, Servers, Cache, Database, Message Queue, Lambda

#### What It Tests
- ✓ Multi-device client support
- ✓ Web Application Firewall (WAF)
- ✓ API Gateway with timeout handling
- ✓ Horizontal scaling (multiple servers)
- ✓ Redis caching layer
- ✓ Primary database for transactions
- ✓ Async order processing via message queue
- ✓ Separate order database

#### How to Test

1. **Load the template**
2. **Run simulation for 10-15 seconds**
3. **Verify main request flow:**
   - Web client (15 req/s) + Mobile client (10 req/s) = 25 req/s combined
   - Firewall drops ~3% of malicious requests
   - Requests route through API Gateway (5ms overhead)
   - Load balancer distributes to app-server-1 and app-server-2
   - Both servers query Redis cache (70% hit rate)
   - Cache misses query PostgreSQL database

4. **Verify async order processing:**
   - Servers also send messages to RabbitMQ queue
   - Queue triggers Order Processor Lambda
   - Lambda writes to separate Orders DB (MongoDB)
   - First execution shows LAMBDA_COLD_START (~180ms)
   - Subsequent executions are faster (~70ms)

5. **Check metrics:**
   - Total requests: ~250-375 after 15 seconds
   - Firewall blocks: ~7-11 requests
   - Cache hits: ~70% of DB requests
   - Server failure rate: ~0.5% each
   - P50 latency: ~175-225ms (with cache hits)
   - P99 latency: ~300-400ms (with cache misses)

6. **Stress testing:**
   - Increase client request rates (20 req/s each)
   - Watch for NODE_CONGESTED events on database
   - Database capacity is 25 connections
   - Servers have 3 instances each = 6 total capacity

#### Key Behaviors to Observe
- Cache significantly reduces DB load
- Async processing doesn't block main request path
- Lambda cold starts only occur once
- Firewall provides first line of defense
- Load balancer evenly distributes load

---

### 4. Microservices Architecture
**File:** `microservices_architecture.json`
**Architecture:** Distributed microservices system
**Components Used:** Web Client, API Gateway, Multiple Load Balancers, Multiple Service Groups, Multiple Databases, Cache

#### What It Tests
- ✓ Service-oriented architecture
- ✓ Multiple independent services
- ✓ Per-service load balancing
- ✓ Service-specific databases
- ✓ Gateway routing to multiple services
- ✓ Shared client, isolated backends

#### How to Test

1. **Load the template**
2. **Run simulation for 10-15 seconds**
3. **Verify independent service paths:**

   **User Service:**
   - Gateway → User Service LB → user-srv-1 or user-srv-2 → User DB
   - Both servers share the same PostgreSQL database
   - Latency: ~40ms server + ~80ms DB = ~120ms

   **Product Service:**
   - Gateway → Product Service LB → product-srv-1 or product-srv-2 → Product Cache → Product DB
   - Cache hit rate: 85% (much faster responses)
   - Cache miss: Falls through to MongoDB
   - Hit latency: ~53ms, Miss latency: ~153ms

   **Order Service:**
   - Gateway → Order Service (single service, no LB) → Order DB
   - Direct connection pattern
   - Latency: ~60ms server + ~110ms DB = ~170ms

4. **Check service independence:**
   - Kill user-srv-1, user service still works via user-srv-2
   - Product service continues unaffected
   - Each service has its own database (no shared state)
   - Each service can scale independently

5. **Check metrics:**
   - Total requests: 120-180 after 10 seconds (12 req/s)
   - Requests distributed across all three services
   - Product service benefits from 85% cache hit rate
   - Each service's failure rate is independent (~0.5%)
   - Average latency varies by service (120-170ms)

6. **Advanced testing:**
   - Increase Product Service request rate (simulate popular catalog)
   - Watch Product Cache effectiveness
   - Overload Product DB to see queuing
   - Kill entire User Service to test isolation

#### Key Behaviors to Observe
- API Gateway routes to multiple downstream services
- Each service has independent scaling and configuration
- Database isolation prevents cross-service dependencies
- Cache only benefits Product Service
- Failures in one service don't affect others

---

### 5. Serverless Event-Driven System
**File:** `serverless_event_driven.json`
**Architecture:** Cloud-native serverless with Pub/Sub fan-out
**Components Used:** Mobile Client, API Gateway, Lambda Functions, Pub/Sub, Databases, Object Storage

#### What It Tests
- ✓ Serverless compute patterns
- ✓ Event-driven architecture
- ✓ Pub/Sub fan-out to multiple subscribers
- ✓ Parallel event processing
- ✓ Cold start vs warm execution
- ✓ Multiple storage backends

#### How to Test

1. **Load the template**
2. **Run simulation for 15-20 seconds**
3. **Verify event flow:**

   **Ingestion Phase:**
   - Mobile client → API Gateway → Ingestion Lambda
   - First request shows cold start (250ms + 80ms = 330ms)
   - Subsequent requests are warm (80ms only)

   **Fan-Out Phase:**
   - Ingestion Lambda → EventBridge Pub/Sub
   - Pub/Sub fans out to THREE Lambdas simultaneously:
     * Analytics Lambda → Analytics S3
     * Notification Lambda → DynamoDB
     * Archival Lambda → Glacier Archive

4. **Verify parallel processing:**
   - All three Lambdas receive the same event
   - All three process in parallel (not sequential)
   - Each has its own cold start behavior
   - Total time = ingestion + max(analytics, notification, archival)

5. **Check cold start patterns:**
   - Analytics: 300ms cold start + 120ms exec
   - Notification: 200ms cold start + 60ms exec
   - Archival: 220ms cold start + 90ms exec
   - LAMBDA_COLD_START events appear only ONCE per Lambda
   - Warm executions are much faster

6. **Check metrics:**
   - Total requests: 80-160 after 10 seconds (8 req/s)
   - First few requests have high latency (cold starts)
   - P50 latency drops significantly as Lambdas warm up
   - All requests fan out to 3 different storage backends
   - No failures unless timeout occurs

7. **Performance testing:**
   - Increase request rate to 20 req/s
   - Observe multiple cold start events (Lambda scaling)
   - Monitor DynamoDB capacity (30 connections)
   - Check if any Lambda times out

#### Key Behaviors to Observe
- Cold starts only happen on first invocation
- Pub/Sub creates parallel execution paths
- Each Lambda processes independently
- Different storage backends have different latencies
- Event-driven pattern decouples services

---

### 6. CDN + Dynamic Content System
**File:** `cdn_hybrid_system.json`
**Architecture:** Hybrid static/dynamic content delivery
**Components Used:** Web Client, CDN, Blob Storage, API Gateway, Load Balancer, Servers, Cache, Database

#### What It Tests
- ✓ Content Delivery Network caching
- ✓ Static vs dynamic content routing
- ✓ CDN origin fallback
- ✓ Multi-tier caching (CDN + Redis)
- ✓ Image storage separation

#### How to Test

1. **Load the template**
2. **Run simulation for 10-15 seconds**
3. **Verify dual request paths:**

   **Static Content Path:**
   - Web client → CDN Edge Node
   - On CDN HIT (88% of time): ~12ms response
   - On CDN MISS (12% of time): Falls back to S3 Static Assets (~112ms)
   - CDN caches miss for subsequent requests

   **Dynamic/API Content Path:**
   - Web client → API Gateway → Application LB → App Servers → Redis Cache → MySQL
   - Cache hit (72%): ~66ms total
   - Cache miss (28%): ~161ms total (includes DB query)
   - Some requests also fetch from Image Storage

4. **Verify multi-tier caching:**
   - First tier: CDN caches static assets (88% hit rate)
   - Second tier: Redis caches database queries (72% hit rate)
   - Combined effect significantly reduces origin load
   - Static content almost never hits origin servers

5. **Check metrics:**
   - Total requests: 200-300 after 10 seconds (20 req/s)
   - CDN hits: ~88% of requests (very fast responses)
   - CDN misses: ~12% (fall back to S3)
   - Redis hits: ~72% of dynamic requests
   - P50 latency: Low due to high CDN hit rate (~15-30ms)
   - P99 latency: Higher for cache/CDN misses (~160-180ms)

6. **Load testing:**
   - Increase to 50 req/s to simulate traffic spike
   - CDN absorbs most load (88% served from edge)
   - Only 12% of traffic hits origin
   - Redis Cache reduces DB load further
   - Database should not be overwhelmed (capacity: 22)

7. **Chaos testing:**
   - Kill app-server-1, traffic shifts to app-server-2
   - CDN continues serving cached content unaffected
   - Static content highly resilient

#### Key Behaviors to Observe
- CDN dramatically reduces latency for static assets
- Origin servers handle much less load
- Multi-tier caching compounds benefits
- Static vs dynamic paths are independent
- Server failures don't affect CDN-served content

---

### 7. Message Queue Processing Pipeline
**File:** `queue_processing_pipeline.json`
**Architecture:** Event-driven pipeline with parallel processors
**Components Used:** Web Client, API Gateway, Server, Message Queue, Pub/Sub, Multiple Lambdas, Multiple Storage Backends

#### What It Tests
- ✓ Message queue buffering
- ✓ Queue-to-PubSub pattern
- ✓ Triple fan-out processing
- ✓ Parallel Lambda execution
- ✓ Multiple database/storage targets
- ✓ Complex async pipeline

#### How to Test

1. **Load the template**
2. **Run simulation for 15-20 seconds**
3. **Verify pipeline stages:**

   **Stage 1: Ingestion**
   - API Client → API Gateway → Ingestion Service
   - Service processes with 45ms latency
   - Service enqueues message to Main Queue

   **Stage 2: Queue Buffering**
   - Messages wait in queue (async decoupling)
   - MSG_ENQUEUED event marks acceptance
   - MSG_DEQUEUED event marks processing start
   - Queue processes at steady rate

   **Stage 3: Event Routing**
   - Queue forwards to Event Router (Pub/Sub)
   - Event Router fans out to THREE processors:
     * Image Processor Lambda
     * Text Processor Lambda
     * Metadata Processor Lambda

   **Stage 4: Specialized Processing**
   - Image Processor (350ms cold + 150ms exec) → Image Store
   - Text Processor (180ms cold + 80ms exec) → Text DB
   - Metadata Processor (200ms cold + 60ms exec) → Metadata DB

4. **Verify fan-out behavior:**
   - Each message goes to ALL THREE processors (not just one)
   - All three process in parallel
   - Each processor has its own storage backend
   - PUB_PUBLISHED event shows subscriber_count: 3

5. **Check cold start cascade:**
   - First message triggers cold starts in all 3 Lambdas
   - Very high initial latency (350-500ms per Lambda)
   - Subsequent messages process much faster
   - Watch for warm Lambda executions

6. **Check metrics:**
   - Total requests: 120-240 after 15 seconds (12 req/s)
   - Every request spawns 3 parallel processing tasks
   - First few requests show high latency
   - P50 latency improves as Lambdas warm up
   - Queue provides buffering (no congestion)

7. **Stress testing:**
   - Increase client rate to 30 req/s
   - Queue should handle burst traffic gracefully
   - Monitor database capacities:
     * Text DB: 25 connections
     * Metadata DB: 30 connections
   - Watch for NODE_CONGESTED events

#### Key Behaviors to Observe
- Queue decouples ingestion from processing
- Pub/Sub enables parallel processing paths
- Each processor specializes in one data type
- Cold starts affect initial performance
- Multiple storage backends handle different data types

---

## General Testing Procedures

### 1. Component Functionality Testing

For each component type, verify:

**Clients (Web/Mobile):**
- Generate requests at configured rate
- Round-robin distribution to targets
- REQUEST_STARTED events emitted

**Servers:**
- Process requests with correct latency
- Respect instance capacity
- Forward to targets after processing
- Honor failure rate configuration

**Load Balancers:**
- Distribute requests evenly across targets
- Round-robin algorithm works correctly
- Handle target failures gracefully

**Databases:**
- Process queries with configured latency
- Respect connection capacity limits
- Emit NODE_CONGESTED when overloaded
- DB_QUERY and REQUEST_COMPLETED events

**Cache (Redis/CDN):**
- Hit/miss logic based on configured hit_rate
- Fast response on cache hits
- Fall through to targets on misses
- CACHE_HIT/CACHE_MISS or CDN_HIT/CDN_MISS events

**API Gateway:**
- Add minimal routing overhead (~5ms)
- GATEWAY_ROUTING event emitted
- Forward to targets correctly

**Firewall:**
- Drop packets based on drop_rate
- FIREWALL_BLOCKED or FIREWALL_ALLOWED events
- Pass allowed traffic to targets

**Message Queue:**
- Buffer messages asynchronously
- MSG_ENQUEUED and MSG_DEQUEUED events
- Forward to all targets

**Pub/Sub:**
- Fan out to ALL subscribers
- PUB_PUBLISHED event shows subscriber count
- Parallel delivery to all targets

**Lambda Functions:**
- Cold start on first execution
- LAMBDA_COLD_START event (only once)
- Faster warm execution subsequently
- LAMBDA_EXECUTED event

**Object Storage:**
- Process reads with configured latency
- BLOB_STORAGE_READ event
- REQUEST_COMPLETED at the end

### 2. Connection Configuration Testing

Verify that connections work correctly:

**One-to-One:**
- Server → Database
- Gateway → Load Balancer
- Cache → Database

**One-to-Many (Distribution):**
- Client → Multiple targets (round-robin)
- Load Balancer → Multiple servers (round-robin)

**One-to-Many (Fan-out):**
- Pub/Sub → Multiple subscribers (all receive)
- Message Queue → Multiple workers (all receive)

**Conditional Routing:**
- Cache HIT → Complete, MISS → Database
- CDN HIT → Complete, MISS → Origin Storage
- Firewall ALLOWED → Gateway, BLOCKED → Drop

### 3. Metrics Validation

Check SIMULATION_STATS events every second:

```javascript
{
  "total_requests": 100,      // Total generated
  "completed_requests": 92,   // Successfully completed
  "failed_requests": 3,       // Errors/failures
  "p50_latency": 155.5,       // Median latency (ms)
  "p99_latency": 312.8,       // 99th percentile (ms)
  "throughput": 9.2,          // Requests per second
  "cache_hits": 65,           // Cache hits
  "cache_misses": 27          // Cache misses
}
```

**Validation Rules:**
- `total_requests` should match client rate × time
- `completed_requests + failed_requests ≤ total_requests`
- `p50_latency` should align with component latencies
- `throughput` should be close to client request rate
- Cache hit rates should match configuration

### 4. Chaos Engineering Testing

Test system resilience:

1. **Kill a component** (using node termination API)
   - Verify traffic reroutes to healthy nodes
   - Check for FAILURE events
   - Monitor increased load on remaining nodes

2. **Resurrect a component**
   - Verify it rejoins the system
   - Check for NODE_RESTORED event
   - Monitor load redistribution

3. **Kill critical components:**
   - Load Balancer: All server traffic stops
   - Gateway: All client requests fail
   - Database: Server requests fail after cache misses
   - Message Queue: Async processing stops

4. **Cascade failures:**
   - Overload database (reduce capacity or increase rate)
   - Watch for NODE_CONGESTED events
   - Observe queuing and increased latencies

### 5. Performance Testing

Recommended test scenarios:

**Baseline Performance:**
- Use default template configurations
- Run for 30 seconds
- Record P50, P95, P99 latencies
- Note throughput and error rate

**Load Testing:**
- Increase client request rates by 2-5x
- Monitor for congestion events
- Check if system maintains latency SLOs
- Identify bottlenecks (usually database)

**Burst Testing:**
- Start with low rate (5 req/s)
- Suddenly increase to high rate (50 req/s)
- Verify queues handle burst gracefully
- Check if latencies spike then stabilize

**Sustained Load:**
- Run at high rate for 60+ seconds
- Ensure no memory leaks
- Verify metrics remain stable
- Check for degradation over time

## Common Issues and Troubleshooting

### Issue: No requests flowing

**Possible causes:**
- Client not connected to any target
- Check edges in template JSON
- Verify parser correctly loads connections

**Fix:** Ensure edges connect source → target correctly

### Issue: Requests not completing

**Possible causes:**
- Component has no completion logic
- Missing target at end of chain
- Component crashed or offline

**Fix:** 
- Check last component in chain completes requests
- Databases and Storage should complete requests
- Servers should forward or complete

### Issue: Very high latencies

**Possible causes:**
- Database congestion (capacity too low)
- Server overload (too few instances)
- Lambda cold starts not warming up

**Fix:**
- Increase database capacity
- Add more server instances
- Check Lambda configurations

### Issue: Zero cache hits

**Possible causes:**
- Cache not in request path
- Cache target not configured
- Cache offline

**Fix:**
- Verify Server → Cache → Database path
- Check cache has target configured
- Ensure cache is not killed

### Issue: Events not appearing

**Possible causes:**
- Component killed (in killed_nodes set)
- Event callback not set
- SimPy process not yielding

**Fix:**
- Check engine.killed_nodes
- Verify event_callback is called
- Ensure all handle_request methods yield

## Testing Checklist

Use this checklist when testing each template:

- [ ] Template loads without errors
- [ ] All nodes render on canvas
- [ ] All edges connect properly
- [ ] Simulation starts successfully
- [ ] REQUEST_STARTED events appear
- [ ] Traffic flows through expected paths
- [ ] REQUEST_MOVED events show correct routing
- [ ] Processing events appear (NODE_PROCESSING, DB_QUERY, etc.)
- [ ] REQUEST_COMPLETED events appear
- [ ] SIMULATION_STATS updates every second
- [ ] Metrics align with expectations
- [ ] Cache/CDN hit rates match configuration
- [ ] Latencies align with component configs
- [ ] Failure rates work as configured
- [ ] Chaos testing works (kill/resurrect)
- [ ] No unexpected errors or crashes

## Template Comparison

| Template | Complexity | Components | Key Features | Best For |
|----------|------------|------------|--------------|----------|
| Basic Web App | Low | 5 | Simple 3-tier | Learning basics |
| E-Commerce | Medium | 12 | Caching, Async | Production patterns |
| Microservices | Medium | 13 | Service isolation | Architecture design |
| Serverless | Medium | 10 | Event-driven, PubSub | Cloud-native |
| CDN Hybrid | Medium | 10 | Multi-tier caching | Content delivery |
| Queue Pipeline | High | 11 | Complex async | Data processing |
| Comprehensive | High | 16 | Everything | Full testing |

## Automated Testing

For CI/CD integration, use these commands:

```bash
# Backend simulation test
cd backend
python -m pytest tests/test_engine.py -v

# Test specific template
python -c "
from engine.templates import get_templates
from engine.core import SimulationEngine
from engine.parser import GraphParser

templates = get_templates()
template = next(t for t in templates if t['id'] == 'basic_web_app')

events = []
engine = SimulationEngine(event_callback=events.append)
GraphParser.parse(template['graph'], engine)

import asyncio
asyncio.run(engine.run_simulation(until=10))

assert len(events) > 50, 'Expected at least 50 events'
print(f'✓ Generated {len(events)} events')
"
```

## Conclusion

This testing guide provides comprehensive coverage of all templates and components. When testing:

1. Start with Basic Web App to understand fundamentals
2. Progress to specialized templates for specific patterns
3. Use Comprehensive System for full integration testing
4. Apply chaos engineering to test resilience
5. Monitor metrics to validate behavior
6. Use automated tests for regression prevention

For any issues or unexpected behavior, consult the component reference documentation or check the event logs for detailed flow information.
