# Profile Deduplication Strategy

## Overview
This document outlines how Pairity ensures users don't see the same profiles repeatedly, maintaining fresh discovery experiences while respecting the limited user pool.

---

## Core Deduplication Mechanisms

### 1. Swipe History Tracking

#### Database Implementation
```sql
-- The swipes table acts as permanent history
CREATE TABLE swipes (
    id UUID PRIMARY KEY,
    swiper_id UUID REFERENCES users(id),
    swiped_id UUID REFERENCES users(id),
    action ENUM('like', 'superlike', 'pass'),
    created_at TIMESTAMP,
    UNIQUE(swiper_id, swiped_id) -- Prevents duplicate swipes
);

-- Index for fast lookups
CREATE INDEX idx_swipes_history ON swipes(swiper_id, swiped_id);
CREATE INDEX idx_swipes_date ON swipes(swiper_id, created_at DESC);
```

#### Query Logic
```typescript
// Get profiles user hasn't seen
async function getUnseenProfiles(userId: string) {
  return await prisma.$queryRaw`
    SELECT p.* FROM profiles p
    WHERE p.user_id NOT IN (
      -- Exclude already swiped profiles
      SELECT swiped_id FROM swipes 
      WHERE swiper_id = ${userId}
    )
    AND p.user_id NOT IN (
      -- Exclude current matches
      SELECT CASE 
        WHEN user1_id = ${userId} THEN user2_id
        ELSE user1_id
      END
      FROM matches 
      WHERE (user1_id = ${userId} OR user2_id = ${userId})
      AND is_active = true
    )
    AND p.user_id != ${userId} -- Exclude self
  `;
}
```

### 2. Daily Queue System

#### Queue Generation Algorithm
```typescript
class DailyQueueGenerator {
  async generateDailyQueue(userId: string, date: Date) {
    // Step 1: Get all seen profiles
    const seenProfiles = await this.getSeenProfiles(userId);
    
    // Step 2: Get eligible profiles
    const eligibleProfiles = await this.getEligibleProfiles(
      userId, 
      seenProfiles
    );
    
    // Step 3: Apply recycle rules for limited pool
    const recyclableProfiles = await this.getRecyclableProfiles(
      userId,
      seenProfiles,
      RECYCLE_AFTER_DAYS
    );
    
    // Step 4: Combine and rank
    const rankedProfiles = this.rankProfiles([
      ...eligibleProfiles,
      ...recyclableProfiles
    ]);
    
    // Step 5: Create daily queue (5-10 profiles)
    return rankedProfiles.slice(0, DAILY_LIMIT);
  }
}
```

#### Daily Queue Table
```sql
-- Track what's shown each day
CREATE TABLE daily_queues (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    target_user_id UUID REFERENCES users(id),
    queue_date DATE,
    is_shown BOOLEAN DEFAULT false,
    action_taken ENUM('like', 'superlike', 'pass'),
    UNIQUE(user_id, target_user_id, queue_date)
);
```

### 3. Profile Recycling Strategy

#### Recycle Rules
```typescript
const RECYCLE_RULES = {
  // After how many days can a "passed" profile reappear
  PASS_RECYCLE_DAYS: 30,
  
  // Never show these again
  NEVER_RECYCLE: ['unmatched', 'blocked', 'reported'],
  
  // Priority for recycling
  RECYCLE_PRIORITY: {
    'profile_updated': 1.5,  // Boost if profile significantly changed
    'new_photos': 1.3,       // Boost if new photos added
    'verified_recently': 1.2, // Boost if got verified
    'inactive_period': 0.8   // Lower if was inactive
  }
};
```

#### Implementation
```typescript
async function getRecyclableProfiles(userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return await prisma.$queryRaw`
    SELECT 
      p.*,
      s.created_at as last_seen_date,
      s.action as last_action
    FROM profiles p
    JOIN swipes s ON s.swiped_id = p.user_id
    WHERE s.swiper_id = ${userId}
    AND s.action = 'pass'
    AND s.created_at < ${thirtyDaysAgo}
    AND p.updated_at > s.created_at -- Profile updated since last swipe
    AND NOT EXISTS (
      -- Not in current matches
      SELECT 1 FROM matches m
      WHERE ((m.user1_id = ${userId} AND m.user2_id = p.user_id)
         OR (m.user2_id = ${userId} AND m.user1_id = p.user_id))
      AND m.is_active = true
    )
    ORDER BY p.updated_at DESC
    LIMIT 5
  `;
}
```

### 4. Redis Cache Layer

#### Cache Structure
```typescript
// Real-time deduplication cache
class ProfileDeduplicationCache {
  private redis: Redis;
  
  // Track shown profiles in current session
  async markProfileShown(userId: string, profileId: string) {
    const key = `shown:${userId}:${this.getTodayDate()}`;
    await this.redis.sadd(key, profileId);
    await this.redis.expire(key, 86400); // 24 hours
  }
  
  // Get all shown profiles today
  async getShownToday(userId: string): Promise<string[]> {
    const key = `shown:${userId}:${this.getTodayDate()}`;
    return await this.redis.smembers(key);
  }
  
  // Track swipe history (last 7 days for quick access)
  async addToSwipeHistory(userId: string, profileId: string) {
    const key = `swipe_history:${userId}`;
    await this.redis.zadd(key, Date.now(), profileId);
    
    // Keep only last 1000 swipes in cache
    await this.redis.zremrangebyrank(key, 0, -1001);
    await this.redis.expire(key, 604800); // 7 days
  }
  
  // Check if profile was recently seen
  async wasRecentlySeen(userId: string, profileId: string): Promise<boolean> {
    const key = `swipe_history:${userId}`;
    const score = await this.redis.zscore(key, profileId);
    return score !== null;
  }
}
```

### 5. Smart Filtering Algorithm

#### Multi-Level Filtering
```typescript
class ProfileFilterService {
  async getFilteredProfiles(userId: string, limit: number = 10) {
    const filters = await this.buildFilters(userId);
    
    return await prisma.profiles.findMany({
      where: {
        AND: [
          // Level 1: Hard exclusions
          { user_id: { notIn: filters.hardExclusions } },
          
          // Level 2: Preference matching
          { age: { gte: filters.ageMin, lte: filters.ageMax } },
          { distance: { lte: filters.maxDistance } },
          
          // Level 3: Activity filter
          { last_active_at: { gte: filters.activityThreshold } },
          
          // Level 4: Verification requirements
          filters.requireVerified ? { is_verified: true } : {},
        ]
      },
      orderBy: [
        { compatibility_score: 'desc' },
        { last_active_at: 'desc' }
      ],
      take: limit
    });
  }
  
  private async buildFilters(userId: string) {
    // Get all exclusions
    const swipedProfiles = await this.getSwipedProfiles(userId);
    const matchedProfiles = await this.getMatchedProfiles(userId);
    const blockedProfiles = await this.getBlockedProfiles(userId);
    const reportedProfiles = await this.getReportedProfiles(userId);
    
    return {
      hardExclusions: [
        ...swipedProfiles,
        ...matchedProfiles,
        ...blockedProfiles,
        ...reportedProfiles,
        userId // exclude self
      ],
      // ... other filters
    };
  }
}
```

### 6. Discover Mode vs Queue Mode

#### Two Discovery Modes
```typescript
enum DiscoveryMode {
  QUEUE = 'queue',      // Daily limited profiles (5-10)
  DISCOVER = 'discover' // After queue exhausted
}

class DiscoveryService {
  async getProfiles(userId: string, mode: DiscoveryMode) {
    if (mode === DiscoveryMode.QUEUE) {
      return await this.getDailyQueue(userId);
    } else {
      return await this.getDiscoverProfiles(userId);
    }
  }
  
  private async getDailyQueue(userId: string) {
    // Get today's curated queue
    const queue = await prisma.dailyQueues.findMany({
      where: {
        user_id: userId,
        queue_date: new Date().toISOString().split('T')[0],
        is_shown: false
      },
      orderBy: { priority_score: 'desc' },
      take: 10
    });
    
    if (queue.length === 0) {
      // Generate new queue if empty
      await this.generateDailyQueue(userId);
    }
    
    return queue;
  }
  
  private async getDiscoverProfiles(userId: string) {
    // Wider pool with relaxed filters
    const relaxedFilters = {
      distance: 100, // Increase from usual 50km
      ageRange: 10,  // Wider age range
      includeRecycled: true,
      recycleAfterDays: 14 // Shorter recycle period
    };
    
    return await this.getFilteredProfiles(userId, relaxedFilters);
  }
}
```

### 7. Special Cases Handling

#### New User Boost
```typescript
// New users get priority to be shown
async function boostNewUsers() {
  const newUsers = await prisma.users.findMany({
    where: {
      created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      is_verified: true
    }
  });
  
  // Add to everyone's queue with high priority
  for (const newUser of newUsers) {
    await addToQueuesWithPriority(newUser.id, HIGH_PRIORITY);
  }
}
```

#### Profile Update Triggers
```typescript
// When profile is significantly updated, make eligible for re-showing
async function handleProfileUpdate(userId: string, changes: ProfileChanges) {
  const significantChange = 
    changes.hasNewPhotos || 
    changes.bioChanged > 50 || // 50% change in bio
    changes.newVerification;
  
  if (significantChange) {
    // Mark as eligible for recycling
    await prisma.profileUpdates.create({
      data: {
        user_id: userId,
        update_type: 'significant',
        eligible_for_recycle: true,
        recycle_after: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      }
    });
  }
}
```

---

## Implementation Flow

### Complete Deduplication Flow
```typescript
class ProfileService {
  async getNextProfile(userId: string): Promise<Profile | null> {
    // Step 1: Check Redis cache for quick filtering
    const shownToday = await cache.getShownToday(userId);
    
    // Step 2: Get user's swipe history
    const swipeHistory = await this.getSwipeHistory(userId);
    
    // Step 3: Build exclusion list
    const exclusions = new Set([
      ...shownToday,
      ...swipeHistory.map(s => s.swiped_id),
      ...await this.getActiveMatches(userId),
      ...await this.getBlockedUsers(userId)
    ]);
    
    // Step 4: Try to get from daily queue first
    let profile = await this.getFromDailyQueue(userId, exclusions);
    
    // Step 5: If queue empty, use discover mode
    if (!profile) {
      profile = await this.getFromDiscoverPool(userId, exclusions);
    }
    
    // Step 6: If still no profiles, consider recycling
    if (!profile) {
      profile = await this.getRecyclableProfile(userId, exclusions);
    }
    
    // Step 7: Mark as shown
    if (profile) {
      await cache.markProfileShown(userId, profile.id);
      await this.recordProfileView(userId, profile.id);
    }
    
    return profile;
  }
}
```

---

## Monitoring & Analytics

### Deduplication Metrics
```typescript
interface DeduplicationMetrics {
  totalProfilesAvailable: number;
  profilesShownToday: number;
  profilesInQueue: number;
  recycledProfiles: number;
  exhaustionRate: number; // How quickly users run out of new profiles
  recycleRate: number;    // How often recycled profiles are shown
}

// Track metrics
async function trackDeduplicationMetrics(userId: string) {
  await prometheus.gauge('profiles_available', {
    user_id: userId,
    value: await getAvailableProfileCount(userId)
  });
  
  await prometheus.counter('profile_recycled', {
    user_id: userId
  });
}
```

---

## Edge Cases

### 1. Small User Pool
When total users < 100 in an area:
- Reduce recycle period to 14 days
- Expand geographic radius automatically
- Show "You've seen everyone nearby" message
- Suggest expanding preferences

### 2. Highly Active Users
For users who swipe through queue quickly:
- Implement hourly limits
- Show "Come back later for more profiles"
- Offer profile boost as alternative activity

### 3. Inactive Profile Handling
Profiles inactive > 30 days:
- Lower priority in queues
- Show "Last active" indicator
- Auto-hide after 90 days inactive

---

## Configuration

### Environment Variables
```env
# Deduplication settings
DAILY_QUEUE_SIZE=10
PASS_RECYCLE_DAYS=30
MAX_DISCOVER_PROFILES=20
CACHE_TTL_HOURS=24
PROFILE_POOL_MINIMUM=50
AUTO_EXPAND_RADIUS=true
MAX_RADIUS_KM=100
```

### Database Indexes for Performance
```sql
-- Optimize deduplication queries
CREATE INDEX idx_swipes_composite ON swipes(swiper_id, swiped_id, created_at);
CREATE INDEX idx_matches_active_users ON matches(user1_id, user2_id) WHERE is_active = true;
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_daily_queue_lookup ON daily_queues(user_id, queue_date, is_shown);
```