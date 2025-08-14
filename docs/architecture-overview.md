# Architecture Overview

## System Design Principles

### Microservices Architecture
- **Service Isolation**: Each service owns its data and domain logic
- **API Gateway Pattern**: Single entry point for all client requests
- **Event-Driven Communication**: Services communicate via message queues
- **Database per Service**: Each microservice has its own database

### Scalability Design
- **Horizontal Scaling**: All services designed for horizontal scaling
- **Load Balancing**: NGINX for distributing traffic
- **Caching Layers**: Multi-level caching (Memory, Redis, CDN)
- **Async Processing**: Background jobs for heavy operations

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Applications                       │
│         (iOS App)        (Android App)       (Web Admin)    │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                      Cloudflare CDN                          │
│              (DDoS Protection, Static Assets)                │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                    NGINX Load Balancer                       │
│                  (SSL, Rate Limiting, Routing)               │
└──────────┬──────────────────┴──────────────────┬────────────┘
           │                                     │
┌──────────┴──────────┐              ┌──────────┴──────────┐
│   API Gateway       │              │  WebSocket Gateway  │
│   (Kong/Express)    │              │   (Socket.io)       │
└──────────┬──────────┘              └──────────┬──────────┘
           │                                     │
┌──────────┴─────────────────────────────────────┴────────────┐
│                     Microservices Layer                      │
├───────────────────────────────────────────────────────────────┤
│  Auth  │  User  │ Matching │  Chat  │ Payment │   Media     │
│ Service│Service │ Service  │Service │ Service │  Service    │
└────┬────────┬────────┬─────────┬────────┬─────────┬────────┘
     │        │        │         │        │         │
┌────┴────────┴────────┴─────────┴────────┴─────────┴────────┐
│                      Message Queue                           │
│                   (RabbitMQ / Kafka)                        │
└───────────────────────────────────────────────────────────────┘
     │        │        │         │        │         │
┌────┴────────┴────────┴─────────┴────────┴─────────┴────────┐
│                      Data Layer                              │
├───────────────────────────────────────────────────────────────┤
│ PostgreSQL │ MongoDB │ Redis │ Elasticsearch │ S3 Storage   │
└───────────────────────────────────────────────────────────────┘
```

## Service Breakdown

### Core Services

#### Auth Service
- **Responsibilities**: Authentication, authorization, token management
- **Database**: PostgreSQL (users, sessions)
- **Key Features**: JWT tokens, OAuth, MFA, device tracking
- **Port**: 3001

#### User Service
- **Responsibilities**: Profile management, preferences, settings
- **Database**: PostgreSQL (profiles, preferences)
- **Key Features**: Profile CRUD, verification, scoring
- **Port**: 3002

#### Matching Service
- **Responsibilities**: Compatibility algorithm, queue management, swipes
- **Database**: PostgreSQL (swipes, matches, queues)
- **Cache**: Redis (active queues, recommendations)
- **Key Features**: ML-based matching, daily limits, queue system
- **Port**: 3003

#### Chat Service
- **Responsibilities**: Real-time messaging, conversation management
- **Database**: MongoDB (messages, conversations)
- **Cache**: Redis (active connections, unread counts)
- **Key Features**: WebSocket communication, encryption, read receipts
- **Port**: 3004

#### Payment Service
- **Responsibilities**: Subscription management, payment processing
- **Database**: PostgreSQL (subscriptions, transactions)
- **Key Features**: Razorpay integration, webhooks, invoicing
- **Port**: 3005

#### Media Service
- **Responsibilities**: File uploads, image processing, CDN management
- **Storage**: S3/Cloudflare R2
- **Cache**: CloudFront CDN
- **Key Features**: Image optimization, video processing, verification
- **Port**: 3006

### Support Services

#### Notification Service
- **Responsibilities**: Push notifications, emails, SMS
- **Queue**: RabbitMQ for async processing
- **Integrations**: FCM, SendGrid, Twilio

#### Analytics Service
- **Responsibilities**: User behavior tracking, metrics collection
- **Database**: ClickHouse for time-series data
- **Tools**: Mixpanel, Amplitude integration

#### Admin Service
- **Responsibilities**: Dashboard, moderation, support tools
- **Framework**: Next.js for server-side rendering

## Communication Patterns

### Synchronous Communication
- REST APIs for client-server communication
- gRPC for internal service-to-service calls
- GraphQL gateway for flexible querying (optional)

### Asynchronous Communication
- RabbitMQ for event-driven architecture
- Redis Pub/Sub for real-time updates
- Bull MQ for job processing

### Event Flow Examples

#### New Match Creation
```
1. User swipes right → Matching Service
2. Matching Service checks mutual interest
3. If match: Publish "match.created" event
4. Notification Service → Send push notifications
5. Chat Service → Create conversation room
6. Analytics Service → Track conversion
```

#### Message Sending
```
1. User sends message → WebSocket Gateway
2. Gateway authenticates → Chat Service
3. Chat Service stores in MongoDB
4. Publish to Redis Pub/Sub
5. Deliver to recipient via WebSocket
6. Update read receipts asynchronously
```

## Data Flow Architecture

### Read Path
```
Client → CDN (cached) → API Gateway → Service → Redis Cache → Database
```

### Write Path
```
Client → API Gateway → Service → Database → Invalidate Cache → Event Bus
```

### Real-time Path
```
Client → WebSocket Gateway → Redis Pub/Sub → Connected Clients
```

## Deployment Architecture

### Container Orchestration
```yaml
Kubernetes Cluster:
├── Namespaces
│   ├── production
│   ├── staging
│   └── monitoring
├── Deployments
│   ├── api-gateway (3 replicas)
│   ├── auth-service (2 replicas)
│   ├── user-service (2 replicas)
│   ├── matching-service (3 replicas)
│   ├── chat-service (4 replicas)
│   └── payment-service (2 replicas)
├── Services
│   ├── LoadBalancer services
│   └── ClusterIP services
└── ConfigMaps & Secrets
```

### Multi-Region Strategy
- **Primary Region**: Mumbai (ap-south-1)
- **DR Region**: Singapore (ap-southeast-1)
- **Database Replication**: Cross-region read replicas
- **CDN**: Global edge locations

## Security Architecture

### Network Security
- VPC with private subnets for services
- Public subnet only for load balancers
- Security groups and NACLs
- WAF rules on CloudFront

### Application Security
- OAuth 2.0 for authentication
- JWT with refresh token rotation
- API rate limiting per user
- Input validation and sanitization
- SQL injection prevention via ORMs

### Data Security
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.3)
- Field-level encryption for PII
- Regular security audits
- GDPR compliance measures

## Performance Targets

### Response Times
- API Gateway: < 10ms overhead
- Service Response: < 100ms p50, < 500ms p99
- Database Query: < 50ms p95
- Cache Hit: < 5ms
- WebSocket Latency: < 200ms

### Throughput
- API Gateway: 50,000 req/sec
- Matching Service: 5,000 swipes/sec
- Chat Service: 10,000 messages/sec
- Media Service: 1,000 uploads/min

### Availability
- Overall SLA: 99.95%
- Database: 99.99%
- Cache Layer: 99.9%
- CDN: 99.99%

## Monitoring & Observability

### Metrics Collection
- **Prometheus**: Service metrics
- **Grafana**: Visualization dashboards
- **CloudWatch**: AWS resource metrics

### Logging
- **ELK Stack**: Centralized logging
- **Structured Logging**: JSON format
- **Log Levels**: ERROR, WARN, INFO, DEBUG

### Tracing
- **OpenTelemetry**: Distributed tracing
- **Jaeger**: Trace visualization
- **Correlation IDs**: Request tracking

### Alerting
- **PagerDuty**: Incident management
- **Slack**: Team notifications
- **Custom Thresholds**: Business metrics

## Disaster Recovery

### Backup Strategy
- **Database**: Daily automated backups, 30-day retention
- **Media Files**: S3 versioning and replication
- **Configuration**: Git repository backups

### Recovery Objectives
- **RTO**: 2 hours
- **RPO**: 1 hour
- **Failover Time**: < 5 minutes

### DR Procedures
1. Automated health checks
2. Automatic failover for stateless services
3. Manual database failover with verification
4. DNS update for region switch
5. Cache warming procedures

## Cost Optimization

### Resource Optimization
- Auto-scaling based on metrics
- Spot instances for batch jobs
- Reserved instances for baseline load
- Scheduled scaling for predictable patterns

### Data Transfer Optimization
- CloudFront caching for static assets
- Compression for API responses
- Batch operations where possible
- Regional data locality

### Storage Optimization
- Lifecycle policies for old data
- Compression for logs and archives
- Efficient indexing strategies
- Cold storage for inactive users