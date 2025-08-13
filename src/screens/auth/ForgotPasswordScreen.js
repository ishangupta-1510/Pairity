import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Colors, Gradients } from '../../styles/colors';
import { Typography } from '../../styles/typography';

const ForgotPasswordScreen = ({ navigation }) => {
  // State
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Refs for OTP inputs
  const otpRefs = useRef([]);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Timer for resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);
  
  // Step animations
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);
  
  // Validation
  const validateEmail = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateOTP = () => {
    const newErrors = {};
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      newErrors.otp = 'Please enter complete OTP';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validatePassword = () => {
    const newErrors = {};
    
    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers
  const handleSendOTP = async () => {
    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setResendTimer(60);
      Alert.alert(
        'OTP Sent!',
        `A 6-digit code has been sent to ${email}`,
        [{ text: 'OK' }]
      );
    }, 1500);
  };
  
  const handleVerifyOTP = async () => {
    if (!validateOTP()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      const otpString = otp.join('');
      
      // Hardcoded OTP check
      if (otpString === '123456') {
        setStep(3);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid OTP', 'Please enter the correct OTP. (Hint: Try 123456)');
      }
    }, 1500);
  };
  
  const handleResetPassword = async () => {
    if (!validatePassword()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        '✨ Password Reset Successful!',
        'Your password has been reset successfully. You can now login with your new password.',
        [
          {
            text: 'Go to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    }, 1500);
  };
  
  const handleResendOTP = () => {
    if (resendTimer === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setResendTimer(60);
      Alert.alert('OTP Resent', 'A new OTP has been sent to your email');
    }
  };
  
  const handleOTPChange = (value, index) => {
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);
    
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };
  
  const handleOTPKeyPress = (key, index) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };
  
  // Render steps
  const renderEmailStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={Gradients.gold}
          style={styles.iconGradient}
        >
          <Text style={styles.icon}>📧</Text>
        </LinearGradient>
      </View>
      
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>
        No worries! Enter your email and we'll send you a code to reset your password.
      </Text>
      
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Email Address</Text>
        <View style={[
          styles.inputContainer,
          focusedInput === 'email' && styles.inputContainerFocused,
          errors.email && styles.inputContainerError,
        ]}>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            placeholderTextColor={Colors.textMuted}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: null });
            }}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      
      <TouchableOpacity
        onPress={handleSendOTP}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isLoading ? [Colors.mutedSilver, Colors.softGraphite] : Gradients.gold}
          style={styles.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Send OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
  
  const renderOTPStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={Gradients.gold}
          style={styles.iconGradient}
        >
          <Text style={styles.icon}>🔐</Text>
        </LinearGradient>
      </View>
      
      <Text style={styles.title}>Enter Verification Code</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to{'\n'}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>
      
      <View style={styles.otpContainer}>
        {otp.map((digit, index) => (
          <View
            key={index}
            style={[
              styles.otpInput,
              focusedInput === `otp${index}` && styles.otpInputFocused,
              digit && styles.otpInputFilled,
            ]}
          >
            <TextInput
              ref={(ref) => (otpRefs.current[index] = ref)}
              style={styles.otpText}
              value={digit}
              onChangeText={(value) => handleOTPChange(value, index)}
              onFocus={() => setFocusedInput(`otp${index}`)}
              onBlur={() => setFocusedInput(null)}
              onKeyPress={({ nativeEvent }) => handleOTPKeyPress(nativeEvent.key, index)}
              keyboardType="numeric"
              maxLength={1}
              selectTextOnFocus
            />
          </View>
        ))}
      </View>
      {errors.otp && <Text style={styles.errorText}>{errors.otp}</Text>}
      
      <TouchableOpacity
        onPress={handleVerifyOTP}
        activeOpacity={0.8}
        disabled={isLoading}
        style={styles.mt24}
      >
        <LinearGradient
          colors={isLoading ? [Colors.mutedSilver, Colors.softGraphite] : Gradients.gold}
          style={styles.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Verify OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.resendContainer}
        onPress={handleResendOTP}
        disabled={resendTimer > 0}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.resendText,
          resendTimer > 0 && styles.resendTextDisabled,
        ]}>
          {resendTimer > 0
            ? `Resend OTP in ${resendTimer}s`
            : 'Resend OTP'}
        </Text>
      </TouchableOpacity>
      
      <Text style={styles.otpHint}>Test OTP: 123456</Text>
    </View>
  );
  
  const renderPasswordStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={Gradients.gold}
          style={styles.iconGradient}
        >
          <Text style={styles.icon}>🔑</Text>
        </LinearGradient>
      </View>
      
      <Text style={styles.title}>Create New Password</Text>
      <Text style={styles.subtitle}>
        Your new password must be different from previously used passwords
      </Text>
      
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>New Password</Text>
        <View style={[
          styles.inputContainer,
          focusedInput === 'newPassword' && styles.inputContainerFocused,
          errors.newPassword && styles.inputContainerError,
        ]}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Enter new password"
            placeholderTextColor={Colors.textMuted}
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setErrors({ ...errors, newPassword: null });
            }}
            onFocus={() => setFocusedInput('newPassword')}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
      </View>
      
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>Confirm New Password</Text>
        <View style={[
          styles.inputContainer,
          focusedInput === 'confirmPassword' && styles.inputContainerFocused,
          errors.confirmPassword && styles.inputContainerError,
        ]}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            placeholder="Re-enter new password"
            placeholderTextColor={Colors.textMuted}
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setErrors({ ...errors, confirmPassword: null });
            }}
            onFocus={() => setFocusedInput('confirmPassword')}
            onBlur={() => setFocusedInput(null)}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.eyeIcon}>
              {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      
      <TouchableOpacity
        onPress={handleResetPassword}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <LinearGradient
          colors={isLoading ? [Colors.mutedSilver, Colors.softGraphite] : Gradients.gold}
          style={styles.primaryButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.textPrimary} />
          ) : (
            <Text style={styles.primaryButtonText}>Reset Password</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primaryBlack} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigation.goBack();
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.backButton} />
          </View>
          
          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, step >= 1 && styles.progressDotActive]} />
              <Text style={[styles.progressLabel, step >= 1 && styles.progressLabelActive]}>
                Email
              </Text>
            </View>
            <View style={[styles.progressLine, step >= 2 && styles.progressLineActive]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, step >= 2 && styles.progressDotActive]} />
              <Text style={[styles.progressLabel, step >= 2 && styles.progressLabelActive]}>
                Verify
              </Text>
            </View>
            <View style={[styles.progressLine, step >= 3 && styles.progressLineActive]} />
            <View style={styles.progressStep}>
              <View style={[styles.progressDot, step >= 3 && styles.progressDotActive]} />
              <Text style={[styles.progressLabel, step >= 3 && styles.progressLabelActive]}>
                Reset
              </Text>
            </View>
          </View>
          
          {/* Content */}
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            {step === 1 && renderEmailStep()}
            {step === 2 && renderOTPStep()}
            {step === 3 && renderPasswordStep()}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primaryBlack,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.textPrimary,
  },
  headerTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.mutedSilver,
    marginBottom: 4,
  },
  progressDotActive: {
    backgroundColor: Colors.royalGold,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  progressLabelActive: {
    color: Colors.royalGold,
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.mutedSilver,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  progressLineActive: {
    backgroundColor: Colors.royalGold,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    flex: 1,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...Typography.bodyRegular,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emailHighlight: {
    color: Colors.royalGold,
    fontWeight: '600',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.softGraphite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainerFocused: {
    borderColor: Colors.royalGold,
  },
  inputContainerError: {
    borderColor: Colors.error,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 56,
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 8,
  },
  eyeIcon: {
    fontSize: 20,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 50,
    height: 56,
    backgroundColor: Colors.softGraphite,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInputFocused: {
    borderColor: Colors.royalGold,
  },
  otpInputFilled: {
    backgroundColor: Colors.royalGold + '15',
    borderColor: Colors.royalGold,
  },
  otpText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    shadowColor: Colors.royalGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    ...Typography.button,
    color: Colors.primaryBlack,
    fontSize: 18,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  resendText: {
    ...Typography.bodyRegular,
    color: Colors.royalGold,
  },
  resendTextDisabled: {
    color: Colors.textMuted,
  },
  otpHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 16,
    backgroundColor: Colors.softGraphite,
    padding: 8,
    borderRadius: 8,
  },
  mt24: {
    marginTop: 24,
  },
});

export default ForgotPasswordScreen;