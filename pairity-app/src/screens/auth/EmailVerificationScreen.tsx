import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomButton from '@/components/CustomButton';

interface EmailVerificationScreenProps {}

interface RouteParams {
  email: string;
}

type VerificationStatus = 'checking' | 'success' | 'failed' | 'timeout';

const EmailVerificationScreen: React.FC<EmailVerificationScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { email } = route.params as RouteParams;
  
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('checking');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Animation values
  const pulseAnimation = useSharedValue(1);
  const rotateAnimation = useSharedValue(0);
  const successScale = useSharedValue(0);
  const failureShake = useSharedValue(0);

  // Start animations
  useEffect(() => {
    // Pulse animation for checking state
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    // Rotate animation for loading
    rotateAnimation.value = withRepeat(
      withTiming(360, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setVerificationStatus('timeout');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCooldown]);

  // Simulate verification check
  useEffect(() => {
    const checkVerification = async () => {
      try {
        // TODO: Replace with actual API call to check verification status
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Simulate random success/failure for demo
        const isSuccess = Math.random() > 0.3;
        
        if (isSuccess) {
          setVerificationStatus('success');
          successScale.value = withSequence(
            withTiming(1.2, { duration: 300 }),
            withTiming(1, { duration: 200 })
          );
        } else {
          setVerificationStatus('failed');
          failureShake.value = withSequence(
            withTiming(-10, { duration: 100 }),
            withTiming(10, { duration: 100 }),
            withTiming(-10, { duration: 100 }),
            withTiming(0, { duration: 100 })
          );
        }
      } catch (error) {
        setVerificationStatus('failed');
      }
    };

    if (verificationStatus === 'checking') {
      checkVerification();
    }
  }, [verificationStatus]);

  const handleResendEmail = async () => {
    if (!canResend || resendCooldown > 0) return;

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      Alert.alert(
        'Email Sent',
        'A new verification email has been sent to your email address.'
      );

      setCanResend(false);
      setResendCooldown(60); // 1 minute cooldown
      setVerificationStatus('checking');
      setTimeLeft(300); // Reset timer

    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to resend verification email. Please try again later.'
      );
    }
  };

  const handleContinue = () => {
    if (verificationStatus === 'success') {
      // Navigate to profile setup or main app
      navigation.navigate('Main' as never);
    } else {
      // Navigate back to login
      navigation.navigate('Login' as never);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Animated styles
  const pulseAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseAnimation.value }],
    };
  });

  const rotateAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotateAnimation.value}deg` }],
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
    };
  });

  const failureAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: failureShake.value }],
    };
  });

  const renderContent = () => {
    switch (verificationStatus) {
      case 'checking':
        return (
          <View style={styles.statusContainer}>
            <Animated.View style={[styles.iconContainer, pulseAnimatedStyle]}>
              <Animated.View style={rotateAnimatedStyle}>
                <Icon name="email" size={64} color="#FF6B6B" />
              </Animated.View>
            </Animated.View>
            
            <Text style={styles.title}>Checking Verification</Text>
            <Text style={styles.message}>
              We're checking if you've verified your email address...
            </Text>
            
            <View style={styles.timerContainer}>
              <Icon name="timer" size={20} color="#666" />
              <Text style={styles.timerText}>
                Time remaining: {formatTime(timeLeft)}
              </Text>
            </View>
          </View>
        );

      case 'success':
        return (
          <View style={styles.statusContainer}>
            <Animated.View style={[styles.iconContainer, successAnimatedStyle]}>
              <View style={[styles.successIconContainer]}>
                <Icon name="check-circle" size={64} color="#51CF66" />
              </View>
            </Animated.View>
            
            <Text style={[styles.title, styles.successTitle]}>Email Verified!</Text>
            <Text style={styles.message}>
              Great! Your email has been successfully verified. You can now access all features of Pairity.
            </Text>
          </View>
        );

      case 'failed':
        return (
          <Animated.View style={[styles.statusContainer, failureAnimatedStyle]}>
            <View style={styles.iconContainer}>
              <View style={styles.errorIconContainer}>
                <Icon name="error" size={64} color="#FF6B6B" />
              </View>
            </View>
            
            <Text style={[styles.title, styles.errorTitle]}>Verification Failed</Text>
            <Text style={styles.message}>
              We couldn't verify your email. The verification link may have expired or been used already.
            </Text>
          </Animated.View>
        );

      case 'timeout':
        return (
          <View style={styles.statusContainer}>
            <View style={styles.iconContainer}>
              <View style={styles.timeoutIconContainer}>
                <Icon name="access-time" size={64} color="#FFD43B" />
              </View>
            </View>
            
            <Text style={[styles.title, styles.timeoutTitle]}>Verification Timeout</Text>
            <Text style={styles.message}>
              The verification process has timed out. Please request a new verification email.
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}

        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>Verification email sent to:</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {verificationStatus === 'checking' && (
            <CustomButton
              title="Check Again"
              onPress={() => setVerificationStatus('checking')}
              variant="outline"
              size="large"
              fullWidth
              style={styles.actionButton}
            />
          )}

          {(verificationStatus === 'failed' || verificationStatus === 'timeout') && (
            <CustomButton
              title={`Resend Email ${resendCooldown > 0 ? `(${resendCooldown}s)` : ''}`}
              onPress={handleResendEmail}
              variant="primary"
              size="large"
              fullWidth
              disabled={!canResend || resendCooldown > 0}
              style={styles.actionButton}
            />
          )}

          <CustomButton
            title={verificationStatus === 'success' ? 'Continue' : 'Back to Login'}
            onPress={handleContinue}
            variant={verificationStatus === 'success' ? 'primary' : 'outline'}
            size="large"
            fullWidth
            style={styles.actionButton}
          />
        </View>

        {verificationStatus !== 'success' && (
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Don't see the email? Check your spam folder or{' '}
              <Text style={styles.helpLink} onPress={handleResendEmail}>
                resend verification email
              </Text>
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 24,
  },
  successIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeoutIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  successTitle: {
    color: '#51CF66',
  },
  errorTitle: {
    color: '#FF6B6B',
  },
  timeoutTitle: {
    color: '#FFD43B',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    fontWeight: '600',
  },
  emailContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 24,
  },
  actionButton: {
    marginBottom: 12,
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  helpLink: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default EmailVerificationScreen;