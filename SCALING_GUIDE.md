# Scaling Guide - Course Organizer

**Last Updated:** January 2025  
**Current Architecture:** Single GCE VM + Self-hosted Jitsi

---

## Table of Contents
1. [Current Limitations](#current-limitations)
2. [Scaling Stages](#scaling-stages)
3. [Component-Specific Scaling](#component-specific-scaling)
4. [Migration Roadmap](#migration-roadmap)
5. [Cost Analysis](#cost-analysis)

---

## Current Limitations

### Architecture Bottlenecks

```
Current Setup (Single VM):
┌─────────────────────────────────────────────────────────┐
│  SINGLE POINT OF FAILURE                                │
│  ├── 1 VM handles all traffic                           │
│  ├── 1 Backend instance (Gunicorn + Daphne)            │
│  ├── 1 PostgreSQL instance                              │
│  ├── 1 Redis instance                                   │
│  └── 1 Nginx instance                                   │
│                                                          │
│  LIMITATIONS:                                            │
│  ├── CPU: VM cores (4-8 vCPUs typically)                │
│  ├── RAM: VM memory (8-16GB typically)                  │
│  ├── Network: VM bandwidth (~2-10 Gbps)                 │
│  ├── Storage: Local SSD (limited IOPS)                  │
│  └── WebSocket: Single process limit (~10k connections) │
└─────────────────────────────────────────────────────────┘
```

---

## Scaling Stages

### Stage 1: Startup (0-500 Concurrent Users)

**Current Setup: ✅ SUFFICIENT**

```
Users: 0-500 concurrent (up to 2,000 total registered)
Load: ~50 requests/second peak
WebSocket: ~200-300 concurrent connections
Database: ~100 queries/second
Storage: <10GB media files

Architecture:
└── Single e2-medium/e2-standard-2 GCE VM
    ├── 2-4 vCPUs
    ├── 8-16GB RAM
    └── 50GB SSD

Expected Response Times:
├── API calls: 50-200ms
├── Page loads: 1-3 seconds
├── WebSocket latency: 10-50ms
└── Video calls: Good (1-10 participants/room)

Monthly Cost: ~$50-100 USD
```

**Bottlenecks Start Appearing At:**
- **400+ concurrent users** → Backend CPU spikes
- **300+ WebSocket connections** → Memory pressure
- **150+ queries/second** → Database slow queries
- **50+ concurrent video calls** → Jitsi bandwidth issues

---

### Stage 2: Growth (500-2,000 Concurrent Users)

**Required Changes: 🟡 OPTIMIZATION NEEDED**

```
Users: 500-2,000 concurrent (up to 10,000 total registered)
Load: ~200 requests/second peak
WebSocket: ~1,000 concurrent connections
Database: ~500 queries/second
Storage: 50-100GB media files

CRITICAL ISSUES:
├── Single backend can't handle WebSocket load
├── Database query optimization needed
├── Media files cause storage I/O bottleneck
└── Jitsi single server maxed out
```

#### Solution: Vertical Scaling + Optimization

**1. Upgrade VM Tier**
```yaml
From: e2-medium (2 vCPU, 8GB)
To:   n2-standard-4 (4 vCPU, 16GB)

Cost: ~$100-150/month
```

**2. Database Optimization**
```sql
-- Add missing indexes
CREATE INDEX idx_groupmessage_group_created ON course_api_groupmessage(group_id, created_at DESC);
CREATE INDEX idx_studygroup_class ON course_api_studygroup(student_class_id);
CREATE INDEX idx_user_email ON directory_user(email);
CREATE INDEX idx_membership_user_group ON course_api_studygroupmembership(user_id, group_id);

-- Enable query caching
ALTER TABLE course_api_course SET (autovacuum_enabled = true);
VACUUM ANALYZE;
```

**3. Redis Configuration**
```redis
# Increase max memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Enable persistence for sessions
save 900 1
save 300 10
save 60 10000
```

**4. Backend Scaling**
```yaml
# docker-compose.gce.yml
backend:
  deploy:
    replicas: 2  # Run 2 backend containers
  environment:
    - GUNICORN_WORKERS=4  # 4 workers per container
    - GUNICORN_THREADS=2
```

**5. Move Media to Object Storage**
```python
# settings.py
DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
GS_BUCKET_NAME = 'course-organizer-media'
GS_AUTO_CREATE_BUCKET = True
GS_DEFAULT_ACL = 'publicRead'
GS_QUERYSTRING_AUTH = False  # Public URLs
```

**6. Enable CDN**
```
Google Cloud CDN or CloudFlare
├── Static files: Cache 30 days
├── Media files: Cache 7 days
└── API responses: No cache (dynamic)

Expected improvement:
├── Static load: -80% on origin
├── Media load: -70% on origin
└── Response time: -50% globally
```

**Monthly Cost:** ~$200-300 USD

---

### Stage 3: Established (2,000-10,000 Concurrent Users)

**Required Changes: 🔴 MAJOR REFACTOR NEEDED**

```
Users: 2,000-10,000 concurrent (up to 50,000 total registered)
Load: ~1,000 requests/second peak
WebSocket: ~5,000 concurrent connections
Database: ~2,000 queries/second
Storage: 200GB-1TB media files

CRITICAL ISSUES:
├── Single VM cannot handle load (CPU/Memory maxed)
├── Database becomes bottleneck
├── Redis single instance insufficient
├── Jitsi needs dedicated infrastructure
└── No redundancy = downtime risk
```

#### Solution: Horizontal Scaling (Multi-VM)

**Architecture Evolution:**

```
                     Google Cloud Load Balancer
                              │
                    ┌─────────┴─────────┐
                    │                   │
        ┌───────────▼──────────┐  ┌─────▼──────────┐
        │  Backend Pool        │  │  Backend Pool  │
        │  (Auto-scaling)      │  │  (Auto-scaling)│
        │  ├── 2-5 instances   │  │  ├── 2-5 inst. │
        │  ├── Gunicorn        │  │  ├── Daphne    │
        │  └── HTTP only       │  │  └── WebSocket │
        └──────────┬───────────┘  └────────┬───────┘
                   │                       │
                   └───────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │  Managed Services    │
                    ├──────────────────────┤
                    │  Cloud SQL (Postgres)│
                    │  ├── 4 vCPU, 16GB    │
                    │  ├── Read replicas   │
                    │  └── Auto-backup     │
                    ├──────────────────────┤
                    │  Memorystore (Redis) │
                    │  ├── 5GB             │
                    │  └── High Availability│
                    ├──────────────────────┤
                    │  Cloud Storage (GCS) │
                    │  └── Media files     │
                    └──────────────────────┘
```

**1. Separate HTTP and WebSocket Workloads**

```yaml
# Backend Instance Group (HTTP API)
- Type: Managed Instance Group
- Min instances: 2
- Max instances: 10
- Autoscaling: CPU > 70%
- Machine type: n2-standard-2
- Image: Backend with Gunicorn only

# WebSocket Instance Group (Channels)
- Type: Managed Instance Group  
- Min instances: 2
- Max instances: 5
- Autoscaling: WebSocket connections > 1000/instance
- Machine type: n2-standard-4 (more RAM for connections)
- Image: Backend with Daphne only
```

**2. Managed Database (Cloud SQL)**

```
Configuration:
├── PostgreSQL 15
├── Machine type: db-n1-standard-4 (4 vCPU, 15GB RAM)
├── Storage: 100GB SSD (auto-expanding)
├── Automatic backups: Daily
├── Point-in-time recovery: 7 days
├── Read replicas: 1-2 (for reporting)
└── Connection pooling: PgBouncer

Performance:
├── Max connections: 500
├── Queries/second: 5,000+
├── Failover: Automatic <60 seconds
└── Maintenance: Zero-downtime

Monthly Cost: ~$300-400
```

**3. Managed Redis (Memorystore)**

```
Configuration:
├── Standard tier (HA)
├── Memory: 5GB
├── Network: VPC peering
├── Automatic failover: <60 seconds
└── Persistence: RDB snapshots

Use Cases:
├── Session storage
├── Channel layer (WebSocket)
├── API response cache
└── Rate limiting

Monthly Cost: ~$150
```

**4. Load Balancer Configuration**

```yaml
HTTP(S) Load Balancer:
  Frontend:
    - Port 443 (HTTPS)
    - SSL Certificate: Managed by Google
    - Protocol: HTTP/2
  
  Backend Services:
    api-backend:
      - Path: /api/*
      - Target: HTTP instance group
      - Health check: /api/health
      - Session affinity: None
      - Timeout: 30s
    
    ws-backend:
      - Path: /ws/*
      - Target: WebSocket instance group
      - Health check: /health
      - Session affinity: Client IP (sticky)
      - Timeout: 3600s (1 hour for long connections)
    
    static-cdn:
      - Path: /static/*, /media/*
      - Target: Cloud CDN → Cloud Storage
      - Cache: 30 days
```

**5. Dedicated Jitsi Infrastructure**

```
Jitsi Video Bridge Scaling:

Single JVB Server Limits:
├── ~500 concurrent participants
├── ~50 concurrent meetings (10 participants each)
└── ~10 Gbps bandwidth

Multi-JVB Setup (Required at 2,000+ concurrent users):

                Load Balancer
                      │
          ┌───────────┼───────────┐
          │           │           │
       JVB-1       JVB-2       JVB-3
     (500 users) (500 users) (500 users)
          │           │           │
          └───────────┴───────────┘
                      │
                  Prosody (XMPP)
                  Jicofo (Focus)

Configuration per JVB:
├── Machine: n2-highcpu-8 (8 vCPU, 8GB)
├── Bandwidth: 10 Gbps
├── Max participants: 500
└── Monthly cost: ~$200/instance

Total Jitsi Cost (3 JVB): ~$700/month
```

**6. Auto-scaling Configuration**

```yaml
Backend HTTP Auto-scaler:
  metrics:
    - type: CPU
      target: 70%
    - type: Request count
      target: 100 req/s per instance
  cooldown: 60s
  scale_up: 
    increment: 2 instances
    speed: Fast
  scale_down:
    increment: 1 instance
    speed: Slow (5 min)

WebSocket Auto-scaler:
  metrics:
    - type: Memory
      target: 75%
    - type: Custom (WebSocket connections)
      target: 1000 connections/instance
  cooldown: 120s
  scale_up:
    increment: 1 instance
    speed: Medium
  scale_down:
    increment: 1 instance
    speed: Very slow (10 min) # Preserve connections
```

**Expected Performance:**
```
API Response Time: 50-100ms (improved)
WebSocket Latency: 10-30ms (improved)
Database Queries: <50ms (95th percentile)
Video Call Quality: Excellent (50+ participants/room)
Uptime: 99.9% (with auto-healing)
```

**Monthly Cost:** ~$1,500-2,000 USD

---

### Stage 4: Scale (10,000-50,000 Concurrent Users)

**Required Changes: 🔴 ENTERPRISE ARCHITECTURE**

```
Users: 10,000-50,000 concurrent (up to 200,000 total registered)
Load: ~5,000 requests/second peak
WebSocket: ~25,000 concurrent connections
Database: ~10,000 queries/second
Storage: 2-10TB media files

REQUIRED CHANGES:
├── Kubernetes for orchestration
├── Multi-region deployment
├── Database sharding
├── Message queue for async tasks
└── Advanced caching strategies
```

#### Solution: Kubernetes + Microservices

**Architecture:**

```
                    Cloud DNS (Multi-region)
                              │
            ┌─────────────────┴─────────────────┐
            │                                   │
      Region: us-central1              Region: europe-west1
            │                                   │
    Global Load Balancer              Global Load Balancer
            │                                   │
    GKE Cluster (Primary)             GKE Cluster (Replica)
    ├── API Pods (20-50)              ├── API Pods (10-20)
    ├── WebSocket Pods (10-20)        ├── WebSocket Pods (5-10)
    ├── Worker Pods (5-10)            └── Worker Pods (2-5)
    └── Ingress Controller
            │
    ┌───────┴────────┐
    │                │
Cloud SQL        Memorystore
(Primary)        (Multi-zone)
    │
Cloud SQL
(Replica)
```

**1. Kubernetes Deployment**

```yaml
# kubernetes/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: course-organizer-api
spec:
  replicas: 20
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 5
      maxUnavailable: 2
  template:
    spec:
      containers:
      - name: api
        image: gcr.io/project/backend:latest
        resources:
          requests:
            cpu: "500m"
            memory: "1Gi"
          limits:
            cpu: "2000m"
            memory: "4Gi"
        env:
        - name: WORKER_TYPE
          value: "http"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - course-organizer-api
              topologyKey: kubernetes.io/hostname

---
# Horizontal Pod Autoscaler
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: course-organizer-api
  minReplicas: 10
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 75
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
```

**2. Database Sharding Strategy**

```python
# Shard by user_id for better distribution
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_users',
        'HOST': 'cloudsql-primary',
    },
    'shard_0': {  # user_id % 4 == 0
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_shard_0',
        'HOST': 'cloudsql-shard-0',
    },
    'shard_1': {  # user_id % 4 == 1
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_shard_1',
        'HOST': 'cloudsql-shard-1',
    },
    'shard_2': {  # user_id % 4 == 2
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_shard_2',
        'HOST': 'cloudsql-shard-2',
    },
    'shard_3': {  # user_id % 4 == 3
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_shard_3',
        'HOST': 'cloudsql-shard-3',
    },
    'analytics': {  # Read-only replica for reports
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'course_organizer_analytics',
        'HOST': 'cloudsql-read-replica',
        'OPTIONS': {'options': '-c default_transaction_read_only=on'},
    }
}

DATABASE_ROUTERS = ['core.db_routers.ShardRouter']
```

**3. Message Queue for Async Tasks**

```python
# Use Cloud Pub/Sub or RabbitMQ
from google.cloud import pubsub_v1

# Replace synchronous email sending
def send_verification_email(user, token):
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path('project-id', 'email-queue')
    
    message = {
        'type': 'verification_email',
        'user_id': user.id,
        'email': user.email,
        'token': token
    }
    
    publisher.publish(topic_path, json.dumps(message).encode('utf-8'))

# Worker process
def email_worker():
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path('project-id', 'email-worker')
    
    def callback(message):
        data = json.loads(message.data)
        # Send email using Gmail API
        send_email_via_api(data)
        message.ack()
    
    subscriber.subscribe(subscription_path, callback=callback)
```

**4. Advanced Caching**

```python
# Multi-layer cache
CACHES = {
    'default': {  # Redis (L1 - fast, volatile)
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://memorystore:6379/0',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            'MAX_ENTRIES': 10000,
        },
        'TIMEOUT': 300,  # 5 minutes
    },
    'persistent': {  # Memcached (L2 - slower, more capacity)
        'BACKEND': 'django.core.cache.backends.memcached.PyMemcacheCache',
        'LOCATION': 'memcached:11211',
        'TIMEOUT': 3600,  # 1 hour
    },
    'cdn': {  # CloudFlare/CDN (L3 - public content)
        # Configured via CDN headers
        'TIMEOUT': 86400,  # 24 hours
    }
}

# Cache strategy
from django.core.cache import caches

def get_course_timeline(course_id):
    cache_key = f'course_timeline:{course_id}'
    
    # Try L1 cache (Redis)
    result = caches['default'].get(cache_key)
    if result:
        return result
    
    # Try L2 cache (Memcached)
    result = caches['persistent'].get(cache_key)
    if result:
        # Backfill L1
        caches['default'].set(cache_key, result, 300)
        return result
    
    # Fetch from database
    result = CourseContent.get_timeline_for_course(course_id)
    
    # Store in both caches
    caches['default'].set(cache_key, result, 300)
    caches['persistent'].set(cache_key, result, 3600)
    
    return result
```

**5. WebSocket Scaling with Redis Pub/Sub**

```python
# settings.py
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [
                {
                    "address": "redis://memorystore-1:6379/1",
                    "weight": 100,
                },
                {
                    "address": "redis://memorystore-2:6379/1",
                    "weight": 100,
                },
            ],
            "capacity": 10000,  # Per-channel capacity
            "expiry": 60,  # Message expiry (seconds)
        },
    },
}

# This allows WebSocket messages to be delivered across pods
# Pod A can receive a message and broadcast to users on Pod B
```

**Expected Performance:**
```
API Response Time: 30-50ms (p95)
WebSocket Latency: 5-15ms
Database Queries: <20ms (p95)
Video Call Quality: Excellent (100+ participants/room)
Uptime: 99.95%
Global Latency: <100ms (with multi-region)
```

**Monthly Cost:** ~$5,000-8,000 USD

---

## Component-Specific Scaling

### 1. Database Scaling

```
User Range          Strategy                      Cost/Month
──────────────────────────────────────────────────────────────────
0-2K                Single PostgreSQL             $0 (included)
2K-10K              Optimized indexes             $0
                    Connection pooling
                    
10K-50K             Cloud SQL Standard            $300
                    + Read replica                +$200
                    Total                         $500

50K-200K            Cloud SQL HA                  $800
                    + 2 Read replicas             +$400
                    + Query caching               +$100
                    Total                         $1,300

200K+               Sharded Cloud SQL             $3,000
                    (4 shards + replicas)
                    + Analytics DB                +$500
                    Total                         $3,500
```

**Critical Query Optimizations:**

```sql
-- Before: Full table scan (1000ms at 100K users)
SELECT * FROM directory_user WHERE email = 'user@example.com';

-- After: Index lookup (2ms)
CREATE INDEX idx_user_email ON directory_user(email);

-- Before: Sequential scan (2000ms for popular groups)
SELECT * FROM course_api_groupmessage 
WHERE group_id = 123 
ORDER BY created_at DESC 
LIMIT 50;

-- After: Index scan (5ms)
CREATE INDEX idx_groupmessage_group_created 
ON course_api_groupmessage(group_id, created_at DESC);

-- Before: N+1 query problem (50 queries for 50 messages)
messages = GroupMessage.objects.filter(group=group)
for msg in messages:
    print(msg.sender.name)  # Triggers query per message

-- After: Prefetch (1 query)
messages = GroupMessage.objects.filter(group=group).select_related('sender')
```

### 2. WebSocket Scaling

```
Concurrent          Strategy                      Architecture
Connections
────────────────────────────────────────────────────────────────────
0-500               Single Daphne                 1 backend container
                    In-memory channel layer       No Redis needed

500-2K              Daphne + Redis                1 backend container
                    Redis channel layer           + 1 Redis container

2K-10K              Multiple Daphne               2-5 backend containers
                    Redis Pub/Sub                 + Redis HA

10K-50K             Dedicated WS pool             5-10 WS containers
                    Sticky sessions               + Separate API pool
                    Redis Cluster                 + Redis cluster (3 nodes)

50K+                Kubernetes pods               20+ WS pods
                    External WS service           Or dedicated WS service
                    (e.g., Pusher, Ably)          ($500-2000/month)
```

**WebSocket Connection Limits:**

```
Single Daphne Process:
├── Theoretical max: ~65,000 (file descriptor limit)
├── Practical max: ~10,000 (memory constraints)
├── Memory per connection: ~10-50KB
└── At 10K connections: ~500MB RAM

Multiple Daphne with Redis:
├── Connections per pod: 5,000
├── Number of pods: Auto-scale 2-20
├── Total capacity: 100,000 connections
└── Redis capacity: 100MB per 10K connections
```

### 3. Media Storage Scaling

```
Storage Size        Strategy                      Cost/Month
──────────────────────────────────────────────────────────────────
0-10GB              Local volume                  $0 (included in VM)
10-100GB            Local SSD                     $17 (100GB SSD)
100GB-1TB           Cloud Storage Standard        $20-200
1TB-10TB            Cloud Storage                 $200-2,000
                    + CDN (CloudFlare)            +$0-200
                    Total                         $200-2,200

10TB+               Cloud Storage Nearline        $1,000
                    (older files)
                    + Standard (recent)           +$500
                    + CDN with video streaming    +$500
                    Total                         $2,000
```

**Migration Strategy:**

```bash
# Phase 1: Set up Cloud Storage bucket
gsutil mb -c STANDARD -l us-central1 gs://course-organizer-media

# Phase 2: Sync existing media
gsutil -m rsync -r /app/media gs://course-organizer-media

# Phase 3: Update Django settings
DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
GS_BUCKET_NAME = 'course-organizer-media'

# Phase 4: Set lifecycle rules (archive old files)
gsutil lifecycle set lifecycle.json gs://course-organizer-media
```

### 4. Jitsi Scaling

```
Concurrent          Video Bridges    Bandwidth      Cost/Month
Participants        (JVB)           Per JVB
──────────────────────────────────────────────────────────────────
0-50                1 JVB            1 Gbps         $100
50-500              1 JVB            10 Gbps        $200
500-2K              4 JVB            10 Gbps each   $800
2K-10K              15 JVB           10 Gbps each   $3,000
10K+                Custom setup     Dedicated      $5,000+
                    Or use Jitsi-as-a-Service       $2,000-10,000
```

**JVB Load Balancing:**

```
Participants per JVB = Total Participants / Number of JVBs

Example: 1,500 participants
├── 3 JVB instances
├── Each handles ~500 participants
├── Each handles ~50 concurrent meetings (10 participants each)
└── Load distributed by Jicofo based on current load
```

---

## Migration Roadmap

### Month 1-3: Optimization (No Architecture Change)

```
✓ Add database indexes
✓ Enable Redis caching
✓ Optimize Django queries (select_related, prefetch_related)
✓ Enable gzip compression in Nginx
✓ Set up monitoring (Prometheus + Grafana)

Cost: $0
Time: 1-2 weeks
Impact: 30-50% performance improvement
```

### Month 4-6: Cloud Storage Migration

```
✓ Set up Google Cloud Storage bucket
✓ Migrate existing media files
✓ Update Django to use GCS
✓ Enable Cloud CDN
✓ Set up lifecycle policies

Cost: +$50-100/month
Time: 1 week
Impact: 80% reduction in media serving load
```

### Month 7-12: Managed Services

```
✓ Migrate to Cloud SQL
✓ Migrate to Memorystore (Redis)
✓ Set up read replicas
✓ Enable automatic backups
✓ Configure connection pooling

Cost: +$500-700/month
Time: 2-3 weeks
Impact: 99.9% uptime, better performance
```

### Month 13-18: Horizontal Scaling

```
✓ Set up load balancer
✓ Create instance templates
✓ Configure auto-scaling groups
✓ Separate HTTP and WebSocket workloads
✓ Multi-zone deployment

Cost: +$800-1,000/month
Time: 3-4 weeks
Impact: Handle 10x traffic, 99.95% uptime
```

### Month 19-24: Kubernetes Migration

```
✓ Set up GKE cluster
✓ Containerize application
✓ Deploy with Helm charts
✓ Configure HPA (Horizontal Pod Autoscaler)
✓ Multi-region deployment

Cost: +$3,000-5,000/month
Time: 2-3 months
Impact: Enterprise-grade, 100x scalability
```

---

## Cost Analysis

### Current vs Scaled Costs

```
User Range    Monthly Cost    Breakdown
──────────────────────────────────────────────────────────────
0-500         $50-100         VM ($50) + Domain ($10)

500-2K        $200-300        VM ($150) + CDN ($50)
                              + Cloud Storage ($50)

2K-10K        $1,500-2,000    VMs ($400) + Cloud SQL ($500)
                              + Redis ($150) + CDN ($100)
                              + Jitsi ($300) + LB ($50)

10K-50K       $5,000-8,000    GKE ($2,000) + Cloud SQL ($1,300)
                              + Redis ($500) + CDN ($500)
                              + Jitsi ($3,000) + Monitoring ($200)

50K+          $15,000-30,000  Multi-region GKE ($8,000)
                              + Sharded DB ($3,500)
                              + Redis Cluster ($1,500)
                              + CDN ($1,000) + Jitsi ($5,000)
                              + Monitoring ($500) + Support ($1,500)
```

### Cost per User (Monthly)

```
User Range        Cost/User/Month    Notes
────────────────────────────────────────────────────────────
500               $0.20              Early stage
2,000             $0.15              Growth
10,000            $0.20              Scale
50,000            $0.16              Enterprise
200,000           $0.15              Optimized at scale
```

---

## Monitoring & Alerts

### Key Metrics to Track

```
Metric                  Warning         Critical        Action
─────────────────────────────────────────────────────────────────
CPU Usage               70%             85%             Scale up
Memory Usage            75%             90%             Scale up
API Response Time       200ms           500ms           Investigate
Database Connections    70%             90%             Add read replica
WebSocket Connections   75%             90%             Scale WS pods
Disk Usage              70%             85%             Expand storage
Error Rate              1%              5%              Alert on-call
```

### Monitoring Stack

```
Component              Tool                Cost/Month
──────────────────────────────────────────────────────────
Metrics               Prometheus          Free (self-hosted)
                      or Cloud Monitoring $50-200

Dashboards            Grafana             Free (self-hosted)
                      
Logs                  Cloud Logging       $50-500 (by volume)

APM                   Sentry              $26-80 (up to 100K events)

Uptime Monitoring     UptimeRobot         Free (50 monitors)
                      or Pingdom          $15-72

Total: $140-850/month (depending on scale)
```

---

## Conclusion

### Scaling Summary

```
Stage               Users       Monthly Cost    Complexity
──────────────────────────────────────────────────────────────
✅ Current         0-500       $50-100         Low
🟡 Next Phase      500-2K      $200-300        Low-Medium
🟠 Growth          2K-10K      $1,500-2K       Medium
🔴 Scale           10K-50K     $5K-8K          High
⚫ Enterprise      50K+        $15K-30K        Very High

When to Upgrade:
├── 400+ concurrent → Add indexes + Redis
├── 1,500+ concurrent → Cloud SQL + CDN
├── 5,000+ concurrent → Load balancer + auto-scaling
├── 20,000+ concurrent → Kubernetes
└── 100,000+ concurrent → Multi-region + sharding
```

### Next Steps

1. **Immediate** (0-500 users):
   - Add database indexes
   - Enable Redis caching
   - Set up monitoring

2. **Short-term** (500-2K users):
   - Migrate to Cloud Storage
   - Enable CDN
   - Upgrade VM tier

3. **Medium-term** (2K-10K users):
   - Migrate to Cloud SQL
   - Set up load balancer
   - Auto-scaling groups

4. **Long-term** (10K+ users):
   - Kubernetes migration
   - Multi-region deployment
   - Database sharding

---

*Last Updated: January 2025*  
*Document Version: 1.0*

