# Pairity Premium UI Design System

## Design Philosophy
A sophisticated, minimalist design language that conveys exclusivity and premium quality through subtle elegance rather than ostentation. Every interaction should feel smooth, intentional, and luxurious.

---

## Color Palette

### Primary Colors
```css
/* Dark Elegance Theme */
--primary-black: #0A0A0B;        /* Deep black for backgrounds */
--rich-charcoal: #1A1A1C;        /* Card backgrounds */
--soft-graphite: #2A2A2D;        /* Elevated surfaces */
--muted-silver: #3A3A3F;         /* Borders and dividers */

/* Accent Colors */
--royal-gold: #D4AF37;           /* Premium accents, Super Like */
--champagne-gold: #F7E7CE;       /* Soft gold highlights */
--emerald-green: #10B981;        /* Match success */
--ruby-red: #DC2626;             /* Pass/Decline */
--sapphire-blue: #3B82F6;        /* Like/Primary actions */

/* Text Colors */
--text-primary: #FFFFFF;          /* Main text */
--text-secondary: #A1A1AA;       /* Secondary text */
--text-muted: #71717A;           /* Muted labels */
--text-gold: #D4AF37;            /* Premium text */
```

### Gradient Combinations
```css
/* Premium Gradients */
--gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%);
--gradient-dark: linear-gradient(180deg, #0A0A0B 0%, #1A1A1C 100%);
--gradient-premium: linear-gradient(135deg, #D4AF37 0%, #B8860B 50%, #F7E7CE 100%);
--gradient-match: linear-gradient(135deg, #10B981 0%, #34D399 100%);
--gradient-superlike: linear-gradient(135deg, #3B82F6 0%, #D4AF37 100%);
```

---

## Typography

### Font Stack
```css
/* Primary Font - SF Pro Display for iOS feel */
--font-primary: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Display Font - Playfair Display for elegance */
--font-display: 'Playfair Display', 'Georgia', serif;

/* Mono Font - For numbers/stats */
--font-mono: 'SF Mono', 'Monaco', monospace;
```

### Type Scale
```css
/* Headings */
--h1: 700 48px/1.2 var(--font-display);   /* Hero titles */
--h2: 600 32px/1.3 var(--font-primary);   /* Section headers */
--h3: 600 24px/1.4 var(--font-primary);   /* Card titles */
--h4: 500 20px/1.4 var(--font-primary);   /* Subtitles */

/* Body */
--body-large: 400 18px/1.6 var(--font-primary);
--body-regular: 400 16px/1.5 var(--font-primary);
--body-small: 400 14px/1.5 var(--font-primary);

/* Special */
--caption: 500 12px/1.4 var(--font-primary);
--button: 600 16px/1 var(--font-primary);
--badge: 700 10px/1 var(--font-primary);
```

---

## Component Designs

### Navigation Bar
```typescript
// Premium Navigation Bar Component
export const NavigationBar = styled.View`
  background: rgba(10, 10, 11, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 0.5px solid rgba(212, 175, 55, 0.1);
  padding: ${SafeArea.top + 16}px 20px 16px;
  
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 10px;
  elevation: 5;
`;

// Tab Bar Design
export const TabBar = styled.View`
  background: rgba(26, 26, 28, 0.98);
  backdrop-filter: blur(30px);
  border-top: 0.5px solid rgba(212, 175, 55, 0.1);
  padding-bottom: ${SafeArea.bottom}px;
  
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  height: 65px;
`;

// Tab Icon Animation
const TabIcon = ({ focused, icon }) => (
  <Animated.View
    style={{
      transform: [{ scale: focused ? 1.1 : 1 }],
      opacity: focused ? 1 : 0.6,
    }}
  >
    <Icon 
      name={icon} 
      color={focused ? '#D4AF37' : '#71717A'}
      size={24}
    />
    {focused && (
      <View style={styles.activeIndicator} />
    )}
  </Animated.View>
);
```

### Swipe Cards
```typescript
// Premium Card Design
const SwipeCard = styled.View`
  background: linear-gradient(180deg, rgba(26, 26, 28, 0.9) 0%, rgba(10, 10, 11, 0.95) 100%);
  border-radius: 24px;
  overflow: hidden;
  
  /* Gold shimmer border */
  border: 1px solid transparent;
  background-clip: padding-box;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0; right: 0; bottom: 0; left: 0;
    z-index: -1;
    margin: -1px;
    border-radius: 24px;
    background: linear-gradient(135deg, #D4AF37, transparent, #D4AF37);
    opacity: 0.3;
  }
  
  /* Subtle shadow */
  shadow-color: #000;
  shadow-offset: 0px 10px;
  shadow-opacity: 0.3;
  shadow-radius: 20px;
  elevation: 10;
`;

// Card Content Layout
const CardContent = () => (
  <View style={styles.cardContainer}>
    {/* Main Photo with Gradient Overlay */}
    <ImageBackground source={photo} style={styles.cardImage}>
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradient}
      >
        {/* Verification Badge */}
        <View style={styles.verifiedBadge}>
          <Icon name="verified" size={16} color="#D4AF37" />
          <Text style={styles.verifiedText}>Verified</Text>
        </View>
        
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>Alexandra, 26</Text>
          <View style={styles.locationRow}>
            <Icon name="location" size={14} color="#A1A1AA" />
            <Text style={styles.location}>5 km away</Text>
          </View>
        </View>
        
        {/* Compatibility Score */}
        <View style={styles.compatibilityBadge}>
          <Text style={styles.compatibilityScore}>87%</Text>
          <Text style={styles.compatibilityLabel}>Match</Text>
        </View>
      </LinearGradient>
    </ImageBackground>
    
    {/* Bio Section */}
    <View style={styles.bioSection}>
      <Text style={styles.bioText}>
        Wine enthusiast, sunset chaser, and forever curious about the world...
      </Text>
    </View>
    
    {/* Interests Pills */}
    <ScrollView horizontal style={styles.interests}>
      {['Travel', 'Wine', 'Yoga', 'Photography'].map(interest => (
        <View key={interest} style={styles.interestPill}>
          <Text style={styles.interestText}>{interest}</Text>
        </View>
      ))}
    </ScrollView>
  </View>
);
```

### Action Buttons
```typescript
// Floating Action Buttons
const ActionButtonsContainer = styled.View`
  position: absolute;
  bottom: 30px;
  width: 100%;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 0 40px;
`;

const ActionButton = ({ type, onPress }) => {
  const configs = {
    pass: {
      icon: 'close',
      color: '#DC2626',
      size: 60,
      gradient: ['#DC2626', '#EF4444']
    },
    like: {
      icon: 'heart',
      color: '#10B981',
      size: 70,
      gradient: ['#10B981', '#34D399']
    },
    superlike: {
      icon: 'star',
      color: '#D4AF37',
      size: 60,
      gradient: ['#D4AF37', '#F7E7CE']
    }
  };
  
  const config = configs[type];
  
  return (
    <TouchableOpacity onPress={onPress}>
      <LinearGradient
        colors={config.gradient}
        style={[styles.actionButton, { width: config.size, height: config.size }]}
      >
        <Icon name={config.icon} size={config.size * 0.5} color="white" />
      </LinearGradient>
      
      {/* Ripple Effect on Press */}
      <Animated.View style={styles.ripple} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    
    // Glass effect
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  }
});
```

### Match Modal
```typescript
// Premium Match Celebration Modal
const MatchModal = ({ match, onContinue }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Confetti animation
    startConfetti();
  }, []);
  
  return (
    <BlurView intensity={95} style={StyleSheet.absoluteFill}>
      <Animated.View style={[
        styles.modalContent,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        }
      ]}>
        {/* Match Header */}
        <View style={styles.matchHeader}>
          <LottieView
            source={require('./animations/gold-sparkle.json')}
            autoPlay
            loop
            style={styles.sparkleAnimation}
          />
          <Text style={styles.matchTitle}>It's a Match!</Text>
          <Text style={styles.matchSubtitle}>
            You and {match.name} liked each other
          </Text>
        </View>
        
        {/* Profile Photos */}
        <View style={styles.photosContainer}>
          <View style={styles.photoWrapper}>
            <Image source={currentUser.photo} style={styles.matchPhoto} />
            <View style={styles.photoGlow} />
          </View>
          
          <View style={styles.heartContainer}>
            <LottieView
              source={require('./animations/heart-pulse.json')}
              autoPlay
              loop
              style={styles.heartAnimation}
            />
          </View>
          
          <View style={styles.photoWrapper}>
            <Image source={match.photo} style={styles.matchPhoto} />
            <View style={styles.photoGlow} />
          </View>
        </View>
        
        {/* Action Buttons */}
        <TouchableOpacity style={styles.sendMessageButton} onPress={onSendMessage}>
          <LinearGradient
            colors={['#D4AF37', '#F7E7CE']}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Send a Message</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.keepSwipingButton} onPress={onContinue}>
          <Text style={styles.keepSwipingText}>Keep Swiping</Text>
        </TouchableOpacity>
      </Animated.View>
    </BlurView>
  );
};
```

### Chat Interface
```typescript
// Premium Chat Design
const ChatScreen = () => (
  <View style={styles.container}>
    {/* Chat Header */}
    <View style={styles.chatHeader}>
      <BlurView intensity={95} style={styles.headerBlur}>
        <TouchableOpacity style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#D4AF37" />
        </TouchableOpacity>
        
        <View style={styles.userInfo}>
          <Image source={user.photo} style={styles.avatar} />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name}</Text>
            <View style={styles.onlineIndicator}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Active now</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.videoCallButton}>
          <Icon name="video" size={24} color="#D4AF37" />
        </TouchableOpacity>
      </BlurView>
    </View>
    
    {/* Messages */}
    <ScrollView style={styles.messagesContainer}>
      <MessageBubble sent>
        <Text style={styles.messageText}>
          Hey! I noticed we both love hiking 🏔️
        </Text>
        <Text style={styles.messageTime}>10:30 AM</Text>
        <View style={styles.readReceipt}>
          <Icon name="check-double" size={12} color="#D4AF37" />
        </View>
      </MessageBubble>
      
      <MessageBubble>
        <Text style={styles.messageText}>
          Yes! Have you been to the Western Ghats?
        </Text>
        <Text style={styles.messageTime}>10:32 AM</Text>
      </MessageBubble>
    </ScrollView>
    
    {/* Input Bar */}
    <View style={styles.inputContainer}>
      <BlurView intensity={95} style={styles.inputBar}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="attach" size={20} color="#71717A" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#71717A"
        />
        
        <TouchableOpacity style={styles.sendButton}>
          <LinearGradient
            colors={['#D4AF37', '#F7E7CE']}
            style={styles.sendButtonGradient}
          >
            <Icon name="send" size={18} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </View>
  </View>
);

const MessageBubble = styled.View`
  max-width: 75%;
  padding: 12px 16px;
  margin: 8px 16px;
  border-radius: 20px;
  
  ${props => props.sent ? `
    align-self: flex-end;
    background: linear-gradient(135deg, #D4AF37, #B8860B);
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: rgba(42, 42, 45, 0.9);
    border-bottom-left-radius: 4px;
  `}
`;
```

### Profile Screen
```typescript
// Premium Profile Layout
const ProfileScreen = () => (
  <ScrollView style={styles.container}>
    {/* Hero Section */}
    <View style={styles.heroSection}>
      <ImageBackground source={coverPhoto} style={styles.coverPhoto}>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.coverGradient}
        >
          <TouchableOpacity style={styles.editCoverButton}>
            <Icon name="camera" size={20} color="white" />
          </TouchableOpacity>
        </LinearGradient>
      </ImageBackground>
      
      {/* Profile Photo */}
      <View style={styles.profilePhotoContainer}>
        <Image source={profilePhoto} style={styles.profilePhoto} />
        <View style={styles.verificationBadge}>
          <Icon name="verified" size={24} color="#D4AF37" />
        </View>
        <TouchableOpacity style={styles.editPhotoButton}>
          <Icon name="edit" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
    
    {/* Profile Info */}
    <View style={styles.profileInfo}>
      <Text style={styles.profileName}>Alexandra Mitchell</Text>
      <Text style={styles.profileAge}>26 years old</Text>
      
      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatCard
          icon="fire"
          value="87%"
          label="Profile Score"
          gradient={['#D4AF37', '#F7E7CE']}
        />
        <StatCard
          icon="heart"
          value="234"
          label="Likes"
          gradient={['#10B981', '#34D399']}
        />
        <StatCard
          icon="eye"
          value="1.2k"
          label="Views"
          gradient={['#3B82F6', '#60A5FA']}
        />
      </View>
    </View>
    
    {/* Premium Features */}
    <View style={styles.premiumSection}>
      <LinearGradient
        colors={['#D4AF37', '#B8860B', '#F7E7CE']}
        style={styles.premiumCard}
      >
        <View style={styles.premiumHeader}>
          <Icon name="crown" size={24} color="white" />
          <Text style={styles.premiumTitle}>Premium Member</Text>
        </View>
        <Text style={styles.premiumExpiry}>Active until Feb 13, 2025</Text>
        
        <View style={styles.premiumFeatures}>
          <FeatureItem icon="infinity" text="Unlimited Swipes" />
          <FeatureItem icon="star" text="3 Super Likes Daily" />
          <FeatureItem icon="rocket" text="Weekly Profile Boost" />
          <FeatureItem icon="eye" text="See Who Likes You" />
        </View>
      </LinearGradient>
    </View>
    
    {/* Photo Grid */}
    <View style={styles.photoGrid}>
      <Text style={styles.sectionTitle}>My Photos</Text>
      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <TouchableOpacity key={index} style={styles.gridPhoto}>
            <Image source={photo} style={styles.photo} />
            {index === 0 && (
              <View style={styles.primaryBadge}>
                <Text style={styles.primaryText}>Primary</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addPhotoButton}>
          <Icon name="add" size={32} color="#D4AF37" />
        </TouchableOpacity>
      </View>
    </View>
  </ScrollView>
);
```

---

## Animations & Micro-interactions

### Swipe Gestures
```typescript
// Smooth swipe with haptic feedback
const handleSwipe = (direction: 'left' | 'right' | 'up') => {
  // Haptic feedback
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  
  // Card animation
  Animated.parallel([
    Animated.spring(translateX, {
      toValue: direction === 'left' ? -SCREEN_WIDTH * 1.5 : 
               direction === 'right' ? SCREEN_WIDTH * 1.5 : 0,
      useNativeDriver: true,
    }),
    Animated.spring(translateY, {
      toValue: direction === 'up' ? -SCREEN_HEIGHT : 0,
      useNativeDriver: true,
    }),
    Animated.timing(opacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }),
    Animated.spring(rotate, {
      toValue: direction === 'left' ? '-30deg' : 
               direction === 'right' ? '30deg' : '0deg',
      useNativeDriver: true,
    }),
  ]).start();
};
```

### Loading States
```typescript
// Skeleton loading with shimmer effect
const SkeletonCard = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);
  
  return (
    <View style={styles.skeletonCard}>
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity: shimmerAnim,
            transform: [{
              translateX: shimmerAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-200, 200],
              }),
            }],
          },
        ]}
      />
    </View>
  );
};
```

### Match Celebration
```typescript
// Confetti and particle effects
const MatchCelebration = () => {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Gold Confetti */}
      <ConfettiCannon
        count={50}
        origin={{ x: SCREEN_WIDTH / 2, y: -10 }}
        colors={['#D4AF37', '#F7E7CE', '#B8860B']}
        fadeOut
      />
      
      {/* Heart Particles */}
      {[...Array(20)].map((_, i) => (
        <Animated.View
          key={i}
          style={[
            styles.heartParticle,
            {
              transform: [
                { translateY: heartAnimation },
                { scale: scaleAnimation },
                { rotate: rotateAnimation },
              ],
              opacity: opacityAnimation,
            },
          ]}
        >
          <Icon name="heart" size={20} color="#D4AF37" />
        </Animated.View>
      ))}
    </View>
  );
};
```

---

## Screen Layouts

### Onboarding Flow
```
1. Welcome Screen
   - Fullscreen video background
   - Animated logo reveal
   - "Enter Exclusive Dating" CTA
   
2. Phone Verification
   - Minimal design
   - Auto-focus on input
   - Animated progress indicator
   
3. Profile Setup
   - Step-by-step wizard
   - Progress bar at top
   - Skip option for non-essential fields
   
4. Photo Upload
   - Grid layout (3x3)
   - Drag to reorder
   - AI photo suggestions
   
5. Preferences
   - Slider components
   - Visual representations
   - Smart defaults
```

### Main App Structure
```
TabNavigator
├── Discover (Swipe)
│   ├── Daily Queue
│   ├── Discover Mode
│   └── Profile Preview Modal
├── Likes
│   ├── Likes Grid
│   ├── Super Likes Section
│   └── Boost Status
├── Matches
│   ├── Active Matches
│   ├── Expired Matches
│   └── Chat List
├── Messages
│   ├── Conversations
│   ├── Chat Screen
│   └── Video Call
└── Profile
    ├── Edit Profile
    ├── Settings
    ├── Subscription
    └── Help
```

---

## Responsive Design

### Screen Adaptations
```typescript
// Responsive sizing
const styles = StyleSheet.create({
  container: {
    padding: isSmallDevice ? 16 : 24,
  },
  
  cardHeight: {
    height: SCREEN_HEIGHT * (isSmallDevice ? 0.65 : 0.7),
  },
  
  fontSize: {
    fontSize: isSmallDevice ? 14 : 16,
  },
  
  buttonSize: {
    width: isSmallDevice ? 50 : 60,
    height: isSmallDevice ? 50 : 60,
  },
});

// Safe area handling
const SafeAreaContainer = ({ children }) => (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar barStyle="light-content" backgroundColor="#0A0A0B" />
    {children}
  </SafeAreaView>
);
```

---

## Accessibility

### VoiceOver Support
```typescript
// Accessibility labels
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Like profile"
  accessibilityHint="Double tap to like this person"
  accessibilityRole="button"
>
  <Icon name="heart" />
</TouchableOpacity>

// Dynamic announcements
AccessibilityInfo.announceForAccessibility('New match with Alexandra');
```

### Dark Mode (Default)
The app uses dark mode by default for a premium feel, with no light mode option to maintain brand consistency.

---

## Performance Optimizations

### Image Loading
```typescript
// Progressive image loading with blur
<FastImage
  source={{ uri: imageUrl }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
  onLoadStart={() => setLoading(true)}
  onLoadEnd={() => setLoading(false)}
>
  {loading && (
    <BlurView intensity={20} style={StyleSheet.absoluteFill} />
  )}
</FastImage>
```

### List Optimization
```typescript
// Virtualized lists for matches
<FlatList
  data={matches}
  renderItem={renderMatch}
  keyExtractor={item => item.id}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={10}
/>
```

---

## Brand Elements

### Logo Variations
- Primary: Gold gradient logo on dark background
- Secondary: White logo for overlays
- Animated: Subtle pulse effect on loading

### Iconography
- Custom icon set with rounded corners
- Consistent 2px stroke width
- Gold accent for active states

### Sound Design
- Subtle haptic feedback for all interactions
- Soft chime for matches
- Gentle swoosh for swipes
- Premium notification sound

---

## Implementation Notes

1. **Performance First**: All animations at 60fps using native driver
2. **Consistency**: Reusable components for all UI elements
3. **Accessibility**: Full VoiceOver and TalkBack support
4. **Testing**: Snapshot tests for all screens
5. **Analytics**: Track every interaction for UX optimization