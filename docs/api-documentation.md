# API Documentation

## API Overview

### Base URLs
- **Development**: `http://localhost:3000/api/v1`
- **Staging**: `https://api-staging.pairity.com/v1`
- **Production**: `https://api.pairity.com/v1`

### Authentication
All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **Anonymous**: 10 requests/minute
- **Authenticated**: 100 requests/minute
- **Premium Users**: 500 requests/minute

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-01-13T10:00:00Z"
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  },
  "timestamp": "2025-01-13T10:00:00Z"
}
```

---

## Authentication Endpoints

### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "+911234567890",
  "password": "SecurePass123!",
  "gender": "male|female",
  "birthDate": "1995-01-01",
  "referralCode": "FRIEND123" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "requiresPayment": true, // true for males, false for females
    "paymentAmount": 5000, // null for females
    "waitlistPosition": null, // number if waitlisted (males only)
    "verificationRequired": {
      "email": true,
      "phone": true
    }
  }
}
```

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "device-uuid"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "gender": "male",
      "subscriptionStatus": "active"
    }
  }
}
```

### Verify OTP
```http
POST /auth/verify-otp
```

**Request Body:**
```json
{
  "type": "email|phone",
  "value": "user@example.com",
  "otp": "123456"
}
```

### Refresh Token
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### Logout
```http
POST /auth/logout
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

---

## User Profile Endpoints

### Get Profile
```http
GET /users/profile
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "displayName": "John Doe",
    "bio": "Adventure seeker...",
    "age": 28,
    "location": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India"
    },
    "photos": [
      {
        "id": "uuid",
        "url": "https://cdn.pairity.com/photo1.jpg",
        "isPrimary": true,
        "isVerified": true
      }
    ],
    "interests": ["travel", "music", "food"],
    "preferences": {
      "ageRange": { "min": 23, "max": 32 },
      "distance": 50,
      "relationshipGoal": "serious"
    },
    "verification": {
      "level": 3,
      "badges": ["photo", "id", "phone"]
    },
    "completionScore": 85
  }
}
```

### Update Profile
```http
PUT /users/profile
```

**Request Body:**
```json
{
  "displayName": "John Doe",
  "bio": "Updated bio...",
  "height": 175,
  "occupation": "Software Engineer",
  "company": "Tech Corp",
  "education": "Bachelor's in Computer Science",
  "interests": ["travel", "music", "food", "sports"],
  "languages": ["English", "Hindi"],
  "drinkingHabit": "socially",
  "smokingHabit": "never",
  "relationshipGoal": "serious"
}
```

### Upload Photo
```http
POST /users/photos
```

**Headers:**
```
Content-Type: multipart/form-data
```

**Form Data:**
- `photo`: File (max 10MB)
- `isPrimary`: boolean
- `caption`: string (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "photoId": "uuid",
    "url": "https://cdn.pairity.com/photos/uuid.jpg",
    "thumbnailUrl": "https://cdn.pairity.com/photos/uuid_thumb.jpg",
    "verificationStatus": "pending"
  }
}
```

### Delete Photo
```http
DELETE /users/photos/{photoId}
```

### Reorder Photos
```http
PUT /users/photos/reorder
```

**Request Body:**
```json
{
  "photoIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## Matching Endpoints

### Get Daily Queue
```http
GET /matching/daily-queue
```

**Query Parameters:**
- `date`: YYYY-MM-DD (optional, defaults to today)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2025-01-13",
    "profiles": [
      {
        "id": "uuid",
        "displayName": "Jane",
        "age": 26,
        "bio": "Love to travel...",
        "photos": [...],
        "interests": ["travel", "yoga"],
        "compatibilityScore": 87,
        "distance": 5.2,
        "verificationLevel": 3
      }
    ],
    "remainingToday": 7,
    "nextRefresh": "2025-01-14T00:00:00Z"
  }
}
```

### Swipe Action
```http
POST /matching/swipe
```

**Request Body:**
```json
{
  "targetUserId": "uuid",
  "action": "like|superlike|pass",
  "viewDuration": 45, // seconds
  "photosViewed": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isMatch": true, // true if mutual like
    "matchId": "uuid", // if isMatch is true
    "remainingLikes": 50,
    "remainingSuperLikes": 3
  }
}
```

### Get Matches
```http
GET /matching/matches
```

**Query Parameters:**
- `status`: active|expired|all (default: active)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "matches": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "displayName": "Jane",
          "age": 26,
          "photos": [...],
          "lastActive": "2025-01-13T09:30:00Z"
        },
        "matchedAt": "2025-01-12T15:00:00Z",
        "expiresAt": "2025-01-14T15:00:00Z",
        "lastMessage": {
          "content": "Hey there!",
          "sentAt": "2025-01-13T08:00:00Z",
          "isFromMe": false
        },
        "unreadCount": 2
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "hasMore": true
    }
  }
}
```

### Unmatch
```http
DELETE /matching/matches/{matchId}
```

**Request Body:**
```json
{
  "reason": "not_interested|inappropriate|spam|other",
  "feedback": "Optional feedback text"
}
```

### Get Likes Received
```http
GET /matching/likes-received
```

**Note:** Premium feature only

**Response:**
```json
{
  "success": true,
  "data": {
    "likes": [
      {
        "id": "uuid",
        "user": {
          "id": "uuid",
          "displayName": "John",
          "age": 29,
          "photo": "https://cdn.pairity.com/photo.jpg",
          "bio": "First 50 characters..."
        },
        "likedAt": "2025-01-13T07:00:00Z",
        "isSuperLike": false
      }
    ],
    "count": 15
  }
}
```

---

## Chat Endpoints

### Get Conversations
```http
GET /chat/conversations
```

**Response:**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "uuid",
        "matchId": "uuid",
        "user": {
          "id": "uuid",
          "displayName": "Jane",
          "photo": "https://cdn.pairity.com/photo.jpg",
          "isOnline": true
        },
        "lastMessage": {
          "id": "uuid",
          "content": "How was your day?",
          "type": "text",
          "sentAt": "2025-01-13T09:00:00Z",
          "isFromMe": true,
          "status": "read"
        },
        "unreadCount": 0,
        "isMuted": false
      }
    ]
  }
}
```

### Get Messages
```http
GET /chat/conversations/{matchId}/messages
```

**Query Parameters:**
- `before`: messageId (for pagination)
- `limit`: number (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "uuid",
        "senderId": "uuid",
        "content": {
          "text": "Hello!",
          "type": "text"
        },
        "sentAt": "2025-01-13T08:00:00Z",
        "deliveredAt": "2025-01-13T08:00:01Z",
        "readAt": "2025-01-13T08:00:05Z",
        "isEdited": false
      }
    ],
    "hasMore": true
  }
}
```

### Send Message
```http
POST /chat/messages
```

**Request Body:**
```json
{
  "matchId": "uuid",
  "type": "text|image|voice|gif",
  "content": {
    "text": "Hello there!",
    "mediaUrl": "https://...", // for media types
    "duration": 10 // for voice messages (seconds)
  },
  "replyTo": "messageId" // optional
}
```

### Mark as Read
```http
POST /chat/conversations/{matchId}/read
```

**Request Body:**
```json
{
  "messageIds": ["uuid1", "uuid2"]
}
```

---

## Payment Endpoints

### Get Subscription Status
```http
GET /payments/subscription
```

**Response for Male Users:**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan": {
      "id": "premium_monthly",
      "name": "Premium Monthly (Mandatory)",
      "amount": 5000,
      "currency": "INR",
      "features": [
        "Unlimited swipes",
        "See who likes you",
        "3 Super Likes daily",
        "Profile boost weekly",
        "Advanced filters",
        "Read receipts"
      ]
    },
    "currentPeriod": {
      "start": "2025-01-01T00:00:00Z",
      "end": "2025-02-01T00:00:00Z"
    },
    "autoRenew": true,
    "nextBilling": "2025-02-01T00:00:00Z"
  }
}
```

**Response for Female Users:**
```json
{
  "success": true,
  "data": {
    "status": "active",
    "plan": {
      "id": "premium_lifetime_free",
      "name": "Premium (Free for Females)",
      "amount": 0,
      "currency": "INR",
      "features": [
        "Unlimited swipes",
        "See who likes you",
        "3 Super Likes daily",
        "Profile boost weekly",
        "Advanced filters",
        "Read receipts"
      ]
    },
    "isFree": true,
    "reason": "Free lifetime access for female users"
  }
}
```

### Create Subscription Order (Male Users Only)
```http
POST /payments/create-order
```

**Note:** This endpoint returns an error for female users as they have free access.

**Request Body:**
```json
{
  "planId": "premium_monthly",
  "paymentMethod": "card|upi|netbanking"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "orderId": "order_xyz",
    "amount": 5000,
    "currency": "INR",
    "razorpayOrderId": "rzp_order_123",
    "razorpayKey": "rzp_live_xxx"
  }
}
```

### Verify Payment
```http
POST /payments/verify
```

**Request Body:**
```json
{
  "orderId": "order_xyz",
  "razorpayPaymentId": "pay_123",
  "razorpayOrderId": "rzp_order_123",
  "razorpaySignature": "signature_hash"
}
```

### Cancel Subscription
```http
POST /payments/cancel-subscription
```

**Request Body:**
```json
{
  "reason": "too_expensive|not_getting_matches|found_partner|other",
  "feedback": "Optional feedback"
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('wss://api.pairity.com', {
  auth: {
    token: 'jwt_token'
  }
});

socket.on('connect', () => {
  console.log('Connected');
});
```

### Chat Events

#### Join Conversation
```javascript
socket.emit('chat:join', { matchId: 'uuid' });
```

#### Send Message
```javascript
socket.emit('chat:message', {
  matchId: 'uuid',
  type: 'text',
  content: { text: 'Hello!' }
});
```

#### Receive Message
```javascript
socket.on('chat:message', (data) => {
  console.log('New message:', data);
  // {
  //   messageId: 'uuid',
  //   matchId: 'uuid',
  //   senderId: 'uuid',
  //   content: { text: 'Hello!' },
  //   sentAt: '2025-01-13T10:00:00Z'
  // }
});
```

#### Typing Indicator
```javascript
// Send typing status
socket.emit('chat:typing', {
  matchId: 'uuid',
  isTyping: true
});

// Receive typing status
socket.on('chat:typing', (data) => {
  console.log(`${data.userId} is typing:`, data.isTyping);
});
```

#### Read Receipt
```javascript
socket.on('chat:read', (data) => {
  console.log('Messages read:', data.messageIds);
});
```

### Match Events

#### New Match
```javascript
socket.on('match:new', (data) => {
  console.log('New match!', data);
  // {
  //   matchId: 'uuid',
  //   user: { ... },
  //   matchedAt: '2025-01-13T10:00:00Z'
  // }
});
```

#### Match Expired
```javascript
socket.on('match:expired', (data) => {
  console.log('Match expired:', data.matchId);
});
```

### Notification Events

#### New Like
```javascript
socket.on('notification:like', (data) => {
  console.log('Someone liked you!');
  // {
  //   count: 5,
  //   isSuperLike: false
  // }
});
```

#### Profile Visitor
```javascript
socket.on('notification:visitor', (data) => {
  console.log('Profile visited by:', data.visitorId);
});
```

---

## Error Codes

### Authentication Errors
- `AUTH_INVALID_CREDENTIALS`: Invalid email or password
- `AUTH_TOKEN_EXPIRED`: JWT token has expired
- `AUTH_TOKEN_INVALID`: Invalid JWT token
- `AUTH_ACCOUNT_BANNED`: Account has been banned
- `AUTH_EMAIL_NOT_VERIFIED`: Email verification required
- `AUTH_PHONE_NOT_VERIFIED`: Phone verification required

### Validation Errors
- `VALIDATION_ERROR`: Request validation failed
- `INVALID_PHOTO_FORMAT`: Photo format not supported
- `PHOTO_SIZE_EXCEEDED`: Photo size exceeds limit
- `INVALID_AGE`: User must be 18 or older

### Subscription Errors
- `SUBSCRIPTION_REQUIRED`: Premium subscription required (males only)
- `PAYMENT_FAILED`: Payment processing failed
- `SUBSCRIPTION_EXPIRED`: Subscription has expired (males only)
- `PAYMENT_NOT_APPLICABLE`: Payment not required for female users

### Matching Errors
- `DAILY_LIMIT_REACHED`: Daily swipe limit reached
- `ALREADY_SWIPED`: Already swiped on this user
- `MATCH_NOT_FOUND`: Match does not exist
- `MATCH_EXPIRED`: Match has expired

### Rate Limiting
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SPAM_DETECTED`: Spam behavior detected

---

## Webhooks

### Payment Webhooks
```http
POST /webhooks/razorpay
```

**Headers:**
```
X-Razorpay-Signature: signature_hash
```

**Events:**
- `subscription.activated`
- `subscription.charged`
- `subscription.cancelled`
- `payment.failed`

### Example Webhook Handler
```javascript
app.post('/webhooks/razorpay', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  
  if (verifySignature(req.body, signature)) {
    switch(req.body.event) {
      case 'subscription.activated':
        // Handle subscription activation
        break;
      case 'payment.failed':
        // Handle payment failure
        break;
    }
    res.status(200).send('OK');
  } else {
    res.status(400).send('Invalid signature');
  }
});
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { PairitySDK } from '@pairity/sdk';

const client = new PairitySDK({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Login
const { user, token } = await client.auth.login({
  email: 'user@example.com',
  password: 'password'
});

// Get daily queue
const queue = await client.matching.getDailyQueue();

// Swipe
const result = await client.matching.swipe({
  targetUserId: 'uuid',
  action: 'like'
});

// Send message
const message = await client.chat.sendMessage({
  matchId: 'uuid',
  content: { text: 'Hello!' }
});
```

### React Native
```typescript
import { PairityProvider, useAuth, useMatching } from '@pairity/react-native';

function App() {
  return (
    <PairityProvider apiKey="your_api_key">
      <MainApp />
    </PairityProvider>
  );
}

function SwipeScreen() {
  const { swipe, dailyQueue } = useMatching();
  
  const handleSwipe = async (userId: string, action: string) => {
    const result = await swipe(userId, action);
    if (result.isMatch) {
      // Show match modal
    }
  };
  
  return (
    <SwipeCard 
      profiles={dailyQueue}
      onSwipe={handleSwipe}
    />
  );
}
```