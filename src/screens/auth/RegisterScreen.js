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

const RegisterScreen = ({ navigation }) => {
  // State
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    gender: '',
    birthDate: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
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
    ]).start();
  }, []);
  
  // Validation
  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Phone number is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Gender validation
    if (!formData.gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    // Birth date validation
    if (!formData.birthDate) {
      newErrors.birthDate = 'Birth date is required';
    } else {
      const birthYear = parseInt(formData.birthDate.split('-')[0]);
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (age < 18) {
        newErrors.birthDate = 'You must be at least 18 years old';
      }
    }
    
    // Terms acceptance
    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handlers
  const handleRegister = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (formData.gender === 'male') {
        Alert.alert(
          '🎉 Registration Successful!',
          'Welcome to Pairity! As a male user, you\'ll need to subscribe to our premium plan (₹5000/month) to access the app.',
          [
            {
              text: 'Proceed to Payment',
              onPress: () => console.log('Navigate to payment'),
            },
          ]
        );
      } else {
        Alert.alert(
          '🎉 Welcome to Pairity!',
          'Registration successful! As a female user, you get lifetime free premium access to all features.',
          [
            {
              text: 'Get Started',
              onPress: () => console.log('Navigate to onboarding'),
            },
          ]
        );
      }
    }, 1500);
  };
  
  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setErrors({ ...errors, [field]: null });
  };
  
  const selectGender = (gender) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateFormData('gender', gender);
  };
  
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
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Create Account</Text>
              <View style={styles.backButton} />
            </View>
            
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <LinearGradient
                colors={Gradients.gold}
                style={styles.progressBar}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
            
            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              {/* Email Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Email *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'email' && styles.inputContainerFocused,
                  errors.email && styles.inputContainerError,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="your@email.com"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    onFocus={() => setFocusedInput('email')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
              </View>
              
              {/* Phone Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'phone' && styles.inputContainerFocused,
                  errors.phone && styles.inputContainerError,
                ]}>
                  <Text style={styles.phonePrefix}>+91</Text>
                  <TextInput
                    style={[styles.input, styles.phoneInput]}
                    placeholder="9876543210"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.phone}
                    onChangeText={(text) => updateFormData('phone', text)}
                    onFocus={() => setFocusedInput('phone')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
              </View>
              
              {/* Gender Selection */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Gender *</Text>
                <View style={styles.genderContainer}>
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'male' && styles.genderButtonSelected,
                    ]}
                    onPress={() => selectGender('male')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === 'male' && styles.genderButtonTextSelected,
                    ]}>
                      👨 Male
                    </Text>
                    {formData.gender === 'male' && (
                      <Text style={styles.genderNote}>₹5000/month</Text>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.genderButton,
                      formData.gender === 'female' && styles.genderButtonSelected,
                    ]}
                    onPress={() => selectGender('female')}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.genderButtonText,
                      formData.gender === 'female' && styles.genderButtonTextSelected,
                    ]}>
                      👩 Female
                    </Text>
                    {formData.gender === 'female' && (
                      <Text style={styles.genderNote}>Free Forever</Text>
                    )}
                  </TouchableOpacity>
                </View>
                {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}
              </View>
              
              {/* Birth Date */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Birth Date *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'birthDate' && styles.inputContainerFocused,
                  errors.birthDate && styles.inputContainerError,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.birthDate}
                    onChangeText={(text) => updateFormData('birthDate', text)}
                    onFocus={() => setFocusedInput('birthDate')}
                    onBlur={() => setFocusedInput(null)}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                </View>
                {errors.birthDate && <Text style={styles.errorText}>{errors.birthDate}</Text>}
              </View>
              
              <Text style={[styles.sectionTitle, styles.mt24]}>Security</Text>
              
              {/* Password Input */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'password' && styles.inputContainerFocused,
                  errors.password && styles.inputContainerError,
                ]}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Create a strong password"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.password}
                    onChangeText={(text) => updateFormData('password', text)}
                    onFocus={() => setFocusedInput('password')}
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
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                <Text style={styles.passwordHint}>
                  Must contain uppercase, lowercase, and number
                </Text>
              </View>
              
              {/* Confirm Password */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'confirmPassword' && styles.inputContainerFocused,
                  errors.confirmPassword && styles.inputContainerError,
                ]}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    placeholder="Re-enter your password"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
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
              
              {/* Referral Code */}
              <View style={styles.inputWrapper}>
                <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
                <View style={[
                  styles.inputContainer,
                  focusedInput === 'referral' && styles.inputContainerFocused,
                ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter referral code"
                    placeholderTextColor={Colors.textMuted}
                    value={formData.referralCode}
                    onChangeText={(text) => updateFormData('referralCode', text)}
                    onFocus={() => setFocusedInput('referral')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
              
              {/* Terms and Conditions */}
              <TouchableOpacity
                style={styles.termsContainer}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAcceptedTerms(!acceptedTerms);
                  setErrors({ ...errors, terms: null });
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                  {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms & Conditions</Text>
                  {' '}and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
              {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}
              
              {/* Register Button */}
              <TouchableOpacity
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
                style={styles.mt24}
              >
                <LinearGradient
                  colors={isLoading ? [Colors.mutedSilver, Colors.softGraphite] : Gradients.gold}
                  style={styles.registerButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  {isLoading ? (
                    <ActivityIndicator color={Colors.textPrimary} />
                  ) : (
                    <Text style={styles.registerButtonText}>Create Account</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              {/* Sign In Link */}
              <View style={styles.signInContainer}>
                <Text style={styles.signInText}>Already have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.signInLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  content: {
    flex: 1,
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
    height: 4,
    backgroundColor: Colors.softGraphite,
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    width: '30%',
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    marginBottom: 20,
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
  phonePrefix: {
    paddingLeft: 16,
    color: Colors.textSecondary,
    fontSize: 16,
  },
  phoneInput: {
    paddingLeft: 8,
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
  passwordHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.error,
    marginTop: 4,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.softGraphite,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderButtonSelected: {
    borderColor: Colors.royalGold,
    backgroundColor: Colors.royalGold + '15',
  },
  genderButtonText: {
    ...Typography.bodyRegular,
    color: Colors.textSecondary,
  },
  genderButtonTextSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  genderNote: {
    ...Typography.caption,
    color: Colors.royalGold,
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.mutedSilver,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: Colors.royalGold,
    borderColor: Colors.royalGold,
  },
  checkmark: {
    color: Colors.primaryBlack,
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
  },
  termsLink: {
    color: Colors.royalGold,
    textDecorationLine: 'underline',
  },
  registerButton: {
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
  registerButtonText: {
    ...Typography.button,
    color: Colors.primaryBlack,
    fontSize: 18,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  signInText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  signInLink: {
    ...Typography.bodySmall,
    color: Colors.royalGold,
    fontWeight: '600',
  },
  mt24: {
    marginTop: 24,
  },
});

export default RegisterScreen;