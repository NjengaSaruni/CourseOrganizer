# Course Organizer - Microservices Migration Plan

## Table of Contents
1. [Service Boundaries](#service-boundaries)
2. [Architecture Overview](#architecture-overview)
3. [Data Migration Strategy](#data-migration-strategy)
4. [Service Communication](#service-communication)
5. [Infrastructure Setup](#infrastructure-setup)
6. [Phased Migration](#phased-migration)
7. [Monitoring & Observability](#monitoring--observability)
8. [Cost Analysis](#cost-analysis)

## Service Boundaries

### Current Monolith Structure
```
Django Apps:
├── directory/          → Users, Academic Years
├── school/            → Classes, Departments
├── course_api/        → Courses, Meetings, Groups
├── course_content/    → Materials, Recordings
└── communication/     → Announcements, Messages
```

### Proposed Microservices

1. **Identity Service** (directory/)
```yaml
Responsibility: User management and authentication
APIs:
  - /auth/*         → Authentication endpoints
  - /users/*        → User management
  - /academic-years/* → Academic year management
Database: PostgreSQL
Tables:
  - users
  - academic_years
  - semesters
  - user_profiles
  - login_history
Tech Stack:
  - Python/FastAPI
  - PostgreSQL
  - Redis (sessions)
```

2. **Academic Service** (school/)
```yaml
Responsibility: Academic structure management
APIs:
  - /departments/*  → Department management
  - /classes/*      → Class management
  - /programs/*     → Program management
Database: PostgreSQL
Tables:
  - departments
  - classes
  - programs
  - class_schedules
Tech Stack:
  - Python/FastAPI
  - PostgreSQL
```

3. **Course Service** (course_api/)
```yaml
Responsibility: Course and timetable management
APIs:
  - /courses/*      → Course CRUD
  - /timetable/*    → Schedule management
  - /meetings/*     → Meeting management
Database: PostgreSQL
Tables:
  - courses
  - timetable_entries
  - course_enrollments
  - meetings
Tech Stack:
  - Python/FastAPI
  - PostgreSQL
  - Redis (caching)
```

4. **Content Service** (course_content/)
```yaml
Responsibility: Course material management
APIs:
  - /materials/*    → Course materials
  - /recordings/*   → Lecture recordings
  - /assignments/*  → Assignments
Storage:
  - Database: PostgreSQL
  - Files: Google Cloud Storage
Tables:
  - materials
  - recordings
  - assignments
  - content_views
Tech Stack:
  - Python/FastAPI
  - PostgreSQL
  - GCS
```

5. **Communication Service** (communication/)
```yaml
Responsibility: Real-time messaging and notifications
APIs:
  - /messages/*     → Chat messages
  - /notifications/* → Notifications
  - /announcements/* → Announcements
Database: MongoDB
Collections:
  - messages
  - notifications
  - announcements
  - chat_rooms
Tech Stack:
  - Node.js/Express
  - MongoDB
  - Redis (pub/sub)
```

6. **Study Group Service**
```yaml
Responsibility: Study group management
APIs:
  - /groups/*       → Group management
  - /memberships/*  → Group memberships
  - /activities/*   → Group activities
Database: PostgreSQL
Tables:
  - study_groups
  - group_memberships
  - group_activities
Tech Stack:
  - Python/FastAPI
  - PostgreSQL
  - Redis
```

7. **Video Service** (Jitsi integration)
```yaml
Responsibility: Video call management
APIs:
  - /video-calls/*  → Call management
  - /recordings/*   → Call recordings
  - /tokens/*       → JWT tokens
Database: PostgreSQL
Tables:
  - video_calls
  - call_participants
  - call_recordings
Tech Stack:
  - Node.js/Express
  - PostgreSQL
  - Redis
```

8. **Analytics Service**
```yaml
Responsibility: Usage analytics and reporting
APIs:
  - /analytics/*    → Usage stats
  - /reports/*      → Generated reports
  - /metrics/*      → System metrics
Database: TimescaleDB
Tables:
  - user_activities
  - content_views
  - system_metrics
Tech Stack:
  - Python/FastAPI
  - TimescaleDB
  - Redis
```

## Architecture Overview

### System Architecture
```
                                   Client Apps
                                       │
                                       ▼
                               API Gateway (Kong)
                                       │
┌──────────┬──────────┬───────────────┼───────────────┬──────────┬──────────┐
│          │          │               │               │          │          │
▼          ▼          ▼               ▼               ▼          ▼          ▼
Identity  Academic   Course        Content         Comms      Study     Video
Service   Service    Service       Service        Service    Groups    Service
│          │          │               │               │          │          │
└──────────┴──────────┴───────────────┴───────────────┴──────────┴──────────┘
                                       │
                                Service Mesh
                                (Istio)
```

### Infrastructure Components

1. **API Gateway (Kong)**
```yaml
Features:
  - Authentication
  - Rate limiting
  - Request routing
  - SSL termination
  - API versioning
  - Request/response transformation
```

2. **Service Mesh (Istio)**
```yaml
Features:
  - Service discovery
  - Load balancing
  - Circuit breaking
  - Retry/timeout
  - mTLS
  - Traffic management
```

3. **Message Broker (RabbitMQ)**
```yaml
Queues:
  - email-notifications
  - content-updates
  - analytics-events
  - system-events
```

4. **Caching Layer (Redis Cluster)**
```yaml
Instances:
  - Session store
  - API response cache
  - Real-time messaging
  - Rate limiting
```

5. **Storage**
```yaml
Components:
  - PostgreSQL (transactional data)
  - MongoDB (messages/notifications)
  - TimescaleDB (analytics)
  - GCS (media files)
```

## Data Migration Strategy

### 1. Database Separation

```python
# Example: Identity Service Migration
from django.db import transaction

def migrate_users_to_identity_service():
    """Migrate user data to Identity service"""
    
    # 1. Create new schema
    CREATE_SCHEMA = """
    CREATE TABLE users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        created_at TIMESTAMP,
        updated_at TIMESTAMP
    );
    """
    
    # 2. Migrate data in batches
    BATCH_SIZE = 1000
    total_users = User.objects.count()
    
    for offset in range(0, total_users, BATCH_SIZE):
        with transaction.atomic():
            users = User.objects.all()[offset:offset + BATCH_SIZE]
            
            for user in users:
                # Insert into new database
                INSERT_USER = """
                INSERT INTO users (
                    id, email, password_hash, first_name,
                    last_name, created_at, updated_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """
                
                # Write to both databases during migration
                new_db.execute(INSERT_USER, [
                    user.id, user.email, user.password,
                    user.first_name, user.last_name,
                    user.date_joined, user.last_login
                ])
```

### 2. Data Synchronization

```python
# Example: Two-way sync during migration
class UserChangeListener:
    def on_user_change(self, user_id, change_type):
        if change_type == 'update':
            # Sync to new service
            identity_service.update_user(user_id, {
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name
            })
            
            # Write to message queue for other services
            publish_event('user.updated', {
                'user_id': user_id,
                'timestamp': datetime.utcnow()
            })
```

## Service Communication

### 1. Synchronous (REST)

```python
# Example: Course service calling Identity service
from fastapi import FastAPI, HTTPException
import httpx

app = FastAPI()

@app.get("/courses/{course_id}/students")
async def get_course_students(course_id: str):
    # Get student IDs from course service
    student_ids = await get_course_enrollment(course_id)
    
    # Get student details from Identity service
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://identity-service/users/batch",
            json={"user_ids": student_ids},
            headers={"X-Service-Token": get_service_token()}
        )
        
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code)
        
        return response.json()
```

### 2. Asynchronous (Events)

```python
# Example: Content service publishing updates
from fastapi import FastAPI
from redis_pubsub import RedisPublisher

app = FastAPI()
publisher = RedisPublisher()

@app.post("/materials/{material_id}/publish")
async def publish_material(material_id: str):
    # Update material status
    material = await update_material_status(material_id, "published")
    
    # Publish event
    await publisher.publish("content.published", {
        "material_id": material_id,
        "course_id": material.course_id,
        "publisher_id": material.publisher_id,
        "timestamp": datetime.utcnow().isoformat()
    })
    
    return {"status": "published"}
```

### 3. Service Mesh Configuration

```yaml
# Example: Istio Virtual Service
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: content-service
spec:
  hosts:
  - content-service
  http:
  - route:
    - destination:
        host: content-service
        subset: v1
    retries:
      attempts: 3
      perTryTimeout: 2s
    timeout: 10s
```

## Infrastructure Setup

### 1. Kubernetes Resources

```yaml
# Example: Content Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: content-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: content-service
  template:
    metadata:
      labels:
        app: content-service
    spec:
      containers:
      - name: content-service
        image: gcr.io/course-organizer/content-service:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: content-service-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: content-service-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 20
```

### 2. Service Mesh

```yaml
# Example: Istio Service Entry
apiVersion: networking.istio.io/v1alpha3
kind: ServiceEntry
metadata:
  name: cloud-storage
spec:
  hosts:
  - storage.googleapis.com
  ports:
  - number: 443
    name: https
    protocol: HTTPS
  resolution: DNS
  location: MESH_EXTERNAL
```

### 3. API Gateway

```yaml
# Example: Kong Route Configuration
apiVersion: configuration.konghq.com/v1
kind: KongIngress
metadata:
  name: content-service
spec:
  routes:
  - paths:
    - /api/v1/content
    strip_path: true
    preserve_host: true
    protocols:
    - https
    methods:
    - GET
    - POST
    - PUT
    - DELETE
  plugins:
  - name: rate-limiting
    config:
      minute: 60
      hour: 1000
  - name: cors
    config:
      origins:
      - '*'
      methods:
      - GET
      - POST
      - PUT
      - DELETE
      headers:
      - Authorization
      - Content-Type
```

## Phased Migration

### Phase 1: Infrastructure Setup (Month 1-2)
```
1. Set up Kubernetes cluster
2. Configure service mesh (Istio)
3. Set up API gateway (Kong)
4. Configure monitoring (Prometheus + Grafana)
5. Set up CI/CD pipelines
```

### Phase 2: Identity Service (Month 3-4)
```
1. Migrate user authentication
2. Set up new user database
3. Create synchronization mechanism
4. Test and validate
5. Gradual traffic migration
```

### Phase 3: Content Services (Month 5-6)
```
1. Split content and course services
2. Migrate media storage to GCS
3. Set up content delivery network
4. Test and validate
5. Traffic migration
```

### Phase 4: Communication Service (Month 7-8)
```
1. Migrate to MongoDB
2. Set up WebSocket clusters
3. Implement event-driven architecture
4. Test and validate
5. Traffic migration
```

### Phase 5: Remaining Services (Month 9-12)
```
1. Migrate study groups
2. Migrate video service
3. Set up analytics service
4. Final testing and validation
5. Complete traffic migration
```

## Monitoring & Observability

### 1. Metrics Collection

```yaml
# Example: Prometheus ServiceMonitor
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: content-service
spec:
  selector:
    matchLabels:
      app: content-service
  endpoints:
  - port: metrics
    interval: 15s
    path: /metrics
```

### 2. Distributed Tracing

```yaml
# Example: Jaeger Configuration
apiVersion: jaegertracing.io/v1
kind: Jaeger
metadata:
  name: course-organizer-tracing
spec:
  strategy: production
  storage:
    type: elasticsearch
    options:
      es:
        server-urls: http://elasticsearch:9200
```

### 3. Log Aggregation

```yaml
# Example: Fluentd Configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluentd-config
data:
  fluent.conf: |
    <match kubernetes.**>
      @type elasticsearch
      host elasticsearch-logging
      port 9200
      logstash_format true
      logstash_prefix k8s
      <buffer>
        flush_interval 5s
      </buffer>
    </match>
```

## Cost Analysis

### Development Costs
```
Component                Cost/Month    Setup Time
─────────────────────────────────────────────────
GKE Cluster             $300-500      1 week
Service Mesh            $100-200      2 weeks
Monitoring              $200-300      1 week
CI/CD Pipeline          $100-200      1 week
Development Team        $30,000       3-6 months
───────────────────────────────────────
Total: ~$100,000 for initial setup and migration
```

### Operational Costs
```
Service                 Cost/Month    Notes
─────────────────────────────────────────────────
Identity Service        $200-300      CPU/Memory
Content Service         $300-500      Storage heavy
Communication Service   $200-300      Memory heavy
Study Groups Service    $150-250      Standard load
Video Service          $500-1000     Bandwidth heavy
Analytics Service      $200-400      CPU/Storage
───────────────────────────────────────
Total: $1,550-2,750/month base cost
```

### Scaling Costs
```
Users     Monthly Cost    Infrastructure
─────────────────────────────────────────────────
5K        $2,000         Single region
10K       $3,500         Multi-zone
25K       $7,000         Multi-region
50K       $12,000        Global distribution
100K+     $20,000+       Custom setup
```

## Next Steps

1. **Immediate Actions**
   - Set up Kubernetes cluster
   - Configure monitoring
   - Create service templates

2. **Team Structure**
   - 1 DevOps Engineer
   - 2-3 Backend Engineers
   - 1 Frontend Engineer
   - 1 QA Engineer

3. **Success Metrics**
   - Service response times
   - Error rates
   - Resource utilization
   - Deployment frequency
   - Recovery time

4. **Risk Mitigation**
   - Automated rollback
   - Feature flags
   - Canary deployments
   - Comprehensive monitoring

---

*Generated: October 2025*  
*Version: 1.0*
