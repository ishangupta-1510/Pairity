import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation, useRoute } from '@react-navigation/native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomTextInput from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';

// Password strength validation
const passwordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof passwordSchema>;

interface ResetPasswordScreenProps {}

interface RouteParams {
  token: string;
}

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
  suggestions: string[];
}

const ResetPasswordScreen: React.FC<ResetPasswordScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { token } = route.params as RouteParams;
  
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    label: 'Very Weak',
    color: '#FF6B6B',
    suggestions: [],
  });

  // Animation values
  const successScale = useSharedValue(0);
  const strengthBarWidth = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password');

  // Calculate password strength
  useEffect(() => {
    if (!passwordValue) {
      setPasswordStrength({
        score: 0,
        label: 'Very Weak',
        color: '#FF6B6B',
        suggestions: ['Enter a password'],
      });
      strengthBarWidth.value = withTiming(0);
      return;
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length check
    if (passwordValue.length >= 8) score += 1;
    else suggestions.push('At least 8 characters');

    // Character variety checks
    if (/[A-Z]/.test(passwordValue)) score += 1;
    else suggestions.push('One uppercase letter');

    if (/[a-z]/.test(passwordValue)) score += 1;
    else suggestions.push('One lowercase letter');

    if (/[0-9]/.test(passwordValue)) score += 1;
    else suggestions.push('One number');

    if (/[^A-Za-z0-9]/.test(passwordValue)) score += 1;
    else suggestions.push('One special character');

    // Additional complexity checks
    if (passwordValue.length >= 12) score += 1;
    if (/(?=.*[A-Z].*[A-Z])/.test(passwordValue)) score += 0.5; // Multiple uppercase
    if (/(?=.*[0-9].*[0-9])/.test(passwordValue)) score += 0.5; // Multiple numbers

    const maxScore = 7;
    const normalizedScore = Math.min(score / maxScore, 1);

    let label = 'Very Weak';
    let color = '#FF6B6B';

    if (normalizedScore >= 0.8) {
      label = 'Very Strong';
      color = '#51CF66';
    } else if (normalizedScore >= 0.6) {
      label = 'Strong';
      color = '#69DB7C';
    } else if (normalizedScore >= 0.4) {
      label = 'Good';
      color = '#FFD43B';
    } else if (normalizedScore >= 0.2) {
      label = 'Weak';
      color = '#FF8787';
    }

    setPasswordStrength({
      score: normalizedScore,
      label,
      color,
      suggestions: suggestions.slice(0, 3), // Show max 3 suggestions
    });

    strengthBarWidth.value = withSpring(normalizedScore);
  }, [passwordValue]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset password');
      }

      // Success animation
      successScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );

      setTimeout(() => {
        Alert.alert(
          'Password Reset Successful',
          'Your password has been reset successfully. You can now sign in with your new password.',
          [
            {
              text: 'Sign In',
              onPress: () => navigation.navigate('Login' as never),
            },
          ]
        );
      }, 800);

    } catch (error) {
      // Error animation
      shakeAnimation.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );

      Alert.alert(
        'Reset Failed',
        'Unable to reset your password. The link may have expired or is invalid. Please request a new reset link.',
        [
          {
            text: 'Request New Link',
            onPress: () => navigation.navigate('ForgotPassword' as never),
          },
          {
            text: 'Try Again',
            style: 'cancel',
          },
        ]
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Animated styles
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
    };
  });

  const strengthBarAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${strengthBarWidth.value * 100}%`,
      backgroundColor: passwordStrength.color,
    };
  });

  const shakeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.iconContainer, successAnimatedStyle]}>
            <Icon name="lock-reset" size={64} color="#FF6B6B" />
          </Animated.View>

          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.subtitle}>
            Your new password must be different from your previous password.
          </Text>

          <Animated.View style={[styles.form, shakeAnimatedStyle]}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  label="New Password"
                  placeholder="Enter your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  showPasswordToggle
                  leftIcon="lock"
                  error={errors.password?.message}
                  required
                />
              )}
            />

            {/* Password Strength Indicator */}
            {passwordValue && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthHeader}>
                  <Text style={styles.strengthLabel}>Password Strength</Text>
                  <Text style={[styles.strengthScore, { color: passwordStrength.color }]}>
                    {passwordStrength.label}
                  </Text>
                </View>
                
                <View style={styles.strengthBarContainer}>
                  <View style={styles.strengthBarBackground} />
                  <Animated.View style={[styles.strengthBarFill, strengthBarAnimatedStyle]} />
                </View>

                {passwordStrength.suggestions.length > 0 && (
                  <View style={styles.suggestionsContainer}>
                    <Text style={styles.suggestionsTitle}>Requirements:</Text>
                    {passwordStrength.suggestions.map((suggestion, index) => (
                      <View key={index} style={styles.suggestionItem}>
                        <Icon name="circle" size={4} color="#666" />
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomTextInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  showPasswordToggle
                  leftIcon="lock"
                  error={errors.confirmPassword?.message}
                  required
                />
              )}
            />

            <CustomButton
              title="Reset Password"
              onPress={handleSubmit(onSubmit)}
              variant="primary"
              size="large"
              fullWidth
              loading={isLoading}
              style={styles.submitButton}
            />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoid: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    width: '100%',
  },
  
  // Password strength styles
  strengthContainer: {
    marginBottom: 20,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  strengthLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  strengthScore: {
    fontSize: 14,
    fontWeight: '600',
  },
  strengthBarContainer: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  strengthBarBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f0f0f0',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  suggestionsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  suggestionsTitle: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    marginTop: 8,
  },
});

export default ResetPasswordScreen;