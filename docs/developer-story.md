# Pairity - Developer Story & Technical Architecture

## Executive Summary
Building a scalable, real-time dating platform with React Native mobile apps, Express.js microservices backend, PostgreSQL for relational data, Redis for caching/sessions, and MongoDB for chat messages. The architecture supports 1M+ concurrent users with <100ms response times.

---

## Tech Stack Selection

### Frontend
- **React Native** 0.73+ - Cross-platform mobile development
- **Expo SDK 50** - Managed workflow for faster development
- **React Navigation 6** - Navigation framework
- **Redux Toolkit + RTK Query** - State management and API caching
- **React Hook Form** - Form handling with validation
- **Socket.io Client** - Real-time communication
- **React Native Reanimated 3** - Smooth animations
- **React Native MMKV** - Fast encrypted storage

### Backend
- **Node.js 20 LTS** - JavaScript runtime
- **Express.js 4.19** - Web framework
- **TypeScript 5.3** - Type safety
- **Socket.io** - WebSocket for real-time features
- **Bull MQ** - Job queues with Redis
- **Prisma ORM** - Database abstraction
- **Passport.js** - Authentication strategies

### Databases
- **PostgreSQL 16** - Primary relational database (users, profiles, matches)
- **MongoDB 7** - Chat messages and activity logs
- **Redis 7** - Caching, sessions, real-time data
- **Elasticsearch 8** - Full-text search for profiles
- **S3-Compatible Storage** - Media files (Cloudflare R2/AWS S3)

### Infrastructure
- **Docker & Kubernetes** - Containerization and orchestration
- **NGINX** - Load balancer and reverse proxy
- **Cloudflare** - CDN and DDoS protection
- **GitHub Actions** - CI/CD pipeline
- **Prometheus + Grafana** - Monitoring
- **Sentry** - Error tracking

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Cloudflare CDN                        │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────┴───────────────────────────────┐
│                     NGINX Load Balancer                      │
│                    (SSL Termination, Rate Limiting)          │
└─────────────┬───────────────────────────┬───────────────────┘
              │                           │
┌─────────────┴────────────┐ ┌───────────┴───────────────────┐
│     API Gateway          │ │     WebSocket Gateway         │
│   (Kong/Express Gateway) │ │    (Socket.io Cluster)        │
└─────────────┬────────────┘ └───────────┬───────────────────┘
              │                           │
┌─────────────┴────────────────────────────┴──────────────────┐
│                      Microservices Layer                     │
├───────────────────────────────────────────────────────────────┤
│ • Auth Service        • Matching Service   • Chat Service    │
│ • User Service        • Payment Service    • Media Service   │
│ • Profile Service     • Notification Service                 │
└───────────────────────────────────────────────────────────────┘
              │
┌─────────────┴────────────────────────────────────────────────┐
│                        Data Layer                             │
├───────────────────────────────────────────────────────────────┤
│ PostgreSQL │ MongoDB │ Redis │ Elasticsearch │ S3 Storage    │
└───────────────────────────────────────────────────────────────┘
```

---

## Project Structure

### Monorepo Structure
```
pairity/
├── apps/
│   ├── mobile/                 # React Native app
│   ├── web-admin/              # Admin dashboard (Next.js)
│   └── api/                    # Backend services
├── packages/
│   ├── shared-types/           # TypeScript types
│   ├── ui-components/          # Shared React components
│   ├── utils/                  # Shared utilities
│   └── config/                 # Shared configurations
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   └── terraform/
└── tools/
    ├── scripts/
    └── cli/
```

### Mobile App Structure (React Native)
```
apps/mobile/
├── src/
│   ├── app/                    # App entry points
│   │   ├── _layout.tsx         # Root layout (Expo Router)
│   │   ├── (auth)/             # Auth routes group
│   │   ├── (main)/             # Main app routes
│   │   └── (modal)/            # Modal routes
│   ├── core/
│   │   ├── api/                # API client setup
│   │   │   ├── client.ts
│   │   │   ├── interceptors/
│   │   │   └── endpoints/
│   │   ├── auth/               # Authentication logic
│   │   │   ├── AuthContext.tsx
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   ├── config/             # App configuration
│   │   │   ├── env.ts
│   │   │   └── constants.ts
│   │   └── storage/            # Local storage abstraction
│   │       ├── secure.ts
│   │       └── mmkv.ts
│   ├── features/               # Feature modules
│   │   ├── onboarding/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── matching/
│   │   │   ├── screens/
│   │   │   │   ├── SwipeScreen.tsx
│   │   │   │   └── MatchesScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── SwipeCard.tsx
│   │   │   │   └── MatchModal.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useSwipeGesture.ts
│   │   │   │   └── useMatchQueue.ts
│   │   │   └── store/
│   │   │       └── matchSlice.ts
│   │   ├── chat/
│   │   │   ├── screens/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   │   └── useSocket.ts
│   │   │   └── services/
│   │   ├── profile/
│   │   ├── payment/
│   │   └── settings/
│   ├── shared/
│   │   ├── components/         # Shared components
│   │   │   ├── ui/            # Base UI components
│   │   │   ├── forms/         # Form components
│   │   │   └── feedback/      # Loading, error states
│   │   ├── hooks/             # Shared hooks
│   │   ├── utils/             # Utility functions
│   │   └── styles/            # Theme and styles
│   │       ├── theme.ts
│   │       └── tokens.ts
│   ├── store/                 # Redux store
│   │   ├── index.ts
│   │   ├── rootReducer.ts
│   │   └── middleware/
│   └── types/                 # TypeScript types
│       ├── navigation.ts
│       └── models.ts
├── assets/                    # Images, fonts, etc.
├── app.json                   # Expo configuration
└── package.json
```

### Backend Structure (Express + Microservices)
```
apps/api/
├── services/
│   ├── auth-service/
│   │   ├── src/
│   │   │   ├── app.ts
│   │   │   ├── server.ts
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   └── redis.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   └── verification.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── token.service.ts
│   │   │   │   └── otp.service.ts
│   │   │   ├── repositories/
│   │   │   │   └── user.repository.ts
│   │   │   ├── middlewares/
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   ├── validation.middleware.ts
│   │   │   │   └── rateLimiter.middleware.ts
│   │   │   ├── routes/
│   │   │   │   └── v1/
│   │   │   │       └── auth.routes.ts
│   │   │   ├── validators/
│   │   │   │   └── auth.validator.ts
│   │   │   ├── utils/
│   │   │   ├── types/
│   │   │   └── tests/
│   │   │       ├── unit/
│   │   │       └── integration/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── Dockerfile
│   │   └── package.json
│   ├── user-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── events/
│   │   │       ├── publishers/
│   │   │       └── subscribers/
│   ├── matching-service/
│   │   ├── src/
│   │   │   ├── algorithms/
│   │   │   │   ├── compatibility.ts
│   │   │   │   └── queueManager.ts
│   │   │   ├── jobs/
│   │   │   │   └── dailyMatchJob.ts
│   │   │   └── cache/
│   │   │       └── matchCache.ts
│   ├── chat-service/
│   │   ├── src/
│   │   │   ├── websocket/
│   │   │   │   ├── handlers/
│   │   │   │   └── rooms/
│   │   │   └── database/
│   │   │       └── mongodb.ts
│   ├── payment-service/
│   │   ├── src/
│   │   │   ├── providers/
│   │   │   │   ├── razorpay.ts
│   │   │   │   └── stripe.ts
│   │   │   └── webhooks/
│   ├── notification-service/
│   │   ├── src/
│   │   │   ├── channels/
│   │   │   │   ├── push.ts
│   │   │   │   ├── email.ts
│   │   │   │   └── sms.ts
│   │   │   └── templates/
│   └── media-service/
│       ├── src/
│       │   ├── upload/
│       │   ├── processing/
│       │   │   └── imageOptimizer.ts
│       │   └── storage/
│       │       └── s3Client.ts
├── shared/
│   ├── database/
│   │   ├── prisma/
│   │   └── mongodb/
│   ├── messaging/
│   │   ├── rabbitmq/
│   │   └── kafka/
│   ├── cache/
│   │   └── redis/
│   ├── logger/
│   ├── monitoring/
│   └── errors/
├── gateway/
│   ├── src/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── loadBalancer/
└── docker-compose.yml
```

---

## Database Schema (PostgreSQL)

```sql
-- Users table (core user data)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    subscription_status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    subscription_tier ENUM('free', 'premium') NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    waitlist_position INT,
    referred_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Profiles table (detailed user information)
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    birth_date DATE NOT NULL,
    height INT,
    education_level VARCHAR(50),
    occupation VARCHAR(100),
    company VARCHAR(100),
    income_range VARCHAR(50),
    religion VARCHAR(50),
    languages TEXT[],
    hometown VARCHAR(100),
    drinking_habit VARCHAR(50),
    smoking_habit VARCHAR(50),
    diet_preference VARCHAR(50),
    relationship_goal VARCHAR(50),
    children_preference VARCHAR(50),
    political_view VARCHAR(50),
    zodiac_sign VARCHAR(20),
    personality_type VARCHAR(10),
    interests TEXT[],
    spotify_artists TEXT[],
    instagram_handle VARCHAR(100),
    verification_status ENUM('none', 'photo', 'id', 'full') DEFAULT 'none',
    profile_completion_score INT DEFAULT 0,
    attractiveness_score DECIMAL(3,2),
    response_rate DECIMAL(3,2),
    response_time_avg INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media table (photos, videos, voice)
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    media_type ENUM('photo', 'video', 'voice') NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    order_index INT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Swipes table (user actions)
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID REFERENCES users(id) ON DELETE CASCADE,
    action ENUM('like', 'superlike', 'pass') NOT NULL,
    is_seen BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(swiper_id, swiped_id)
);

-- Matches table
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_score DECIMAL(3,2),
    is_active BOOLEAN DEFAULT true,
    last_interaction_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unmatched_at TIMESTAMP,
    unmatched_by UUID REFERENCES users(id),
    UNIQUE(user1_id, user2_id)
);

-- Daily queues table (controlled distribution)
CREATE TABLE daily_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    queue_date DATE NOT NULL,
    priority_score DECIMAL(5,2),
    compatibility_score DECIMAL(3,2),
    is_shown BOOLEAN DEFAULT false,
    shown_at TIMESTAMP,
    action_taken VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_user_id, queue_date)
);

-- Subscriptions table
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL,
    payment_method VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    status ENUM('active', 'cancelled', 'expired', 'pending') NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    payment_provider VARCHAR(50),
    payment_id VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_users_gender_subscription ON users(gender, subscription_status);
CREATE INDEX idx_users_last_active ON users(last_active_at);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_swipes_swiper_swiped ON swipes(swiper_id, swiped_id);
CREATE INDEX idx_swipes_created ON swipes(created_at);
CREATE INDEX idx_matches_users ON matches(user1_id, user2_id);
CREATE INDEX idx_matches_active ON matches(is_active);
CREATE INDEX idx_daily_queues_user_date ON daily_queues(user_id, queue_date);
CREATE INDEX idx_media_user ON media(user_id);
```

---

## API Design

### RESTful Endpoints

```typescript
// Auth Service
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/verify-otp
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

// User Service
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
DELETE /api/v1/users/account
POST   /api/v1/users/verify-identity
GET    /api/v1/users/settings
PUT    /api/v1/users/settings

// Matching Service
GET    /api/v1/matching/daily-queue
POST   /api/v1/matching/swipe
GET    /api/v1/matching/matches
DELETE /api/v1/matching/matches/:matchId
GET    /api/v1/matching/likes-received
POST   /api/v1/matching/superlike

// Chat Service
GET    /api/v1/chat/conversations
GET    /api/v1/chat/conversations/:matchId
POST   /api/v1/chat/messages
PUT    /api/v1/chat/messages/:messageId
DELETE /api/v1/chat/messages/:messageId
POST   /api/v1/chat/read-receipt

// Payment Service
POST   /api/v1/payments/create-order
POST   /api/v1/payments/verify
GET    /api/v1/payments/history
POST   /api/v1/payments/cancel-subscription

// Media Service
POST   /api/v1/media/upload
DELETE /api/v1/media/:mediaId
POST   /api/v1/media/verify-photo
GET    /api/v1/media/signed-url
```

### WebSocket Events

```typescript
// Connection events
socket.on('connect')
socket.on('disconnect')
socket.on('reconnect')

// Chat events
socket.emit('join-room', { matchId })
socket.emit('leave-room', { matchId })
socket.emit('message', { matchId, content, type })
socket.emit('typing', { matchId, isTyping })
socket.on('new-message', callback)
socket.on('message-delivered', callback)
socket.on('message-read', callback)
socket.on('user-typing', callback)

// Real-time notifications
socket.on('new-match', callback)
socket.on('new-like', callback)
socket.on('profile-visitor', callback)
```

---

## Development Workflow

### Sprint 1: Foundation (Week 1-2)
```typescript
// Developer Story 1.1: Setup Development Environment
As a developer
I want to setup the monorepo with all tooling
So that the team can start development

Tasks:
- Initialize monorepo with Turborepo
- Setup TypeScript configuration
- Configure ESLint and Prettier
- Setup Git hooks with Husky
- Configure Docker environments
- Setup CI/CD pipeline base

// Developer Story 1.2: Database Setup
As a developer
I want to setup all databases with migrations
So that we have a solid data foundation

Tasks:
- Setup PostgreSQL with Prisma
- Configure MongoDB connection
- Setup Redis cluster
- Create migration scripts
- Setup seed data scripts
```

### Sprint 2: Authentication (Week 3-4)
```typescript
// Developer Story 2.1: JWT Authentication
As a developer
I want to implement secure JWT authentication
So that users can safely access the platform

Tasks:
- Implement JWT token generation
- Setup refresh token rotation
- Implement device tracking
- Add rate limiting
- Setup OTP verification

// Developer Story 2.2: OAuth Integration
As a developer
I want to integrate social logins
So that users have multiple auth options

Tasks:
- Google OAuth integration
- Apple Sign In
- Facebook Login (optional)
- Account linking logic
```

### Sprint 3: Core Features (Week 5-8)
```typescript
// Developer Story 3.1: Matching Algorithm
As a developer
I want to implement the compatibility algorithm
So that users get quality matches

Tasks:
- Build ML model for compatibility scoring
- Implement daily queue generation
- Create swipe processing logic
- Build match creation system
- Implement match expiry jobs

// Developer Story 3.2: Real-time Chat
As a developer
I want to implement scalable chat system
So that matched users can communicate

Tasks:
- Setup Socket.io with Redis adapter
- Implement message delivery system
- Add read receipts
- Build typing indicators
- Setup message encryption
```

### Sprint 4: Payment Integration (Week 9-10)
```typescript
// Developer Story 4.1: Payment Gateway
As a developer
I want to integrate payment processing
So that we can handle subscriptions

Tasks:
- Razorpay integration
- Webhook handling
- Subscription management
- Payment retry logic
- Invoice generation
```

---

## Performance Optimization

### Database Optimization
```typescript
// Connection pooling
const pool = new Pool({
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Query optimization with indexes
CREATE INDEX CONCURRENTLY idx_users_location 
ON users USING GIST (location);

// Partitioning for large tables
CREATE TABLE messages_2024_01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
```

### Caching Strategy
```typescript
// Multi-level caching
class CacheService {
  private memoryCache: NodeCache;
  private redisCache: Redis;
  
  async get(key: string): Promise<any> {
    // L1: Memory cache (10ms)
    const memResult = this.memoryCache.get(key);
    if (memResult) return memResult;
    
    // L2: Redis cache (50ms)
    const redisResult = await this.redisCache.get(key);
    if (redisResult) {
      this.memoryCache.set(key, redisResult);
      return redisResult;
    }
    
    // L3: Database (200ms)
    const dbResult = await this.fetchFromDB(key);
    await this.setMultiLevel(key, dbResult);
    return dbResult;
  }
}
```

### API Response Optimization
```typescript
// GraphQL-like field selection
GET /api/v1/users/profile?fields=id,name,photos,bio

// Pagination with cursor
GET /api/v1/matches?cursor=eyJpZCI6MTIzfQ&limit=20

// Response compression
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));
```

---

## Security Implementation

### Authentication & Authorization
```typescript
// Multi-factor authentication
class MFAService {
  async generateTOTP(secret: string): Promise<string> {
    return speakeasy.totp({
      secret,
      encoding: 'base32',
      window: 2
    });
  }
  
  async verifyTOTP(token: string, secret: string): Promise<boolean> {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2
    });
  }
}

// Role-based access control
const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

### Data Protection
```typescript
// Field-level encryption
class EncryptionService {
  private algorithm = 'aes-256-gcm';
  
  encrypt(text: string): EncryptedData {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      this.algorithm, 
      this.key, 
      iv
    );
    
    const encrypted = Buffer.concat([
      cipher.update(text, 'utf8'),
      cipher.final()
    ]);
    
    return {
      encrypted: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: cipher.getAuthTag().toString('base64')
    };
  }
}

// PII data masking
class DataMasking {
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    return `${local[0]}***@${domain}`;
  }
  
  maskPhone(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{3})/, '$1****$2');
  }
}
```

---

## Testing Strategy

### Unit Testing
```typescript
// Jest configuration
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};

// Example test
describe('MatchingService', () => {
  let matchingService: MatchingService;
  
  beforeEach(() => {
    matchingService = new MatchingService();
  });
  
  describe('calculateCompatibility', () => {
    it('should return high score for similar interests', async () => {
      const user1 = createMockUser({ interests: ['music', 'travel'] });
      const user2 = createMockUser({ interests: ['music', 'travel'] });
      
      const score = await matchingService.calculateCompatibility(user1, user2);
      
      expect(score).toBeGreaterThan(0.8);
    });
  });
});
```

### Integration Testing
```typescript
// Supertest for API testing
describe('POST /api/v1/auth/register', () => {
  it('should create a new user with valid data', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        gender: 'male',
        birthDate: '1995-01-01'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user.email).toBe('test@example.com');
  });
});
```

### E2E Testing
```typescript
// Detox configuration for React Native
describe('Matching Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginAsTestUser();
  });
  
  it('should show daily queue and allow swiping', async () => {
    await element(by.id('tab-discover')).tap();
    await expect(element(by.id('swipe-card'))).toBeVisible();
    
    await element(by.id('swipe-card')).swipe('right');
    await expect(element(by.id('match-modal'))).toBeVisible();
  });
});
```

---

## DevOps & Deployment

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test:ci
      - run: npm run lint
      - run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build Docker images
        run: |
          docker build -t pairity/api:${{ github.sha }} ./apps/api
          docker build -t pairity/mobile:${{ github.sha }} ./apps/mobile
      - name: Push to registry
        run: |
          docker push pairity/api:${{ github.sha }}
          docker push pairity/mobile:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api api=pairity/api:${{ github.sha }}
          kubectl rollout status deployment/api
```

### Kubernetes Configuration
```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: pairity/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: redis-secret
              key: url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

### Monitoring & Observability
```typescript
// Prometheus metrics
import { register, Counter, Histogram } from 'prom-client';

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code']
});

const matchesCreated = new Counter({
  name: 'matches_created_total',
  help: 'Total number of matches created'
});

// OpenTelemetry tracing
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('matching-service');

async function processSwipe(userId: string, targetId: string, action: string) {
  const span = tracer.startSpan('process-swipe');
  
  try {
    span.setAttributes({
      'user.id': userId,
      'target.id': targetId,
      'swipe.action': action
    });
    
    // Process swipe logic
    const result = await swipeRepository.create({ userId, targetId, action });
    
    if (result.isMatch) {
      matchesCreated.inc();
      span.addEvent('match-created');
    }
    
    return result;
  } finally {
    span.end();
  }
}
```

---

## Performance Metrics & SLAs

### Target Metrics
- **API Response Time**: p50 < 100ms, p99 < 500ms
- **Matching Algorithm**: < 50ms per calculation
- **Chat Message Delivery**: < 200ms end-to-end
- **Image Upload**: < 3 seconds for 5MB file
- **Database Query Time**: p95 < 50ms
- **Cache Hit Rate**: > 85%
- **WebSocket Connection Success**: > 99.5%

### Scalability Targets
- **Concurrent Users**: 100,000+
- **Messages per Second**: 10,000+
- **Swipes per Second**: 5,000+
- **Daily Active Users**: 1,000,000+
- **Storage Growth**: 1TB/month
- **Bandwidth**: 100TB/month

---

## Cost Optimization

### Infrastructure Costs (Monthly Estimate)
```
AWS/GCP/Azure:
- Kubernetes Cluster (3 nodes): $300
- RDS PostgreSQL (db.t3.large): $150
- ElastiCache Redis: $100
- MongoDB Atlas: $200
- S3 Storage (10TB): $230
- CloudFront CDN: $100
- Load Balancer: $25
- Monitoring (Datadog/NewRelic): $200

Total: ~$1,305/month (initial)
Scales to: ~$10,000/month at 1M users
```

### Optimization Strategies
1. **Reserved Instances**: 30-50% cost reduction
2. **Spot Instances**: For batch jobs and non-critical services
3. **Auto-scaling**: Scale down during off-peak hours
4. **CDN Caching**: Reduce bandwidth costs
5. **Database Connection Pooling**: Reduce instance size needs
6. **Lazy Loading**: Load data only when needed
7. **Image Optimization**: WebP format, multiple resolutions

---

## Team Structure & Responsibilities

### Development Team
- **Tech Lead**: Architecture decisions, code reviews
- **Backend Engineers (3)**: API development, microservices
- **Mobile Engineers (2)**: React Native app development
- **DevOps Engineer**: Infrastructure, CI/CD, monitoring
- **QA Engineer**: Testing strategy, automation
- **UI/UX Designer**: Design system, user experience

### Development Phases
1. **Phase 1 (Months 1-2)**: MVP with core features
2. **Phase 2 (Months 3-4)**: Advanced matching, payment integration
3. **Phase 3 (Months 5-6)**: Scale optimization, ML features
4. **Phase 4 (Ongoing)**: Feature iterations, A/B testing

---

## Risk Management

### Technical Risks
1. **Database Scaling**: Implement sharding early
2. **Real-time Performance**: Use Redis pub/sub for scale
3. **Payment Failures**: Implement retry mechanisms
4. **Data Consistency**: Use distributed transactions
5. **Security Breaches**: Regular security audits

### Mitigation Strategies
- **Load Testing**: Regular stress testing with K6/JMeter
- **Chaos Engineering**: Implement failure injection
- **Blue-Green Deployments**: Zero-downtime updates
- **Database Backups**: Automated daily backups
- **Disaster Recovery**: Multi-region deployment ready