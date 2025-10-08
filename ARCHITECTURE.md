# Course Organizer - System Architecture

**Last Updated:** January 2025  
**Deployment:** Google Compute Engine (GCE)  
**Domains:** co.riverlearn.co.ke (main app), jitsi.riverlearn.co.ke (video calls)

---

## Table of Contents
1. [High-Level Architecture](#high-level-architecture)
2. [Infrastructure Components](#infrastructure-components)
3. [Application Stack](#application-stack)
4. [Communication Flow](#communication-flow)
5. [Data Flow](#data-flow)
6. [Security & SSL](#security--ssl)
7. [Deployment Architecture](#deployment-architecture)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Internet Users                                │
│                     (Students, Admins, Faculty)                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTPS (443)
                             │
         ┌───────────────────┴──────────────────────┐
         │                                          │
         │   DNS: co.riverlearn.co.ke              │   DNS: jitsi.riverlearn.co.ke
         │                                          │
         ▼                                          ▼
┌────────────────────────────────┐      ┌──────────────────────────────────┐
│   GCE VM #1 (Main App)         │      │   GCE VM #2 (Jitsi)              │
│   Ubuntu 22.04 LTS             │      │   Ubuntu 22.04 LTS               │
│   IP: 34.121.171.1             │      │   Self-hosted Jitsi Meet         │
│   Zone: us-central1-a          │      │                                  │
└────────────────────────────────┘      └──────────────────────────────────┘
```

---

## Infrastructure Components

### GCE VM #1: Main Application Server

```
┌─────────────────────────────────────────────────────────────────────┐
│  Ubuntu 22.04 LTS VM (e2-medium or higher)                         │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Docker Compose Stack (docker-compose.gce.yml)                │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Nginx Container (Port 80, 443)                         │ │ │
│  │  │  ├── SSL Termination (Let's Encrypt)                   │ │ │
│  │  │  ├── Reverse Proxy                                      │ │ │
│  │  │  ├── Static Files (/static/)                           │ │ │
│  │  │  ├── Media Files (/media/)                             │ │ │
│  │  │  ├── API Proxy (/api/ → backend:8080)                  │ │ │
│  │  │  ├── WebSocket Proxy (/ws/ → backend:8080)             │ │ │
│  │  │  └── SPA Routing (/* → index.html)                     │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                    │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Backend Container (Django + Gunicorn + Daphne)        │ │ │
│  │  │  Port: 8080                                             │ │ │
│  │  │  ├── Django REST Framework (HTTP API)                  │ │ │
│  │  │  ├── Django Channels (WebSocket)                       │ │ │
│  │  │  ├── Authentication & Authorization                    │ │ │
│  │  │  ├── Business Logic                                    │ │ │
│  │  │  ├── File Uploads (Media)                              │ │ │
│  │  │  └── Jitsi JWT Token Generation                        │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                    │ │
│  │  ┌──────────────────────┬──────────────────────────────────┐ │ │
│  │  │  PostgreSQL 15       │  Redis 7                         │ │ │
│  │  │  Container           │  Container                       │ │ │
│  │  │  ├── User Data       │  ├── Session Store               │ │ │
│  │  │  ├── Courses         │  ├── Channel Layer (WebSocket)   │ │ │
│  │  │  ├── Messages        │  └── Cache                       │ │ │
│  │  │  ├── Study Groups    │                                  │ │ │
│  │  │  └── Meetings        │                                  │ │ │
│  │  └──────────────────────┴──────────────────────────────────┘ │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Certbot Container                                      │ │ │
│  │  │  └── SSL Certificate Auto-renewal (Let's Encrypt)      │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

### GCE VM #2: Jitsi Meet Server

```
┌─────────────────────────────────────────────────────────────────────┐
│  Jitsi Meet Self-Hosted (jitsi.riverlearn.co.ke)                   │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  Docker Compose Stack (jitsi-standalone)                     │ │
│  │                                                               │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Jitsi Web (Nginx)                                      │ │ │
│  │  │  ├── Web UI (React)                                     │ │ │
│  │  │  ├── lib-jitsi-meet                                     │ │ │
│  │  │  └── JWT Authentication (from Course Organizer)         │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                    │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Prosody (XMPP Server)                                  │ │ │
│  │  │  ├── JWT Token Validation                               │ │ │
│  │  │  ├── Room Management                                    │ │ │
│  │  │  └── User Authentication                                │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                    │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Jicofo (Conference Focus)                              │ │ │
│  │  │  └── Conference Management & Orchestration              │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                    │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  JVB (Jitsi Videobridge)                                │ │ │
│  │  │  ├── WebRTC Media Routing                               │ │ │
│  │  │  ├── Video/Audio Streams                                │ │ │
│  │  │  └── Screen Sharing                                     │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Application Stack

### Frontend (Angular 20)

```
┌─────────────────────────────────────────────────────────────┐
│  Angular 20 SPA (Standalone Components)                     │
│                                                              │
│  Core Services:                                              │
│  ├── AuthService          → JWT authentication              │
│  ├── ChatService          → WebSocket client                │
│  ├── GroupworkService     → Study groups API                │
│  ├── CourseService        → Course management               │
│  ├── CalendarService      → Timetable & events              │
│  └── LibJitsiCallService  → Video call integration          │
│                                                              │
│  Features:                                                   │
│  ├── Dashboard            → Overview & announcements        │
│  ├── Study Groups         → Group chat & collaboration      │
│  ├── Timetable            → Class schedule                  │
│  ├── Meetings             → Video call management           │
│  ├── Materials            → Course documents                │
│  ├── Recordings           → Lecture recordings              │
│  └── User Profile         → Settings & preferences          │
│                                                              │
│  UI Framework: TailwindCSS (Apple-inspired design)          │
│  State Management: Angular Signals                          │
│  Routing: Angular Router (lazy loading)                     │
└─────────────────────────────────────────────────────────────┘
```

### Backend (Django 5)

```
┌─────────────────────────────────────────────────────────────┐
│  Django 5 + Django REST Framework + Django Channels         │
│                                                              │
│  Apps:                                                       │
│  ├── directory/          → Users, Academic Years, Semesters │
│  ├── school/             → Classes, Departments             │
│  ├── course_api/         → Courses, Meetings, Study Groups  │
│  ├── course_content/     → Materials, Recordings            │
│  └── communication/      → Announcements, Messages, Polls   │
│                                                              │
│  Key Features:                                               │
│  ├── REST API (DRF)      → HTTP endpoints                   │
│  ├── WebSocket (Channels)→ Real-time chat                   │
│  ├── JWT Auth (tokens)   → Stateless authentication         │
│  ├── File Storage        → Media uploads (profile pics)     │
│  ├── Email Service       → Gmail SMTP                       │
│  └── Jitsi Integration   → JWT token generation             │
│                                                              │
│  ASGI Server: Daphne (async support)                        │
│  WSGI Server: Gunicorn (HTTP endpoints)                     │
│  Task Queue: Django Channels (WebSocket)                    │
│  Cache: Redis (sessions, WebSocket channels)                │
└─────────────────────────────────────────────────────────────┘
```

---

## Communication Flow

### 1. User Login Flow

```
User Browser
    │
    │ 1. POST /api/auth/login (email, password)
    ▼
Nginx (HTTPS)
    │
    │ 2. Proxy to backend:8080
    ▼
Django Backend
    │
    │ 3. Validate credentials
    │ 4. Generate JWT token
    ▼
PostgreSQL
    │
    │ 5. Fetch user data
    ▼
Django Backend
    │
    │ 6. Return {token, user, ...}
    ▼
User Browser
    │
    │ 7. Store token in localStorage
    │ 8. Redirect to dashboard
    ▼
Angular App (Authenticated)
```

### 2. Real-Time Chat Flow (WebSocket)

```
User A                          Backend                      User B
  │                               │                             │
  │ 1. WS connect                 │                             │
  │  /ws/study-groups/1/?token=.. │                             │
  ├──────────────────────────────►│                             │
  │                               │ 2. Validate JWT             │
  │                               │ 3. Add to room channel      │
  │                               │                             │
  │                               │◄────────────────────────────┤
  │                               │    WS connect               │
  │                               │    /ws/study-groups/1/      │
  │                               │                             │
  │ 4. Send message               │                             │
  │  {type: 'message', body: ...} │                             │
  ├──────────────────────────────►│                             │
  │                               │ 5. Save to PostgreSQL       │
  │                               │ 6. Broadcast via Redis      │
  │                               │    channel layer            │
  │◄──────────────────────────────┤                             │
  │    Message confirmation       │                             │
  │                               ├────────────────────────────►│
  │                               │    Broadcast message        │
  │                               │                             │
```

### 3. Video Call Flow (Jitsi Integration)

```
User                     Backend                    Jitsi Server
  │                        │                            │
  │ 1. GET /api/meetings/  │                            │
  ├───────────────────────►│                            │
  │                        │ 2. Fetch meeting details   │
  │                        │ 3. Generate JWT token      │
  │                        │    (JITSI_PRIVATE_KEY)     │
  │◄───────────────────────┤                            │
  │    {meeting_url,       │                            │
  │     jwt_token, ...}    │                            │
  │                        │                            │
  │ 4. Open Jitsi meeting  │                            │
  │    with JWT token      │                            │
  ├────────────────────────┼───────────────────────────►│
  │                        │                            │ 5. Validate JWT
  │                        │                            │ 6. Join conference
  │◄───────────────────────┼────────────────────────────┤
  │    WebRTC media streams (P2P or via JVB)            │
  │                                                      │
```

### 4. Static/Media File Delivery

```
User Browser
    │
    │ GET /media/profiles/user.jpg
    ▼
Nginx
    │
    │ Check /var/www/media/
    │
    ├── File exists? ────YES───► Serve directly (cached, 7 days)
    │
    └── File missing? ──NO────► Return 404
```

---

## Data Flow

### Database Schema (Simplified)

```
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
│                                                              │
│  Core Tables:                                                │
│  ├── directory_user              (Users, auth, profiles)    │
│  ├── directory_academicyear      (2025/2026, etc.)          │
│  ├── directory_semester          (Sem 1, 2, Summer)         │
│  ├── school_class                (CS-2021, etc.)            │
│  │                                                           │
│  ├── course_api_course           (Course metadata)          │
│  ├── course_api_timetableentry   (Weekly schedule)          │
│  ├── course_api_meeting          (Jitsi meetings)           │
│  │                                                           │
│  ├── course_api_studygroup       (Study groups)             │
│  ├── course_api_studygroupmembership                        │
│  ├── course_api_groupmessage     (Chat history)             │
│  │                                                           │
│  ├── course_content_coursecontent (Materials, recordings)   │
│  │                                                           │
│  └── communication_announcement  (Class announcements)       │
└─────────────────────────────────────────────────────────────┘
```

### Redis Data Structures

```
┌─────────────────────────────────────────────────────────────┐
│  Redis (Cache & Channel Layer)                              │
│                                                              │
│  Channels:                                                   │
│  ├── asgi:group:study_group_1    → WebSocket room channels  │
│  ├── asgi:group:study_group_2                               │
│  └── ...                                                     │
│                                                              │
│  Sessions:                                                   │
│  ├── session:abc123              → User session data        │
│  └── ...                                                     │
│                                                              │
│  Cache:                                                      │
│  ├── user:profile:1              → User profile cache       │
│  ├── course:timeline:5           → Course content cache     │
│  └── ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Security & SSL

### SSL/TLS Configuration

```
┌─────────────────────────────────────────────────────────────┐
│  SSL/TLS Setup (Let's Encrypt)                              │
│                                                              │
│  Certificate Authority: Let's Encrypt                       │
│  Certificate Location: /etc/letsencrypt/live/               │
│  Protocols: TLSv1.2, TLSv1.3                                │
│  Ciphers: HIGH:!aNULL:!MD5                                  │
│                                                              │
│  Auto-Renewal:                                               │
│  └── Certbot container runs every 12 hours                  │
│      ├── Checks certificate expiry                          │
│      ├── Renews if < 30 days remaining                      │
│      └── Reloads Nginx on success                           │
│                                                              │
│  HTTP → HTTPS Redirect: Yes (301 Permanent)                 │
│  HSTS: Enabled (recommended)                                │
└─────────────────────────────────────────────────────────────┘
```

### Authentication & Authorization

```
┌─────────────────────────────────────────────────────────────┐
│  Security Layers                                             │
│                                                              │
│  1. JWT Token Authentication                                 │
│     ├── Token in Authorization: Bearer <token>              │
│     ├── Stored in localStorage (frontend)                   │
│     └── Expiry: Configurable (default 24h)                  │
│                                                              │
│  2. WebSocket Authentication                                 │
│     ├── Token in query param: ?token=<jwt>                  │
│     └── Validated before connection accept                  │
│                                                              │
│  3. Jitsi JWT (Separate)                                     │
│     ├── Short-lived token (1 hour)                          │
│     ├── Signed with JITSI_PRIVATE_KEY                       │
│     └── Validated by Prosody (Jitsi)                        │
│                                                              │
│  4. CORS Protection                                          │
│     ├── Allowed Origins: co.riverlearn.co.ke,               │
│     │                    jitsi.riverlearn.co.ke             │
│     └── Credentials: Allowed                                │
│                                                              │
│  5. CSRF Protection                                          │
│     ├── Django CSRF middleware                              │
│     ├── Trusted Origins: co.riverlearn.co.ke                │
│     └── Token in cookie + header                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### File Structure on GCE VM

```
/opt/course-organizer/
├── backend/
│   ├── course_api/
│   ├── course_content/
│   ├── communication/
│   ├── directory/
│   ├── school/
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── dist/             → Built Angular app
│   ├── src/
│   └── package.json
├── docker-compose.gce.yml
├── docker-compose.gce.env
├── Dockerfile.gce
├── nginx.gce.conf
├── ssl/
│   └── (SSL certificates via Let's Encrypt)
└── media/
    └── profiles/         → User profile pictures
```

### Docker Volumes

```
Volume Name              Purpose                    Mount Point
─────────────────────────────────────────────────────────────────
static_files             Django static files        /app/static (backend)
                                                    /var/www/static (nginx)

media_files              User uploads               /app/media (backend)
                                                    /var/www/media (nginx)

pg_data                  PostgreSQL data            /var/lib/postgresql/data

db_data                  SQLite backup              /app/db (if not using Postgres)

certbot-webroot          ACME challenge files       /var/www/certbot

letsencrypt              SSL certificates           /etc/letsencrypt
```

### Environment Variables

```
Key Variables (docker-compose.gce.env):
├── SECRET_KEY                    → Django secret
├── DATABASE_URL                  → postgres://...
├── ALLOWED_HOSTS                 → co.riverlearn.co.ke,...
├── CORS_ALLOWED_ORIGINS          → https://co.riverlearn.co.ke
├── EMAIL_HOST_USER               → noreply@riverlearn.co.ke
├── EMAIL_HOST_PASSWORD           → Gmail app password
├── JITSI_DOMAIN                  → jitsi.riverlearn.co.ke
├── JITSI_PRIVATE_KEY             → Base64 encoded private key
├── JITSI_PUBLIC_KEY              → Base64 encoded public key
└── ADMIN_PASSWORD                → Bootstrap admin password
```

---

## Network Topology

```
                    Internet
                       │
                       │
           ┌───────────┴──────────────┐
           │                          │
           │   Google Cloud Load      │
           │   Balancer (Optional)    │
           │                          │
           └───────────┬──────────────┘
                       │
         ┌─────────────┴─────────────────┐
         │                               │
         ▼                               ▼
┌────────────────────┐          ┌────────────────────┐
│  GCE VM #1         │          │  GCE VM #2         │
│  34.121.171.1      │          │  Jitsi Server      │
│                    │          │                    │
│  Port Mapping:     │          │  Port Mapping:     │
│  ├── 80  → Nginx   │          │  ├── 80  → HTTP    │
│  ├── 443 → Nginx   │          │  ├── 443 → HTTPS   │
│  └── 8080→ Backend │          │  ├── 10000→ JVB UDP│
│                    │          │  └── 4443 → JVB TCP│
└────────────────────┘          └────────────────────┘
         │                               │
         │                               │
    Docker Bridge                   Docker Bridge
    Network (internal)              Network (internal)
```

---

## Monitoring & Logging

### Health Checks

```
Service          Endpoint              Interval    Timeout
─────────────────────────────────────────────────────────────
Nginx            /health               30s         10s
Backend          /api/                 30s         10s
PostgreSQL       pg_isready            10s         5s
Redis            redis-cli ping        10s         3s
```

### Logs

```
Component        Log Location                     Level
──────────────────────────────────────────────────────────────
Nginx            /var/log/nginx/access.log       INFO
                 /var/log/nginx/error.log        WARN/ERROR

Django           stdout (Docker logs)             INFO/DEBUG
                 backend/debug.log                DEBUG

PostgreSQL       stdout (Docker logs)             WARN/ERROR

Redis            stdout (Docker logs)             WARN/ERROR

Gunicorn         stdout (Docker logs)             INFO

Daphne           stdout (Docker logs)             INFO
```

---

## Performance Optimization

### Caching Strategy

```
Layer            Cache Type          Duration    Invalidation
────────────────────────────────────────────────────────────────
Static Files     Nginx + Browser     30 days     On deploy
Media Files      Nginx + Browser     7 days      Never (immutable)
API Responses    Redis               5-60 min    On data change
User Sessions    Redis               24 hours    On logout
Database Queries Django ORM          Per-request N/A
```

### WebSocket Scaling

```
Current: Single backend instance with Redis channel layer
Future:  Multiple backend instances + Redis Pub/Sub
         (Horizontal scaling ready)
```

---

## Backup Strategy

### Database Backups

```
Method: pg_dump via cron job
Frequency: Daily at 2:00 AM
Retention: 7 days rolling
Storage: GCS bucket (recommended)
```

### Media Backups

```
Method: rsync or gsutil
Frequency: Weekly
Storage: GCS bucket
```

---

## Technology Stack Summary

| Layer          | Technology                    | Version    |
|----------------|-------------------------------|------------|
| Frontend       | Angular                       | 20.2.0     |
| UI Framework   | TailwindCSS                   | 4.1.13     |
| Backend        | Django                        | 5.x        |
| API Framework  | Django REST Framework         | Latest     |
| WebSocket      | Django Channels               | Latest     |
| Web Server     | Nginx                         | Alpine     |
| App Server     | Gunicorn + Daphne             | Latest     |
| Database       | PostgreSQL                    | 15         |
| Cache/Queue    | Redis                         | 7-alpine   |
| Video Platform | Jitsi Meet (self-hosted)      | Latest     |
| Container      | Docker + Docker Compose       | Latest     |
| SSL/TLS        | Let's Encrypt (Certbot)       | Latest     |
| Cloud Provider | Google Compute Engine         | -          |
| Email          | Gmail SMTP (Google Workspace) | -          |

---

## Scaling Considerations

### Current Capacity

The current single-VM architecture can comfortably handle:
- **0-500 concurrent users**
- **~2,000 total registered users**
- **~50 requests/second**
- **~300 WebSocket connections**
- **~50 concurrent video calls**

### When to Scale

| User Threshold | Required Action | Estimated Cost |
|----------------|----------------|----------------|
| **400+ concurrent** | Add database indexes + Redis caching | +$0 |
| **500-2K concurrent** | Cloud Storage + CDN + VM upgrade | +$200/month |
| **2K-10K concurrent** | Load balancer + Cloud SQL + Auto-scaling | +$1,500/month |
| **10K-50K concurrent** | Kubernetes + Multi-region + Sharding | +$5,000/month |

**📊 For detailed scaling strategies, see [SCALING_GUIDE.md](./SCALING_GUIDE.md)**

---

## Future Enhancements

1. **CDN Integration** - CloudFlare or Google CDN for static assets
2. **Object Storage** - Google Cloud Storage for media files
3. **Load Balancer** - GCP Load Balancer for high availability
4. **Auto-scaling** - Kubernetes deployment for horizontal scaling
5. **Monitoring** - Prometheus + Grafana for metrics
6. **Logging** - ELK Stack (Elasticsearch, Logstash, Kibana)
7. **CI/CD** - GitHub Actions for automated deployments
8. **Mobile App** - Progressive Web App (PWA) or native apps

---

## Contact & Support

- **Documentation**: `/README.md`, `/GCE_DEPLOYMENT.md`
- **Deployment Guide**: `/DEPLOYMENT_TEMPLATE.md`
- **Troubleshooting**: `/TROUBLESHOOTING.md`
- **Domain**: riverlearn.co.ke
- **Main App**: https://co.riverlearn.co.ke
- **Video Platform**: https://jitsi.riverlearn.co.ke

---

*Generated: January 2025*  
*Architecture Version: 2.0*

