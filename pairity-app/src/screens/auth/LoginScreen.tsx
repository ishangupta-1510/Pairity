import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Ionicons } from '@expo/vector-icons';
import CustomTextInput from '@/components/CustomTextInput';
import { loginUser } from '@/store/slices/authSlice';
import { useTheme } from '@/components/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginScreenProps {}

const { width, height } = Dimensions.get('window');

const LoginScreen: React.FC<LoginScreenProps> = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for premium elements
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await dispatch(loginUser({
        email: data.email,
        password: data.password,
        rememberMe,
      }) as any);
    } catch (error) {
      Alert.alert('Login Failed', 'Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'apple') => {
    // TODO: Implement social login
    Alert.alert('Social Login', `${provider} login will be implemented`);
  };

  const handleSignUpNavigation = () => {
    navigation.navigate('Register' as never);
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword' as never);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#0A0A0B',
    },
    backgroundGradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
    scrollContainer: {
      flexGrow: 1,
    },
    keyboardAvoid: {
      flex: 1,
    },
    heroSection: {
      height: height * 0.35,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden',
    },
    heroGradient: {
      ...StyleSheet.absoluteFillObject,
    },
    heroContent: {
      alignItems: 'center',
      zIndex: 2,
    },
    brandContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    logoContainer: {
      width: 80,
      height: 80,
      borderRadius: 25,
      backgroundColor: 'rgba(255, 215, 0, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    logoIcon: {
      fontSize: 36,
      color: '#FFD700',
    },
    brandText: {
      fontSize: 28,
      fontWeight: '800',
      color: '#F5F5F7',
      letterSpacing: 1,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    tagline: {
      fontSize: 15,
      color: 'rgba(245, 245, 247, 0.7)',
      textAlign: 'center',
      marginTop: 8,
      fontWeight: '500',
    },
    decorativeElements: {
      position: 'absolute',
      width: '100%',
      height: '100%',
    },
    decorativeCircle1: {
      position: 'absolute',
      top: -50,
      right: -50,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: 'rgba(255, 121, 121, 0.1)',
    },
    decorativeCircle2: {
      position: 'absolute',
      bottom: -30,
      left: -30,
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: 'rgba(255, 215, 0, 0.08)',
    },
    formContainer: {
      flex: 1,
      backgroundColor: '#0A0A0B',
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      paddingHorizontal: 28,
      paddingTop: 32,
      marginTop: -20,
      minHeight: height * 0.7,
    },
    formHeader: {
      alignItems: 'center',
      marginBottom: 32,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: '700',
      color: '#F5F5F7',
      marginBottom: 8,
    },
    subtitleText: {
      fontSize: 16,
      color: 'rgba(245, 245, 247, 0.6)',
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputWrapper: {
      position: 'relative',
      marginBottom: 4,
    },
    premiumInput: {
      backgroundColor: 'rgba(21, 21, 23, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 16,
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingLeft: 56,
      fontSize: 16,
      color: '#F5F5F7',
      fontWeight: '500',
    },
    inputFocused: {
      borderColor: '#FFD700',
      backgroundColor: 'rgba(21, 21, 23, 0.95)',
      shadowColor: '#FFD700',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    inputIcon: {
      position: 'absolute',
      left: 18,
      top: 18,
      zIndex: 1,
    },
    passwordToggle: {
      position: 'absolute',
      right: 18,
      top: 18,
      padding: 4,
    },
    errorText: {
      color: '#FF7979',
      fontSize: 13,
      marginTop: 6,
      marginLeft: 4,
      fontWeight: '500',
    },
    optionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 32,
    },
    rememberContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    customSwitch: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      marginRight: 12,
    },
    switchThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#F5F5F7',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    rememberText: {
      fontSize: 15,
      color: 'rgba(245, 245, 247, 0.8)',
      fontWeight: '500',
    },
    forgotPassword: {
      padding: 4,
    },
    forgotPasswordText: {
      color: '#FFD700',
      fontSize: 15,
      fontWeight: '600',
    },
    signInButton: {
      borderRadius: 16,
      marginBottom: 32,
      overflow: 'hidden',
      shadowColor: '#FF7979',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    signInGradient: {
      paddingVertical: 18,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    signInButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    loadingIcon: {
      marginLeft: 12,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 28,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
      marginHorizontal: 20,
      color: 'rgba(245, 245, 247, 0.5)',
      fontSize: 14,
      fontWeight: '500',
    },
    socialContainer: {
      marginBottom: 32,
    },
    socialButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },
    socialButton: {
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: 'rgba(21, 21, 23, 0.8)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    socialButtonPressed: {
      backgroundColor: 'rgba(255, 215, 0, 0.1)',
      borderColor: 'rgba(255, 215, 0, 0.3)',
      transform: [{ scale: 0.95 }],
    },
    signUpContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 16,
    },
    signUpText: {
      fontSize: 16,
      color: 'rgba(245, 245, 247, 0.6)',
      fontWeight: '500',
    },
    signUpLink: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFD700',
      marginLeft: 6,
    },
  });

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0B" />
      <View style={styles.container}>
        {/* Background Gradient */}
        <LinearGradient
          colors={['#0A0A0B', '#151517', '#0A0A0B']}
          style={styles.backgroundGradient}
        />
        
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Section */}
            <Animated.View
              style={[
                styles.heroSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 121, 121, 0.15)', 'rgba(255, 215, 0, 0.1)', 'transparent']}
                style={styles.heroGradient}
              />
              
              {/* Decorative Elements */}
              <View style={styles.decorativeElements}>
                <Animated.View
                  style={[
                    styles.decorativeCircle1,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                />
                <View style={styles.decorativeCircle2} />
              </View>

              <View style={styles.heroContent}>
                <View style={styles.brandContainer}>
                  <Animated.View
                    style={[
                      styles.logoContainer,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <Ionicons name="heart" size={36} color="#FFD700" />
                  </Animated.View>
                  <Text style={styles.brandText}>Pairity</Text>
                  <Text style={styles.tagline}>Find Your Perfect Match</Text>
                </View>
              </View>
            </Animated.View>

            {/* Form Container */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.formHeader}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subtitleText}>Continue your journey to love</Text>
              </View>

              {/* Email Input */}
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="mail-outline"
                          size={20}
                          color="rgba(245, 245, 247, 0.6)"
                        />
                      </View>
                      <TextInput
                        style={[
                          styles.premiumInput,
                          errors.email && { borderColor: '#FF7979' },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Email address"
                        placeholderTextColor="rgba(245, 245, 247, 0.4)"
                      />
                    </View>
                    {errors.email && (
                      <Text style={styles.errorText}>{errors.email.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Password Input */}
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <View style={styles.inputIcon}>
                        <Ionicons
                          name="lock-closed-outline"
                          size={20}
                          color="rgba(245, 245, 247, 0.6)"
                        />
                      </View>
                      <TextInput
                        style={[
                          styles.premiumInput,
                          errors.password && { borderColor: '#FF7979' },
                        ]}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        secureTextEntry={!showPassword}
                        placeholder="Password"
                        placeholderTextColor="rgba(245, 245, 247, 0.4)"
                      />
                      <TouchableOpacity
                        style={styles.passwordToggle}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={20}
                          color="rgba(245, 245, 247, 0.6)"
                        />
                      </TouchableOpacity>
                    </View>
                    {errors.password && (
                      <Text style={styles.errorText}>{errors.password.message}</Text>
                    )}
                  </View>
                )}
              />

              {/* Options Row */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View
                    style={[
                      styles.customSwitch,
                      rememberMe && { backgroundColor: '#FFD700' },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.switchThumb,
                        {
                          transform: [
                            {
                              translateX: rememberMe ? 20 : 2,
                            },
                          ],
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgotPassword}
                  onPress={handleForgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>

              {/* Premium Sign In Button */}
              <TouchableOpacity
                style={styles.signInButton}
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FF7979', '#FF6B6B', '#FF5252']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signInGradient}
                >
                  <Text style={styles.signInButtonText}>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Text>
                  {isLoading && (
                    <Ionicons
                      name="refresh"
                      size={20}
                      color="#FFFFFF"
                      style={styles.loadingIcon}
                    />
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <View style={styles.socialButtons}>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('google')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-google" size={24} color="#F5F5F7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('facebook')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-facebook" size={24} color="#F5F5F7" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={() => handleSocialLogin('apple')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="logo-apple" size={24} color="#F5F5F7" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signUpContainer}>
                <Text style={styles.signUpText}>New to Pairity?</Text>
                <TouchableOpacity onPress={handleSignUpNavigation}>
                  <Text style={styles.signUpLink}>Create Account</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default LoginScreen;