# Pairity - Premium Dating App Frontend

## Overview
This is the frontend implementation of Pairity, a premium dating app with a sophisticated dark theme and gold accents. The app features a complete authentication flow with login, registration, and password reset functionality.

## Features Implemented

### 🔐 Authentication Screens
1. **Login Screen**
   - Email and password inputs with validation
   - Show/Hide password toggle
   - Remember me functionality
   - Social login buttons (Google, Apple)
   - Forgot password link
   - Animated entrance effects
   - Test credentials display

2. **Registration Screen**
   - Multi-step form with progress indicator
   - Gender selection with pricing display
   - Birth date validation (18+ requirement)
   - Password strength requirements
   - Terms and conditions acceptance
   - Referral code input
   - Phone number with country code

3. **Forgot Password Screen**
   - 3-step password reset flow
   - Email verification
   - OTP input with auto-focus
   - New password creation
   - Resend OTP with timer
   - Progress indicators

## Design System

### Color Palette
- **Primary Black**: #0A0A0B (Background)
- **Royal Gold**: #D4AF37 (Premium accents)
- **Rich Charcoal**: #1A1A1C (Cards)
- **Soft Graphite**: #2A2A2D (Input fields)

### Typography
- Display: Playfair Display (Elegant headers)
- Body: SF Pro Display / System fonts
- Consistent type scale from 48px to 10px

### Premium Features
- Linear gradients for buttons
- Blur effects for overlays
- Smooth animations (60fps)
- Haptic feedback on interactions
- Shadow effects for depth

## Test Credentials

### Male User (Paid - ₹5000/month)
- Email: `male@test.com`
- Password: `password123`

### Female User (Free lifetime access)
- Email: `female@test.com`
- Password: `password123`

### Forgot Password OTP
- Test OTP: `123456`

## Installation

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Emulator

### Setup Steps

1. **Install Dependencies**
```bash
npm install
```

2. **Install Expo CLI (if not installed)**
```bash
npm install -g expo-cli
```

3. **Start the Development Server**
```bash
npm start
# or
expo start
```

4. **Run on Simulator/Emulator**
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## Project Structure

```
pairity/
├── App.js                 # Main app entry point
├── src/
│   ├── screens/
│   │   └── auth/         # Authentication screens
│   │       ├── LoginScreen.js
│   │       ├── RegisterScreen.js
│   │       └── ForgotPasswordScreen.js
│   ├── navigation/
│   │   └── AuthNavigator.js  # Navigation setup
│   ├── styles/
│   │   ├── colors.js         # Color palette
│   │   ├── typography.js     # Font styles
│   │   └── commonStyles.js   # Reusable styles
│   └── components/           # Reusable components
├── assets/                   # Images and fonts
└── package.json             # Dependencies

```

## Navigation Flow

```
Login Screen
    ├── Register Screen
    ├── Forgot Password Screen
    │   ├── Email Step
    │   ├── OTP Verification Step
    │   └── New Password Step
    └── Home Screen (after login)
```

## Form Validations

### Email Validation
- Required field
- Valid email format

### Password Validation
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Phone Validation
- 10 digits for Indian numbers
- Country code support

### Age Validation
- Must be 18 years or older

## Animations & Interactions

- **Entrance Animations**: Fade and slide effects on screen load
- **Button Press**: Scale and opacity animations
- **Input Focus**: Border color change with gold accent
- **Haptic Feedback**: Light, medium, and notification haptics
- **Loading States**: Activity indicators with disabled states

## Known Issues / TODOs

- [ ] Connect to backend API
- [ ] Implement actual authentication logic
- [ ] Add biometric authentication
- [ ] Implement deep linking
- [ ] Add push notifications
- [ ] Create home screen after login
- [ ] Add profile creation flow
- [ ] Implement swipe cards UI
- [ ] Add chat interface
- [ ] Create match celebration screen

## Development Notes

### Running on Different Platforms

**iOS (Mac only):**
```bash
npm run ios
```

**Android:**
```bash
npm run android
```

**Web:**
```bash
npm run web
```

### Building for Production

**iOS:**
```bash
expo build:ios
```

**Android:**
```bash
expo build:android
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues:**
```bash
npx react-native start --reset-cache
```

2. **iOS Simulator not opening:**
- Make sure Xcode is installed
- Open Xcode > Preferences > Locations > Command Line Tools

3. **Android Emulator not found:**
- Ensure Android Studio is installed
- Create AVD through Android Studio
- Set ANDROID_HOME environment variable

4. **Dependencies issues:**
```bash
rm -rf node_modules
npm install
cd ios && pod install  # iOS only
```

## Contributing

This is a frontend-only implementation. To connect with backend:

1. Update API endpoints in services files
2. Replace hardcoded authentication logic
3. Implement token storage using AsyncStorage
4. Add API interceptors for auth headers
5. Implement proper error handling

## License

Private and Confidential - Pairity © 2025# Pairity
