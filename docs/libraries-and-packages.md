# Libraries and Packages Guide

## Overview
This document lists battle-tested, production-ready libraries for building a Tinder-like dating app. All libraries mentioned have strong community support, regular updates, and proven stability in production environments.

---

## React Native - Core UI Libraries

### Swipe/Card Libraries

#### 1. react-native-deck-swiper
**NPM:** `react-native-deck-swiper`  
**Stars:** 1.4k+ | **Weekly Downloads:** 5k+
```bash
npm install react-native-deck-swiper
```
**Features:**
- Tinder-like swipe cards
- Smooth animations
- Customizable swipe directions
- Stack cards with overlap effect
- Swipe back functionality

**Usage:**
```javascript
import Swiper from 'react-native-deck-swiper';

<Swiper
  cards={profiles}
  renderCard={(card) => <ProfileCard profile={card} />}
  onSwipedLeft={(index) => handlePass(index)}
  onSwipedRight={(index) => handleLike(index)}
  onSwipedTop={(index) => handleSuperLike(index)}
  backgroundColor={'transparent'}
  stackSize={3}
  infinite
/>
```

#### 2. react-native-snap-carousel
**NPM:** `react-native-snap-carousel`  
**Stars:** 10k+ | **Weekly Downloads:** 150k+
```bash
npm install react-native-snap-carousel
```
**Features:**
- Swipeable cards with parallax
- Preview of next/previous cards
- Custom animations
- Excellent performance

#### 3. react-native-swipe-cards-deck
**NPM:** `react-native-swipe-cards-deck`  
**Stars:** 100+ | **Weekly Downloads:** 500+
```bash
npm install react-native-swipe-cards-deck
```
**Features:**
- Lightweight alternative
- Simple API
- Good for basic swipe functionality

### Animation Libraries

#### 1. react-native-reanimated
**NPM:** `react-native-reanimated`  
**Stars:** 8k+ | **Weekly Downloads:** 1.5M+
```bash
npm install react-native-reanimated
```
**Essential for:**
- Smooth 60fps animations
- Gesture-based interactions
- Complex animation sequences
- Match celebration animations

#### 2. lottie-react-native
**NPM:** `lottie-react-native`  
**Stars:** 16k+ | **Weekly Downloads:** 500k+
```bash
npm install lottie-react-native
```
**Use cases:**
- Match animations
- Like/Super Like effects
- Onboarding animations
- Loading states

### Image Handling

#### 1. react-native-fast-image
**NPM:** `react-native-fast-image`  
**Stars:** 8k+ | **Weekly Downloads:** 300k+
```bash
npm install react-native-fast-image
```
**Benefits:**
- Aggressive caching
- Priority loading
- Progressive loading
- Memory optimization

#### 2. react-native-image-crop-picker
**NPM:** `react-native-image-crop-picker`  
**Stars:** 6k+ | **Weekly Downloads:** 150k+
```bash
npm install react-native-image-crop-picker
```
**Features:**
- Photo selection from gallery
- Camera capture
- Image cropping
- Multiple image selection
- Video support

### Chat UI Libraries

#### 1. react-native-gifted-chat
**NPM:** `react-native-gifted-chat`  
**Stars:** 13k+ | **Weekly Downloads:** 50k+
```bash
npm install react-native-gifted-chat
```
**Features:**
- Complete chat UI
- Message bubbles
- Input toolbar
- Load earlier messages
- Typing indicator
- Read receipts

**Usage:**
```javascript
import { GiftedChat } from 'react-native-gifted-chat';

<GiftedChat
  messages={messages}
  onSend={messages => onSend(messages)}
  user={{ _id: userId }}
  renderBubble={renderBubble}
  renderInputToolbar={renderInputToolbar}
  showUserAvatar
  alwaysShowSend
/>
```

#### 2. stream-chat-react-native
**NPM:** `stream-chat-react-native`  
**Stars:** 800+ | **Weekly Downloads:** 10k+
```bash
npm install stream-chat-react-native
```
**Features:**
- Real-time messaging
- Reactions
- Threads
- Typing indicators
- Read states
- Push notifications

---

## React Native - Navigation & State

### Navigation

#### 1. react-navigation
**NPM:** `@react-navigation/native`  
**Stars:** 23k+ | **Weekly Downloads:** 1M+
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
```
**Essential navigators:**
- Stack Navigator (screen transitions)
- Bottom Tab Navigator (main navigation)
- Modal Stack (popups, match screens)

### State Management

#### 1. Redux Toolkit
**NPM:** `@reduxjs/toolkit react-redux`  
**Stars:** 10k+ | **Weekly Downloads:** 3M+
```bash
npm install @reduxjs/toolkit react-redux
```
**Includes:**
- RTK Query for API caching
- Async thunks
- DevTools integration

#### 2. Zustand
**NPM:** `zustand`  
**Stars:** 40k+ | **Weekly Downloads:** 2M+
```bash
npm install zustand
```
**Alternative to Redux:**
- Simpler API
- Less boilerplate
- TypeScript friendly

---

## React Native - Forms & Validation

#### 1. react-hook-form
**NPM:** `react-hook-form`  
**Stars:** 40k+ | **Weekly Downloads:** 4M+
```bash
npm install react-hook-form
```
**Benefits:**
- Minimal re-renders
- Built-in validation
- Small bundle size

#### 2. yup
**NPM:** `yup`  
**Stars:** 22k+ | **Weekly Downloads:** 11M+
```bash
npm install yup
```
**Schema validation for:**
- Registration forms
- Profile updates
- Input validation

---

## React Native - UI Component Libraries

#### 1. React Native Elements
**NPM:** `react-native-elements`  
**Stars:** 24k+ | **Weekly Downloads:** 250k+
```bash
npm install react-native-elements react-native-vector-icons
```
**Components:**
- Buttons, Cards, Lists
- Badges, Avatars
- Input fields
- Social icons

#### 2. NativeBase
**NPM:** `native-base`  
**Stars:** 20k+ | **Weekly Downloads:** 60k+
```bash
npm install native-base
```
**Features:**
- Themed components
- Dark mode support
- Responsive design

#### 3. React Native Paper
**NPM:** `react-native-paper`  
**Stars:** 12k+ | **Weekly Downloads:** 200k+
```bash
npm install react-native-paper
```
**Material Design components:**
- Cards, Chips, Dialogs
- FAB, Snackbar
- Theme support

---

## React Native - Maps & Location

#### 1. react-native-maps
**NPM:** `react-native-maps`  
**Stars:** 14k+ | **Weekly Downloads:** 250k+
```bash
npm install react-native-maps
```
**Features:**
- Google Maps/Apple Maps
- Markers, Polygons
- Clustering
- Custom map styles

#### 2. react-native-geolocation-service
**NPM:** `react-native-geolocation-service`  
**Stars:** 1.5k+ | **Weekly Downloads:** 50k+
```bash
npm install react-native-geolocation-service
```
**Better than default geolocation:**
- More accurate
- Battery efficient
- Background location

---

## React Native - Media & Camera

#### 1. react-native-vision-camera
**NPM:** `react-native-vision-camera`  
**Stars:** 6k+ | **Weekly Downloads:** 50k+
```bash
npm install react-native-vision-camera
```
**Features:**
- Photo/Video capture
- Frame processors
- Face detection
- QR scanning

#### 2. react-native-video
**NPM:** `react-native-video`  
**Stars:** 7k+ | **Weekly Downloads:** 300k+
```bash
npm install react-native-video
```
**For video profiles:**
- Playback controls
- Fullscreen support
- Background audio

---

## Backend - Node.js/Express Libraries

### Core Framework

#### 1. Express.js
**NPM:** `express`  
**Stars:** 63k+ | **Weekly Downloads:** 28M+
```bash
npm install express
```

#### 2. Fastify (Alternative to Express)
**NPM:** `fastify`  
**Stars:** 30k+ | **Weekly Downloads:** 1M+
```bash
npm install fastify
```
**Benefits:**
- 2x faster than Express
- Schema validation
- TypeScript support

### Authentication

#### 1. Passport.js
**NPM:** `passport passport-jwt passport-local`  
**Stars:** 22k+ | **Weekly Downloads:** 1.5M+
```bash
npm install passport passport-jwt passport-local
```
**Strategies:**
- Local (email/password)
- JWT tokens
- OAuth (Google, Facebook)

#### 2. jsonwebtoken
**NPM:** `jsonwebtoken`  
**Stars:** 9k+ | **Weekly Downloads:** 12M+
```bash
npm install jsonwebtoken
```

### Database ORMs/ODMs

#### 1. Prisma
**NPM:** `prisma @prisma/client`  
**Stars:** 35k+ | **Weekly Downloads:** 3M+
```bash
npm install prisma @prisma/client
```
**Benefits:**
- Type-safe queries
- Auto-generated types
- Migration system
- Multiple database support

#### 2. Mongoose (MongoDB)
**NPM:** `mongoose`  
**Stars:** 27k+ | **Weekly Downloads:** 3M+
```bash
npm install mongoose
```

#### 3. TypeORM
**NPM:** `typeorm`  
**Stars:** 33k+ | **Weekly Downloads:** 1M+
```bash
npm install typeorm
```

### Real-time Communication

#### 1. Socket.io
**NPM:** `socket.io socket.io-client`  
**Stars:** 60k+ | **Weekly Downloads:** 4M+
```bash
npm install socket.io socket.io-redis
```
**Features:**
- WebSocket with fallbacks
- Room support
- Redis adapter for scaling

### Job Queues

#### 1. Bull (Redis-based)
**NPM:** `bull`  
**Stars:** 15k+ | **Weekly Downloads:** 500k+
```bash
npm install bull
```
**Use cases:**
- Daily queue generation
- Email sending
- Image processing
- Match expiry jobs

#### 2. BullMQ (Next gen Bull)
**NPM:** `bullmq`  
**Stars:** 5k+ | **Weekly Downloads:** 300k+
```bash
npm install bullmq
```

### Validation

#### 1. Joi
**NPM:** `joi`  
**Stars:** 20k+ | **Weekly Downloads:** 11M+
```bash
npm install joi
```
**Request validation:**
```javascript
const schema = Joi.object({
  email: Joi.string().email().required(),
  age: Joi.number().min(18).max(100).required()
});
```

#### 2. express-validator
**NPM:** `express-validator`  
**Stars:** 6k+ | **Weekly Downloads:** 600k+
```bash
npm install express-validator
```

### File Upload

#### 1. Multer
**NPM:** `multer`  
**Stars:** 11k+ | **Weekly Downloads:** 3M+
```bash
npm install multer multer-s3
```
**Features:**
- Multipart form data
- S3 integration
- File filtering
- Size limits

### Image Processing

#### 1. Sharp
**NPM:** `sharp`  
**Stars:** 28k+ | **Weekly Downloads:** 6M+
```bash
npm install sharp
```
**Operations:**
- Resize, crop, rotate
- Format conversion
- Optimization
- Blur/pixelate for moderation

### Email

#### 1. Nodemailer
**NPM:** `nodemailer`  
**Stars:** 16k+ | **Weekly Downloads:** 4M+
```bash
npm install nodemailer
```

#### 2. @sendgrid/mail
**NPM:** `@sendgrid/mail`  
**Stars:** 3k+ | **Weekly Downloads:** 1M+
```bash
npm install @sendgrid/mail
```

### SMS

#### 1. Twilio
**NPM:** `twilio`  
**Stars:** 1.8k+ | **Weekly Downloads:** 500k+
```bash
npm install twilio
```

### Payment

#### 1. Razorpay
**NPM:** `razorpay`  
**Weekly Downloads:** 50k+
```bash
npm install razorpay
```

#### 2. Stripe
**NPM:** `stripe`  
**Stars:** 3.5k+ | **Weekly Downloads:** 2M+
```bash
npm install stripe
```

---

## Database Clients

### Redis
#### 1. ioredis
**NPM:** `ioredis`  
**Stars:** 13k+ | **Weekly Downloads:** 4M+
```bash
npm install ioredis
```
**Better than node-redis:**
- Cluster support
- Sentinel support
- Pipelining
- Lua scripting

### PostgreSQL
#### 1. pg (node-postgres)
**NPM:** `pg`  
**Stars:** 12k+ | **Weekly Downloads:** 7M+
```bash
npm install pg
```

### MongoDB
#### 1. MongoDB Native Driver
**NPM:** `mongodb`  
**Stars:** 10k+ | **Weekly Downloads:** 5M+
```bash
npm install mongodb
```

---

## Security Libraries

#### 1. helmet
**NPM:** `helmet`  
**Stars:** 10k+ | **Weekly Downloads:** 3M+
```bash
npm install helmet
```
**Security headers:**
- XSS Protection
- Content Security Policy
- HSTS

#### 2. express-rate-limit
**NPM:** `express-rate-limit`  
**Stars:** 2.8k+ | **Weekly Downloads:** 1M+
```bash
npm install express-rate-limit
```

#### 3. bcrypt
**NPM:** `bcrypt`  
**Stars:** 7k+ | **Weekly Downloads:** 8M+
```bash
npm install bcrypt
```

#### 4. express-mongo-sanitize
**NPM:** `express-mongo-sanitize`  
**Weekly Downloads:** 200k+
```bash
npm install express-mongo-sanitize
```

---

## Testing Libraries

### React Native Testing

#### 1. Jest
**NPM:** `jest`  
**Stars:** 43k+ | **Weekly Downloads:** 25M+
```bash
npm install --save-dev jest @testing-library/react-native
```

#### 2. Detox (E2E Testing)
**NPM:** `detox`  
**Stars:** 11k+ | **Weekly Downloads:** 100k+
```bash
npm install --save-dev detox
```

### Backend Testing

#### 1. Supertest
**NPM:** `supertest`  
**Stars:** 13k+ | **Weekly Downloads:** 3M+
```bash
npm install --save-dev supertest
```

#### 2. Jest (Backend)
```bash
npm install --save-dev jest @types/jest ts-jest
```

---

## Monitoring & Logging

#### 1. Winston
**NPM:** `winston`  
**Stars:** 22k+ | **Weekly Downloads:** 10M+
```bash
npm install winston
```

#### 2. Morgan
**NPM:** `morgan`  
**Stars:** 7.5k+ | **Weekly Downloads:** 4M+
```bash
npm install morgan
```

#### 3. Sentry
**NPM:** `@sentry/node @sentry/react-native`  
**Stars:** 37k+ | **Weekly Downloads:** 5M+
```bash
npm install @sentry/react-native @sentry/node
```

---

## DevOps & Deployment

#### 1. PM2
**NPM:** `pm2`  
**Stars:** 40k+ | **Weekly Downloads:** 3M+
```bash
npm install -g pm2
```
**Process management:**
- Clustering
- Auto-restart
- Log management

#### 2. Docker
```dockerfile
# Official Node.js image
FROM node:20-alpine
```

#### 3. dotenv
**NPM:** `dotenv`  
**Stars:** 18k+ | **Weekly Downloads:** 40M+
```bash
npm install dotenv
```

---

## Utility Libraries

#### 1. Lodash
**NPM:** `lodash`  
**Stars:** 59k+ | **Weekly Downloads:** 50M+
```bash
npm install lodash
```

#### 2. date-fns
**NPM:** `date-fns`  
**Stars:** 33k+ | **Weekly Downloads:** 20M+
```bash
npm install date-fns
```
**Better than Moment.js:**
- Smaller bundle
- Tree-shakeable
- Immutable

#### 3. uuid
**NPM:** `uuid`  
**Stars:** 14k+ | **Weekly Downloads:** 80M+
```bash
npm install uuid
```

#### 4. axios
**NPM:** `axios`  
**Stars:** 104k+ | **Weekly Downloads:** 50M+
```bash
npm install axios
```

---

## ML/AI Libraries (Matching Algorithm)

#### 1. TensorFlow.js
**NPM:** `@tensorflow/tfjs-node`  
**Stars:** 18k+ | **Weekly Downloads:** 50k+
```bash
npm install @tensorflow/tfjs-node
```
**Use cases:**
- Compatibility scoring
- Photo attractiveness scoring
- Spam detection

#### 2. Natural
**NPM:** `natural`  
**Stars:** 10k+ | **Weekly Downloads:** 150k+
```bash
npm install natural
```
**NLP features:**
- Text similarity
- Sentiment analysis
- Language detection

---

## Package Management Best Practices

### Version Locking
```json
{
  "dependencies": {
    "express": "4.18.2",
    "react-native": "0.72.6",
    "react-native-deck-swiper": "2.0.14"
  }
}
```

### Security Auditing
```bash
# Check for vulnerabilities
npm audit

# Auto-fix vulnerabilities
npm audit fix

# Check outdated packages
npm outdated
```

### Bundle Size Optimization
```bash
# Analyze bundle size
npx react-native-bundle-visualizer

# For web admin
npm install --save-dev webpack-bundle-analyzer
```

### Recommended Package Combinations

#### For Swipe Feature:
- react-native-deck-swiper
- react-native-reanimated
- react-native-gesture-handler
- react-native-fast-image

#### For Chat:
- react-native-gifted-chat
- socket.io-client
- react-native-keyboard-aware-scroll-view

#### For Profile Creation:
- react-native-image-crop-picker
- react-native-vision-camera
- react-hook-form
- yup

#### For Backend API:
- express + express-validator
- passport + jsonwebtoken
- prisma + ioredis
- socket.io + bullmq

---

## Installation Script

Create a `setup-packages.sh` script:

```bash
#!/bin/bash

# React Native packages
npm install react-native-deck-swiper \
  react-native-reanimated \
  react-native-gesture-handler \
  react-native-fast-image \
  react-native-gifted-chat \
  @react-navigation/native \
  @react-navigation/stack \
  @react-navigation/bottom-tabs \
  @reduxjs/toolkit \
  react-redux \
  react-hook-form \
  yup \
  socket.io-client

# Backend packages
npm install express \
  passport \
  passport-jwt \
  jsonwebtoken \
  prisma \
  @prisma/client \
  mongoose \
  ioredis \
  socket.io \
  socket.io-redis \
  bullmq \
  joi \
  multer \
  sharp \
  nodemailer \
  razorpay \
  helmet \
  express-rate-limit \
  bcrypt \
  winston \
  dotenv

# Dev dependencies
npm install --save-dev \
  @types/node \
  @types/express \
  typescript \
  ts-node \
  nodemon \
  jest \
  supertest \
  @testing-library/react-native
```

---

## Library Selection Criteria

When choosing libraries, consider:

1. **Weekly Downloads**: >10k for critical features
2. **Last Update**: Within last 6 months
3. **GitHub Stars**: >1k for important packages
4. **Issues/PR Activity**: Active maintenance
5. **TypeScript Support**: First-class TS support
6. **Bundle Size**: Use bundlephobia.com to check
7. **Documentation Quality**: Comprehensive docs
8. **Community**: Active Discord/Slack/Forums

---

## Avoid These Libraries

### Deprecated/Unmaintained:
- react-native-swiper (use react-native-snap-carousel)
- moment.js (use date-fns)
- request (use axios or fetch)
- node-redis (use ioredis)

### Performance Issues:
- react-native-firebase (too heavy, use selective imports)
- lodash (import specific functions only)

### Security Concerns:
- Packages with known vulnerabilities
- Packages requesting unnecessary permissions