# Pairity - Developer Guide

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm run web       # Web Browser
```

## 📁 Project Structure

```
pairity/
├── src/
│   ├── assets/          # Images, fonts, icons
│   ├── components/      # Reusable components
│   ├── config/          # App configuration
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── navigation/      # Navigation setup
│   ├── screens/         # Screen components
│   ├── services/        # API services
│   ├── store/           # Redux store
│   ├── styles/          # Global styles
│   ├── types/           # TypeScript types
│   └── utils/           # Utility functions
├── docs/                # Documentation
├── prompts/             # Development prompts
├── .husky/              # Git hooks
├── App.js               # Entry point
└── package.json         # Dependencies
```

## 🛠️ Development Setup

### Environment Variables

**Important:** Environment files (`.env.development`, `.env.production`) should NEVER be committed to source control!

1. Run the setup script to create your environment files:
```bash
npm run setup:env
```

2. Update the values in `.env.development` with your development API endpoints and keys.

3. Update `.env.production` with production values when deploying.

**Security Notes:**
- Only `.env.example` should be in source control
- `.env.development` and `.env.production` are automatically ignored by git
- Never share or commit real API keys or secrets
- Use different keys for development and production environments

### Code Quality

#### Linting
```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
```

#### Formatting
```bash
npm run format      # Format all files
npm run format:check # Check formatting
```

#### Type Checking
```bash
npm run typecheck   # Run TypeScript type checking
```

#### Validation (All checks)
```bash
npm run validate    # Run lint, format:check, and typecheck
```

### Git Hooks

Pre-commit hooks are automatically set up with Husky:
- **Pre-commit**: Runs ESLint and Prettier on staged files
- **Commit-msg**: Validates commit message format

### Commit Message Format

Follow the conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Other changes
- `ui`: UI/UX changes
- `api`: API changes

Example:
```bash
git commit -m "feat(auth): add biometric authentication"
```

## 🔧 Available Scripts

### Development
- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web

### Testing
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report

### Building
- `npm run build:android` - Build Android APK
- `npm run build:ios` - Build iOS IPA

### Utilities
- `npm run clean` - Clean node_modules and build files
- `npm run clean:cache` - Clear Expo cache
- `npm run reset` - Clean and reinstall dependencies

## 🎨 Styling Guidelines

### Colors
- Primary Black: `#0A0A0B`
- Secondary Black: `#141415`
- Royal Gold: `#D4AF37`
- Error Red: `#E74C3C`
- Success Green: `#27AE60`

### Typography
- Headers: Playfair Display
- Body: Inter

### Components
All components should follow the premium dark theme design system defined in `docs/premium-ui-design-system.md`.

## 📦 State Management

Redux Toolkit is used for state management:

```javascript
// Example: Using Redux hooks
import { useSelector, useDispatch } from 'react-redux';
import { selectUser } from '@store/slices/userSlice';

const user = useSelector(selectUser);
const dispatch = useDispatch();
```

## 🔌 API Integration

All API calls go through the centralized API client:

```javascript
import api from '@services/api';

// Example API call
const response = await api.post('/auth/login', { email, password });
```

## 📱 Navigation

React Navigation is used for navigation:

```javascript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('ScreenName', { params });
```

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
Place integration tests in `__tests__` directories within each module.

### E2E Tests
Coming soon with Detox integration.

## 🚢 Deployment

### Development Build
```bash
eas build --platform android --profile development
eas build --platform ios --profile development
```

### Production Build
```bash
eas build --platform android --profile production
eas build --platform ios --profile production
```

### Submit to Stores
```bash
eas submit --platform android
eas submit --platform ios
```

## 📚 Additional Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Navigation Documentation](https://reactnavigation.org/)

## 🐛 Debugging

### React Native Debugger
1. Install React Native Debugger
2. Run the app with `npm start`
3. Press `d` in the terminal to open developer menu
4. Select "Debug Remote JS"

### Flipper
1. Install Flipper
2. Run the app
3. Connect through Flipper

### Console Logs
View logs in terminal or use:
```bash
npx react-native log-android
npx react-native log-ios
```

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run validation: `npm run validate`
5. Commit with conventional commits
6. Push and create a pull request

## 📝 License

Copyright © 2024 Pairity. All rights reserved.