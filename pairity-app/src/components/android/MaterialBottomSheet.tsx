import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  PanResponder,
  Platform,
  BackHandler,
} from 'react-native';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface MaterialBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: number | 'auto';
  showHandle?: boolean;
  dismissible?: boolean;
  fullScreen?: boolean;
  scrollable?: boolean;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MaterialBottomSheet: React.FC<MaterialBottomSheetProps> = ({
  visible,
  onClose,
  title,
  children,
  height = 'auto',
  showHandle = true,
  dismissible = true,
  fullScreen = false,
  scrollable = true,
}) => {
  const theme = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const sheetHeight = fullScreen 
    ? SCREEN_HEIGHT * 0.9 
    : height === 'auto' 
      ? SCREEN_HEIGHT * 0.5 
      : height;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => dismissible,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return dismissible && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50 && gestureState.vy > 0.3) {
          closeSheet();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      closeSheet();
    }
  }, [visible]);

  useEffect(() => {
    if (Platform.OS === 'android' && visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (dismissible) {
          onClose();
          return true;
        }
        return false;
      });

      return () => backHandler.remove();
    }
  }, [visible, dismissible, onClose]);

  const openSheet = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="box-none">
      <TouchableOpacity
        style={[styles.backdrop, { opacity: 0.5 }]}
        activeOpacity={1}
        onPress={dismissible ? onClose : undefined}
      >
        <Animated.View
          style={[
            styles.backdropAnimated,
            {
              backgroundColor: '#000',
              opacity,
            },
          ]}
        />
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.colors.surface,
            height: sheetHeight,
            transform: [{ translateY }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {showHandle && (
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          </View>
        )}

        {title && (
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            {dismissible && (
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Text style={[styles.closeIcon, { color: theme.colors.textSecondary }]}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {scrollable ? (
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.contentContainer]}>
            {children}
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropAnimated: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.24,
    shadowRadius: 4,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(8),
  },
  handle: {
    width: moderateScale(32),
    height: moderateScale(4),
    borderRadius: moderateScale(2),
    opacity: 0.4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
  },
  title: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    flex: 1,
  },
  closeButton: {
    padding: moderateScale(8),
  },
  closeIcon: {
    fontSize: moderateScale(20),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: moderateScale(16),
    paddingBottom: moderateScale(16),
  },
});

export default MaterialBottomSheet;