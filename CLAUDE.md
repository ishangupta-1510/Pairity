# CLAUDE.md - Claude Code Instructions

## Project Overview
This is the Pairity application project. This document contains important instructions and guidelines for Claude Code when working on this codebase.

## Development Guidelines

### Code Style
- **Write code as an expert developer**: Always produce production-ready, professional-grade code
- Follow industry best practices and design patterns
- Write clean, maintainable, and scalable code with proper abstractions
- Use meaningful variable and function names that clearly express intent
- Apply SOLID principles where appropriate
- Implement proper error handling and edge case management
- Optimize for both readability and performance
- Follow existing code conventions in the project
- Use consistent indentation and formatting
- Maintain clean, readable code structure
- Follow security best practices - never expose or commit secrets

### Testing
- Run tests after implementing new features or fixes
- Verify all changes before marking tasks as complete
- Use appropriate testing frameworks as defined in the project

### File Management
- ALWAYS prefer editing existing files over creating new ones
- Only create new files when absolutely necessary for the task
- Do not create documentation files unless explicitly requested
- **IMPORTANT**: If you create temporary or unnecessary files during implementation, remove them after completing the correct solution
- Clean up any test files, duplicate files, or incorrectly named files that were created during development

### Task Management
- Use the TodoWrite tool to track all major tasks
- Mark tasks as in_progress when starting work
- Mark tasks as completed immediately upon finishing
- Break complex tasks into smaller, manageable steps

### Documentation Requirements
- **IMPORTANT**: ALL major changes MUST be documented in the /docs folder
- Update relevant documentation files immediately after implementing changes
- Create new documentation files in /docs when adding new features or modules
- Documentation should include:
  - Feature descriptions
  - API changes
  - Breaking changes
  - Migration guides (if applicable)
  - Usage examples
- Keep documentation up-to-date and synchronized with code changes
- Use clear, concise language in documentation
- Include code examples where appropriate

## Theme Guidelines

### Dark Mode Default
- **IMPORTANT**: This app uses DARK MODE as the default theme for a premium user experience
- All new components and screens MUST use the theme system
- Never hardcode colors - always use theme.colors from useTheme hook
- Refer to `/docs/dark-theme-implementation.md` for complete guidelines

### Theme Usage Requirements
```typescript
// ALWAYS use theme colors like this:
import { useTheme } from '@/components/ThemeProvider';

const MyComponent = () => {
  const theme = useTheme();
  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Content</Text>
    </View>
  );
};
```

### Premium Dark Theme Colors
- Background: `#0A0A0B` (Rich black)
- Surface: `#151517` (Elevated surface)
- Card: `#1A1A1D` (Premium cards)
- Primary Text: `#F5F5F7` (Off-white)
- Primary: `#FF7979` (Soft coral)
- Premium: `#FFD700` (Gold accents)

## Important Commands

### Project Setup & Installation
```bash
# Navigate to the app directory
cd pairity-app

# Install dependencies (use when package.json changes)
npm install

# Install with legacy peer deps (for packages with peer dependency conflicts)
npm install <package-name> --legacy-peer-deps

# Install dev dependencies
npm install --save-dev <package-name>

# Clean install (removes node_modules and reinstalls)
rm -rf node_modules package-lock.json && npm install
```

### Development Commands
```bash
# Start Metro bundler for React Native
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS
npx react-native run-ios

# Start Expo development server
npx expo start

# Clear Metro cache
npx react-native start --reset-cache

# Clear all caches
cd android && ./gradlew clean && cd ..
cd ios && pod cache clean --all && cd ..
npx react-native start --reset-cache
```

### Build Commands
```bash
# Build Android APK
cd android && ./gradlew assembleRelease

# Build Android Bundle
cd android && ./gradlew bundleRelease

# Build iOS (requires Mac)
cd ios && xcodebuild -workspace Pairity.xcworkspace -scheme Pairity -configuration Release

# Expo build
npx expo build:android
npx expo build:ios
```

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- <filename>

# Run E2E tests
npm run test:e2e
```

### Lint/Type Check/Format Commands
```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues  
npm run lint:fix

# Run TypeScript type checking
npm run type-check

# Format code with Prettier
npm run format

# Check format without changing files
npm run format:check

# Run all checks (lint, type-check, format)
npm run check-all
```

### Git Commands (Frequently Used)
```bash
# Stage all changes
git add -A

# Stage specific directory
git add pairity-app/

# Force add ignored files (like docs/)
git add -f CLAUDE.md docs/

# Commit without pre-commit hooks (when hooks fail)
git commit --no-verify -m "commit message"

# Check status
git status

# View recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Remove deleted files from git
git rm -r <directory-or-file>

# Clean untracked files
git clean -fd
```

### Common NPM Packages We Use
```bash
# Navigation
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs

# UI Components
npm install react-native-vector-icons
npm install react-native-gesture-handler react-native-reanimated
npm install react-native-safe-area-context react-native-screens

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# State Management
npm install @reduxjs/toolkit react-redux redux-persist

# Storage
npm install @react-native-async-storage/async-storage

# Image & Media
npm install react-native-image-picker
npm install react-native-fast-image --legacy-peer-deps
npm install lottie-react-native

# Date & Time
npm install moment react-native-date-picker

# Utilities
npm install lodash @types/lodash
```

### TypeScript Type Installation
```bash
# Install types for packages
npm install --save-dev @types/react @types/react-native
npm install --save-dev @types/react-native-vector-icons

# Generate types
npx tsc --noEmit
```

### Debugging Commands
```bash
# Open React Native Debugger
npx react-native log-android
npx react-native log-ios

# Shake device or Cmd+D (iOS) / Cmd+M (Android) in simulator for dev menu

# Chrome DevTools
# Open: http://localhost:8081/debugger-ui/

# Flipper
npx react-native doctor
```

### Environment Setup
```bash
# Check React Native environment
npx react-native doctor

# Install iOS pods (Mac only)
cd ios && pod install && cd ..

# Update pods
cd ios && pod update && cd ..

# Android: Accept licenses
yes | sdkmanager --licenses

# Set ANDROID_HOME (add to .bashrc/.zshrc)
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Major Changes Log
This section documents all major changes made to the codebase. Each entry should include:
- Date
- Description of change
- Files affected
- Any breaking changes or important notes

### Change History

#### 2025-08-14
- **Dark Theme Implementation**: Premium dark mode as default theme
  - Files: ThemeProvider.tsx, themeSlice.ts, useThemedStyles.ts, AppContainer.tsx
  - Created documentation: docs/dark-theme-implementation.md
  - Notes: Sophisticated dark theme with premium colors, gold accents, and gradient support. Dark mode is now the default for all screens.

#### 2025-08-14
- **CLAUDE.md Enhanced**: Added comprehensive reference information
  - Files: CLAUDE.md
  - Added: Complete command reference, project structure, common imports, troubleshooting guide
  - Notes: Now includes all frequently used commands, paths, and solutions for common issues

#### 2025-08-14  
- **Prompt 09: Chat Interface Complete**: Implemented comprehensive chat system
  - Files: ChatScreen.tsx, MessageBubble.tsx, ChatHeader.tsx, EmojiPicker.tsx, MediaPicker.tsx, VoiceRecorder.tsx, TypingIndicator.tsx
  - Created documentation: docs/prompt-09-chat-interface.md
  - Features: Rich messaging (text, images, videos, voice, GIFs, location), reactions, replies, read receipts, typing indicators
  - Notes: Full chat functionality with real-time features simulation

#### 2025-08-14
- **Prompt 08: Matching System Complete**: Implemented swipe interface and matching
  - Files: SwipeScreen.tsx, SwipeCardStack.tsx, SwipeCard.tsx, MatchModal.tsx, DailyLimitModal.tsx, MatchesScreen.tsx, useMatching.ts, useSwipeQueue.ts
  - Created documentation: docs/prompt-08-matching-system.md
  - Notes: Swipe gestures, daily limits, match celebrations, queue management

#### 2025-08-14
- **Prompt 07: User Discovery & Listing Complete**: Implemented user discovery system
  - Files: DiscoverScreen.tsx, UserCardGrid.tsx, UserCardList.tsx, UserCardStack.tsx, FilterModal.tsx, SearchBar.tsx, discover.ts (types)
  - Created documentation: docs/prompt-07-user-listing-implementation.md  
  - Notes: Three view modes, comprehensive filtering, swipe gestures, search, and sorting

#### 2025-08-14
- **Prompt 06: Settings Screen Complete**: Implemented comprehensive settings system
  - Files: EnhancedSettingsScreen.tsx, CustomSwitch.tsx, CustomSlider.tsx, SectionHeader.tsx, SettingItem.tsx, BlockListScreen.tsx, ChangePasswordScreen.tsx
  - Created documentation: docs/prompt-06-settings-implementation.md
  - Notes: Full settings management with search, undo, animations, and all required sections

#### 2025-08-14
- **Cleanup: Removed unused root-level /src folder**: Cleaned up project structure
  - Files: Deleted /src folder (root level)
  - Notes: All active development is in /pairity-app/src; removed duplicate unused folder structure

#### 2025-08-14
- **Prompt 05: User Profile Management Complete**: Implemented comprehensive profile screens
  - Files: ProfileScreen.tsx, EditProfileScreen.tsx, PhotosTab.tsx, BasicInfoTab.tsx, PreferencesTab.tsx, PromptsTab.tsx, CustomPicker.tsx
  - Added dependencies: react-native-image-picker, react-native-draggable-flatlist, react-native-tab-view, react-native-chart-kit
  - Created documentation: docs/prompt-05-user-profile-implementation.md
  - Notes: Full profile management system with photo upload, drag-to-reorder, form validation, auto-save, and profile prompts

#### 2025-08-13
- **TypeScript Configuration Complete**: Set up TypeScript with strict mode and path aliases
  - Files: pairity-app/tsconfig.json, pairity-app/babel.config.js, pairity-app/package.json
  - Added missing dependencies: redux-persist, yup, @types/react-native-vector-icons
  - Created documentation: docs/typescript-configuration.md
  - Notes: Full TypeScript strict mode enabled with comprehensive path aliases for cleaner imports

#### 2025-08-13
- **Created CLAUDE.md**: Initial setup of Claude Code instructions file
  - Files: CLAUDE.md (new)
  - Notes: This file will serve as the reference for Claude Code when working on the Pairity project

<!-- Add new changes above this line -->

## Project Structure
```
Pairity/
├── pairity-app/                 # Main React Native application
│   ├── src/                     # Source code
│   │   ├── components/          # Reusable components
│   │   ├── screens/             # Screen components
│   │   │   ├── auth/           # Authentication screens
│   │   │   ├── main/           # Main app screens
│   │   │   ├── chat/           # Chat related screens
│   │   │   ├── discover/       # Discovery screens
│   │   │   ├── matches/        # Matches screens
│   │   │   ├── settings/       # Settings screens
│   │   │   └── swipe/          # Swipe interface screens
│   │   ├── navigation/         # Navigation configuration
│   │   ├── store/              # Redux store and slices
│   │   ├── hooks/              # Custom React hooks
│   │   ├── types/              # TypeScript type definitions
│   │   ├── utils/              # Utility functions
│   │   ├── services/           # API services
│   │   └── assets/             # Images, fonts, etc.
│   ├── App.tsx                 # Main app entry point
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript configuration
├── docs/                        # Documentation
├── scripts/                     # Automation scripts
└── CLAUDE.md                   # This file
```

## Common File Paths (Quick Reference)
```bash
# Main screens
pairity-app/src/screens/main/HomeScreen.tsx
pairity-app/src/screens/main/ProfileScreen.tsx
pairity-app/src/screens/auth/LoginScreen.tsx
pairity-app/src/screens/chat/ChatScreen.tsx
pairity-app/src/screens/swipe/SwipeScreen.tsx
pairity-app/src/screens/discover/DiscoverScreen.tsx

# Navigation
pairity-app/src/navigation/RootNavigator.tsx
pairity-app/src/navigation/MainTabNavigator.tsx

# Store
pairity-app/src/store/store.ts
pairity-app/src/store/slices/authSlice.ts
pairity-app/src/store/slices/userSlice.ts

# Types
pairity-app/src/types/navigation.ts
pairity-app/src/types/matching.ts
pairity-app/src/types/discover.ts

# Components
pairity-app/src/components/CustomButton.tsx
pairity-app/src/components/CustomTextInput.tsx
```

## Frequently Used Imports
```typescript
// React & React Native
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  TextInput,
  Alert,
  Platform,
  Dimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Modal,
  Animated,
} from 'react-native';

// Navigation
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// Icons
import Icon from 'react-native-vector-icons/MaterialIcons';

// Redux
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';

// Storage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Forms
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Utilities
import moment from 'moment';
```

## Common Component Patterns
```typescript
// Functional Component with TypeScript
interface ComponentProps {
  title: string;
  onPress: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  return (
    <View style={styles.container}>
      <Text>{title}</Text>
    </View>
  );
};

// Memo Component for Performance
const Component = React.memo<ComponentProps>(({ title, onPress }) => {
  // Component logic
});

// Screen Component
const ScreenName: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Screen content */}
    </SafeAreaView>
  );
};
```

## Common Styles
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

## Port Numbers & URLs
```bash
# Metro Bundler
http://localhost:8081

# React Native Debugger
http://localhost:8081/debugger-ui/

# Expo DevTools
http://localhost:19002

# Android Emulator
adb reverse tcp:8081 tcp:8081

# iOS Simulator (default)
http://localhost:8081
```

## Common Issues and Solutions

### Issue: Metro bundler cache issues
```bash
# Solution
npx react-native start --reset-cache
cd android && ./gradlew clean && cd ..
```

### Issue: iOS Pod installation fails
```bash
# Solution
cd ios
pod deintegrate
pod cache clean --all
pod install
cd ..
```

### Issue: Android build fails
```bash
# Solution
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
npm run android
```

### Issue: TypeScript errors after adding new packages
```bash
# Solution
npm install --save-dev @types/<package-name>
npx tsc --noEmit
```

### Issue: React Native Vector Icons not working
```bash
# Android: Add to android/app/build.gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"

# iOS: Run
cd ios && pod install
```

### Issue: Git pre-commit hooks failing
```bash
# Solution (bypass hooks temporarily)
git commit --no-verify -m "commit message"

# Fix linting issues
npm run lint:fix
npm run format
```

### Issue: Peer dependency conflicts
```bash
# Solution
npm install <package> --legacy-peer-deps
```

## Environment Variables
```bash
# .env.example structure
API_URL=https://api.pairity.com
GOOGLE_MAPS_API_KEY=your_key_here
FACEBOOK_APP_ID=your_app_id
GOOGLE_CLIENT_ID=your_client_id
SENTRY_DSN=your_sentry_dsn
STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## API Endpoints (Common Structure)
```typescript
// Base URL
const BASE_URL = process.env.API_URL || 'https://api.pairity.com';

// Auth Endpoints
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/logout
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password

// User Endpoints
GET    /api/users/profile
PUT    /api/users/profile
DELETE /api/users/profile
GET    /api/users/discover
POST   /api/users/upload-photo

// Matching Endpoints
POST   /api/matches/swipe
GET    /api/matches
GET    /api/matches/:id
DELETE /api/matches/:id

// Chat Endpoints
GET    /api/chats
GET    /api/chats/:id/messages
POST   /api/chats/:id/messages
DELETE /api/chats/:id/messages/:messageId

// Premium Endpoints
GET    /api/premium/plans
POST   /api/premium/subscribe
DELETE /api/premium/cancel
```

## Database Schema (Common Tables)
```sql
-- Users table
users: id, email, password, name, age, bio, photos[], location, created_at

-- Profiles table  
profiles: user_id, interests[], preferences, prompts[], verified, premium

-- Matches table
matches: id, user1_id, user2_id, matched_at, is_mutual

-- Messages table
messages: id, chat_id, sender_id, content, type, created_at, read_at

-- Swipes table
swipes: id, swiper_id, swiped_id, action, created_at
```

## Deployment Notes
```bash
# Android Release Build
cd android
./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab

# iOS Release Build (Mac only)
cd ios
xcodebuild -workspace Pairity.xcworkspace -scheme Pairity -configuration Release archive

# Expo Deployment
expo build:android -t app-bundle
expo build:ios
expo publish
```

## Performance Tips
- Use React.memo for components that don't need frequent re-renders
- Use useMemo and useCallback for expensive computations
- Implement lazy loading for images with react-native-fast-image
- Use FlatList instead of ScrollView for long lists
- Implement pagination for data fetching
- Use InteractionManager for expensive operations after animations