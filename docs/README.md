# Pairity Documentation Index

## Project Overview
Pairity is a premium dating platform that solves gender imbalance issues in traditional dating apps through controlled match distribution and a 50-50 gender ratio maintenance system.

## Documentation Structure

### 📋 Product Documentation
- **[User Stories](./user-stories.md)** - Complete user stories, epics, and acceptance criteria
- **[Product Requirements](./product-requirements.md)** - Detailed feature specifications
- **[Business Model](./business-model.md)** - Revenue model and monetization strategy

### 🛠 Technical Documentation
- **[Developer Story](./developer-story.md)** - Complete technical architecture and implementation guide
- **[API Documentation](./api-documentation.md)** - RESTful and WebSocket API specifications
- **[Database Schema](./database-schema.md)** - PostgreSQL, MongoDB, and Redis schemas
- **[Architecture Overview](./architecture-overview.md)** - System design and microservices architecture
- **[Libraries & Packages](./libraries-and-packages.md)** - Curated list of stable, production-ready libraries
- **[Deduplication Strategy](./deduplication-strategy.md)** - How we prevent showing repeated profiles

### 📱 Frontend Documentation
- **[Premium UI Design System](./premium-ui-design-system.md)** - Luxury design language and components
- **[React Native Setup](./frontend/react-native-setup.md)** - Mobile app development guide
- **[Component Library](./frontend/component-library.md)** - Reusable UI components
- **[State Management](./frontend/state-management.md)** - Redux and context patterns
- **[Navigation Structure](./frontend/navigation.md)** - App routing and navigation flow

### ⚙️ Backend Documentation
- **[Microservices Guide](./backend/microservices.md)** - Service-specific documentation
- **[Authentication Flow](./backend/authentication.md)** - JWT, OAuth, and security
- **[Matching Algorithm](./backend/matching-algorithm.md)** - Compatibility scoring system
- **[Payment Integration](./backend/payment-integration.md)** - Subscription and billing

### 🚀 DevOps Documentation
- **[Deployment Guide](./devops/deployment.md)** - Production deployment procedures
- **[CI/CD Pipeline](./devops/ci-cd.md)** - GitHub Actions and automation
- **[Kubernetes Config](./devops/kubernetes.md)** - Container orchestration
- **[Monitoring Setup](./devops/monitoring.md)** - Prometheus, Grafana, and logging

### 🧪 Testing Documentation
- **[Testing Strategy](./testing/strategy.md)** - Unit, integration, and E2E testing
- **[Test Cases](./testing/test-cases.md)** - Comprehensive test scenarios
- **[Performance Testing](./testing/performance.md)** - Load and stress testing

## Quick Links

### For Product Managers
1. Start with [User Stories](./user-stories.md)
2. Review [Product Requirements](./product-requirements.md)
3. Check [Business Model](./business-model.md)

### For Developers
1. Read [Developer Story](./developer-story.md)
2. Review [Libraries & Packages](./libraries-and-packages.md) for recommended tools
3. Setup using [React Native Setup](./frontend/react-native-setup.md)
4. Review [API Documentation](./api-documentation.md)
5. Understand [Database Schema](./database-schema.md)

### For DevOps Engineers
1. Start with [Architecture Overview](./architecture-overview.md)
2. Review [Deployment Guide](./devops/deployment.md)
3. Setup [CI/CD Pipeline](./devops/ci-cd.md)
4. Configure [Monitoring](./devops/monitoring.md)

## Key Features Overview

### Core Features
- ✅ 50-50 gender ratio maintenance
- ✅ ₹5000 premium subscription for males
- ✅ Free access for females
- ✅ Daily match limits (5-10 profiles)
- ✅ Queue system for match management
- ✅ Compatibility scoring
- ✅ Identity verification
- ✅ Real-time chat with match expiry

### Advanced Features
- ✅ AI conversation coach
- ✅ Voice and video profiles
- ✅ Interest-based events
- ✅ Background verification
- ✅ Dating insights dashboard
- ✅ Referral rewards system

## Technology Stack

### Frontend
- React Native + Expo
- Redux Toolkit
- Socket.io Client
- React Navigation

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- MongoDB
- Redis
- Socket.io

### Infrastructure
- Docker + Kubernetes
- AWS/GCP
- Cloudflare CDN
- GitHub Actions

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-org/pairity.git

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev
```

## Document Maintenance
- Last Updated: 2025-08-13
- Version: 1.0.0
- Maintained by: Development Team

## Support
For questions or clarifications, please refer to specific documentation sections or contact the development team.