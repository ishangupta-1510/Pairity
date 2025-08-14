# Database Schema Documentation

## Database Strategy

### Database Selection
- **PostgreSQL**: Primary transactional data (users, profiles, matches)
- **MongoDB**: Chat messages, activity logs, flexible schemas
- **Redis**: Caching, sessions, real-time data, queues
- **Elasticsearch**: Full-text search on profiles and interests

## PostgreSQL Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    email_verified BOOLEAN DEFAULT false,
    phone VARCHAR(20) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT false,
    password_hash VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    birth_date DATE NOT NULL,
    
    -- Subscription (Only premium tier exists - free for females, paid for males)
    subscription_status ENUM('active', 'inactive', 'pending', 'cancelled') DEFAULT 'pending',
    subscription_tier ENUM('premium') DEFAULT 'premium', -- Only premium tier, no free tier
    subscription_expires_at TIMESTAMP, -- NULL for females (lifetime free), timestamp for males
    
    -- Account Status
    is_active BOOLEAN DEFAULT true,
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    banned_until TIMESTAMP,
    
    -- Waitlist
    waitlist_position INT,
    waitlist_joined_at TIMESTAMP,
    
    -- Referral
    referred_by UUID REFERENCES users(id),
    referral_code VARCHAR(20) UNIQUE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active_at TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_users_gender (gender),
    INDEX idx_users_subscription (subscription_status, subscription_tier),
    INDEX idx_users_last_active (last_active_at),
    INDEX idx_users_waitlist (waitlist_position) WHERE waitlist_position IS NOT NULL
);
```

#### profiles
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Info
    display_name VARCHAR(100) NOT NULL,
    bio TEXT,
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_city VARCHAR(100),
    location_state VARCHAR(100),
    location_country VARCHAR(100),
    
    -- Physical Attributes
    height_cm INT CHECK (height_cm BETWEEN 120 AND 250),
    body_type VARCHAR(50),
    ethnicity VARCHAR(50),
    
    -- Lifestyle
    education_level VARCHAR(50),
    education_field VARCHAR(100),
    occupation VARCHAR(100),
    company VARCHAR(100),
    income_range VARCHAR(50),
    
    -- Preferences
    religion VARCHAR(50),
    languages TEXT[], -- Array of languages
    drinking_habit ENUM('never', 'socially', 'regularly'),
    smoking_habit ENUM('never', 'socially', 'regularly'),
    diet_preference VARCHAR(50),
    fitness_level VARCHAR(50),
    
    -- Relationship Goals
    relationship_goal ENUM('casual', 'serious', 'marriage', 'unsure'),
    wants_children ENUM('yes', 'no', 'maybe', 'have_and_want_more', 'have_and_dont_want_more'),
    has_children BOOLEAN DEFAULT false,
    
    -- Personality
    political_view VARCHAR(50),
    zodiac_sign VARCHAR(20),
    personality_type VARCHAR(10), -- MBTI
    love_language VARCHAR(50),
    
    -- Interests & Hobbies
    interests TEXT[], -- Array of interests
    hobbies TEXT[],
    favorite_music_genres TEXT[],
    favorite_movie_genres TEXT[],
    favorite_books TEXT[],
    favorite_sports TEXT[],
    
    -- Social Media
    instagram_handle VARCHAR(100),
    spotify_connected BOOLEAN DEFAULT false,
    spotify_top_artists TEXT[],
    
    -- Verification & Scores
    verification_level INT DEFAULT 0, -- 0-5 scale
    is_photo_verified BOOLEAN DEFAULT false,
    is_id_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    
    -- Computed Scores
    profile_completion_score INT DEFAULT 0, -- 0-100
    attractiveness_score DECIMAL(3,2), -- ML computed
    activity_score DECIMAL(3,2), -- Based on app usage
    response_rate DECIMAL(3,2), -- Message response rate
    response_time_avg INT, -- Average response time in minutes
    
    -- Dating Preferences
    age_preference_min INT DEFAULT 18,
    age_preference_max INT DEFAULT 99,
    distance_preference_km INT DEFAULT 50,
    gender_preference VARCHAR(20),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_profiles_user_id (user_id),
    INDEX idx_profiles_location (location_lat, location_lng),
    INDEX idx_profiles_verification (verification_level),
    INDEX idx_profiles_interests USING GIN (interests)
);
```

#### media
```sql
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Media Info
    media_type ENUM('photo', 'video', 'voice', 'voice_prompt') NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    blurhash VARCHAR(100), -- For progressive loading
    
    -- Metadata
    width INT,
    height INT,
    duration_seconds INT, -- For video/audio
    file_size_bytes BIGINT,
    mime_type VARCHAR(50),
    
    -- Status
    is_primary BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_inappropriate BOOLEAN DEFAULT false,
    moderation_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    moderation_notes TEXT,
    
    -- Organization
    order_index INT NOT NULL DEFAULT 0,
    prompt_id VARCHAR(50), -- For voice prompts
    caption TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_media_user_id (user_id),
    INDEX idx_media_type (media_type),
    INDEX idx_media_order (user_id, order_index)
);
```

#### swipes
```sql
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    swiper_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    swiped_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Action
    action ENUM('like', 'superlike', 'pass') NOT NULL,
    is_from_queue BOOLEAN DEFAULT false,
    queue_id UUID REFERENCES daily_queues(id),
    
    -- Metadata
    swipe_time_seconds INT, -- Time taken to decide
    profile_view_time_seconds INT, -- Time spent viewing profile
    photos_viewed INT DEFAULT 1,
    
    -- Status
    is_seen BOOLEAN DEFAULT false, -- Has the swiped user seen this like
    seen_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(swiper_id, swiped_id),
    CHECK (swiper_id != swiped_id),
    
    -- Indexes
    INDEX idx_swipes_swiper (swiper_id),
    INDEX idx_swipes_swiped (swiped_id),
    INDEX idx_swipes_action (action),
    INDEX idx_swipes_created (created_at)
);
```

#### matches
```sql
CREATE TABLE matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Match Info
    match_type ENUM('regular', 'superlike') DEFAULT 'regular',
    compatibility_score DECIMAL(3,2),
    
    -- Conversation
    conversation_id UUID UNIQUE,
    first_message_at TIMESTAMP,
    last_message_at TIMESTAMP,
    message_count INT DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMP, -- 48 hours from creation
    extended_once BOOLEAN DEFAULT false,
    
    -- Unmatch Info
    unmatched_at TIMESTAMP,
    unmatched_by UUID REFERENCES users(id),
    unmatch_reason VARCHAR(100),
    
    -- Meeting Info
    has_met_irl BOOLEAN DEFAULT false,
    met_at TIMESTAMP,
    meeting_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user1_id, user2_id),
    CHECK (user1_id < user2_id), -- Ensure consistent ordering
    
    -- Indexes
    INDEX idx_matches_users (user1_id, user2_id),
    INDEX idx_matches_active (is_active),
    INDEX idx_matches_expires (expires_at),
    INDEX idx_matches_conversation (conversation_id)
);
```

#### daily_queues
```sql
CREATE TABLE daily_queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Queue Info
    queue_date DATE NOT NULL,
    queue_position INT NOT NULL,
    queue_type ENUM('regular', 'boost', 'new_user') DEFAULT 'regular',
    
    -- Scoring
    compatibility_score DECIMAL(3,2),
    attractiveness_score DECIMAL(3,2),
    activity_score DECIMAL(3,2),
    overall_score DECIMAL(5,2), -- Weighted combination
    
    -- Reasons for inclusion
    inclusion_reasons TEXT[], -- ['common_interests', 'nearby', 'high_compatibility']
    
    -- Status
    is_shown BOOLEAN DEFAULT false,
    shown_at TIMESTAMP,
    action_taken ENUM('like', 'superlike', 'pass'),
    action_at TIMESTAMP,
    view_duration_seconds INT,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    UNIQUE(user_id, target_user_id, queue_date),
    CHECK (user_id != target_user_id),
    
    -- Indexes
    INDEX idx_queue_user_date (user_id, queue_date),
    INDEX idx_queue_shown (user_id, queue_date, is_shown),
    INDEX idx_queue_position (user_id, queue_date, queue_position)
);
```

### Payment Tables

#### subscriptions
```sql
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Plan Info (Only for male users, female users don't have subscription records)
    plan_id VARCHAR(50) NOT NULL, -- 'premium_monthly' only
    plan_name VARCHAR(100), -- 'Premium Monthly'
    amount DECIMAL(10,2) NOT NULL, -- 5000 INR
    currency VARCHAR(3) DEFAULT 'INR',
    billing_period ENUM('monthly', 'quarterly', 'yearly') DEFAULT 'monthly',
    
    -- Status
    status ENUM('active', 'cancelled', 'expired', 'pending', 'failed') NOT NULL,
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP NOT NULL,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    
    -- Payment Info
    payment_method VARCHAR(50),
    payment_provider ENUM('razorpay', 'stripe', 'paytm'),
    provider_subscription_id VARCHAR(255),
    
    -- Trial
    is_trial BOOLEAN DEFAULT false,
    trial_ends_at TIMESTAMP,
    
    -- Auto-renewal
    auto_renew BOOLEAN DEFAULT true,
    next_billing_at TIMESTAMP,
    
    -- Metadata
    metadata JSONB,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_subscriptions_user (user_id),
    INDEX idx_subscriptions_status (status),
    INDEX idx_subscriptions_ends (ends_at)
);
```

#### transactions
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id),
    
    -- Transaction Info
    type ENUM('payment', 'refund', 'credit', 'debit') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'INR',
    
    -- Payment Details
    payment_method VARCHAR(50),
    provider ENUM('razorpay', 'stripe', 'paytm'),
    provider_transaction_id VARCHAR(255),
    provider_response JSONB,
    
    -- Status
    status ENUM('pending', 'processing', 'success', 'failed', 'cancelled') NOT NULL,
    failure_reason TEXT,
    
    -- Invoice
    invoice_number VARCHAR(50),
    invoice_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    
    -- Indexes
    INDEX idx_transactions_user (user_id),
    INDEX idx_transactions_status (status),
    INDEX idx_transactions_created (created_at)
);
```

## MongoDB Schema

### messages Collection
```javascript
{
  _id: ObjectId,
  matchId: String, // Reference to PostgreSQL match
  senderId: String, // UUID from PostgreSQL
  recipientId: String, // UUID from PostgreSQL
  
  // Message Content
  type: String, // 'text', 'image', 'video', 'voice', 'gif', 'location'
  content: {
    text: String,
    mediaUrl: String,
    thumbnailUrl: String,
    duration: Number, // For voice/video
    latitude: Number,
    longitude: Number,
    width: Number,
    height: Number
  },
  
  // Status
  status: String, // 'sent', 'delivered', 'read'
  deliveredAt: Date,
  readAt: Date,
  
  // Metadata
  replyTo: ObjectId, // Reference to another message
  isEdited: Boolean,
  editedAt: Date,
  isDeleted: Boolean,
  deletedAt: Date,
  
  // Timestamps
  createdAt: Date,
  
  // Indexes
  indexes: [
    { matchId: 1, createdAt: -1 },
    { senderId: 1 },
    { recipientId: 1 },
    { status: 1 }
  ]
}
```

### conversations Collection
```javascript
{
  _id: ObjectId,
  matchId: String, // Reference to PostgreSQL match
  participants: [String], // Array of user IDs
  
  // Last Message
  lastMessage: {
    messageId: ObjectId,
    content: String,
    senderId: String,
    type: String,
    createdAt: Date
  },
  
  // Unread Counts
  unreadCounts: {
    userId1: Number,
    userId2: Number
  },
  
  // Typing Indicators
  typingUsers: [String],
  
  // Status
  isActive: Boolean,
  isMuted: {
    userId1: Boolean,
    userId2: Boolean
  },
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastActivityAt: Date,
  
  // Indexes
  indexes: [
    { matchId: 1 },
    { participants: 1 },
    { lastActivityAt: -1 }
  ]
}
```

### activity_logs Collection
```javascript
{
  _id: ObjectId,
  userId: String,
  
  // Activity Info
  type: String, // 'profile_view', 'swipe', 'message', 'login', etc.
  action: String,
  targetId: String, // User or entity affected
  
  // Context
  context: {
    source: String, // 'daily_queue', 'discover', 'likes_you'
    sessionId: String,
    deviceInfo: {
      platform: String,
      version: String,
      deviceId: String
    },
    location: {
      lat: Number,
      lng: Number,
      city: String
    }
  },
  
  // Metadata
  metadata: Object, // Flexible additional data
  
  // Timestamps
  createdAt: Date,
  
  // TTL
  expireAt: Date, // Auto-delete after 90 days
  
  // Indexes
  indexes: [
    { userId: 1, createdAt: -1 },
    { type: 1 },
    { expireAt: 1 }
  ]
}
```

## Redis Schema

### Key Patterns

#### User Sessions
```
session:{userId} -> {
  token: string,
  deviceId: string,
  lastActive: timestamp,
  location: {lat, lng}
}
TTL: 7 days
```

#### Active Matches
```
matches:active:{userId} -> Set of match IDs
matches:detail:{matchId} -> Match object from PostgreSQL
TTL: 1 hour
```

#### Daily Queue Cache
```
queue:{userId}:{date} -> Ordered list of user IDs
queue:shown:{userId}:{date} -> Set of shown user IDs
TTL: 25 hours
```

#### Typing Indicators
```
typing:{matchId}:{userId} -> 1
TTL: 10 seconds
```

#### Online Status
```
online:{userId} -> {
  status: 'online' | 'away' | 'offline',
  lastSeen: timestamp
}
TTL: 5 minutes (refreshed on activity)
```

#### Rate Limiting
```
ratelimit:swipe:{userId} -> counter
TTL: 1 hour

ratelimit:message:{userId} -> counter
TTL: 1 minute
```

#### Notification Queue
```
notifications:{userId} -> List of pending notifications
```

## Elasticsearch Schema

### profiles Index
```json
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "displayName": { 
        "type": "text",
        "analyzer": "standard"
      },
      "bio": {
        "type": "text",
        "analyzer": "standard"
      },
      "location": {
        "type": "geo_point"
      },
      "city": { "type": "keyword" },
      "interests": {
        "type": "keyword"
      },
      "languages": {
        "type": "keyword"
      },
      "education": { "type": "keyword" },
      "occupation": {
        "type": "text",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "ageRange": {
        "type": "integer_range"
      },
      "isVerified": { "type": "boolean" },
      "lastActive": { "type": "date" },
      "score": { "type": "float" }
    }
  },
  "settings": {
    "number_of_shards": 3,
    "number_of_replicas": 1,
    "analysis": {
      "analyzer": {
        "autocomplete": {
          "tokenizer": "autocomplete",
          "filter": ["lowercase"]
        }
      },
      "tokenizer": {
        "autocomplete": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 10,
          "token_chars": ["letter"]
        }
      }
    }
  }
}
```

## Migration Strategy

### Initial Setup
```bash
# PostgreSQL migrations with Prisma
npx prisma migrate dev --name init
npx prisma generate

# MongoDB indexes
npm run mongodb:indexes

# Redis initialization
npm run redis:init

# Elasticsearch mapping
npm run elasticsearch:mapping
```

### Data Seeding
```sql
-- Seed test users
INSERT INTO users (email, phone, gender, birth_date, subscription_tier)
VALUES 
  ('male1@test.com', '+911234567890', 'male', '1995-01-01', 'premium'),
  ('female1@test.com', '+911234567891', 'female', '1996-01-01', 'free');

-- Seed interests
INSERT INTO profile_interests
VALUES ('sports'), ('music'), ('travel'), ('food'), ('movies'), ('reading');
```

## Performance Optimization

### PostgreSQL
- Partition large tables by date
- Use connection pooling (pgBouncer)
- Implement read replicas
- Regular VACUUM and ANALYZE
- Query optimization with EXPLAIN

### MongoDB
- Compound indexes for common queries
- Sharding for messages collection
- Time-series collections for analytics
- Aggregation pipeline optimization

### Redis
- Use pipelining for batch operations
- Implement Redis Cluster for scaling
- Use Lua scripts for atomic operations
- Memory optimization with data structures

### Elasticsearch
- Optimize mapping for search use cases
- Use filters instead of queries where possible
- Implement search result caching
- Regular index optimization