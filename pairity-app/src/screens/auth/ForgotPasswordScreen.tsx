import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomTextInput from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';

// Validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordScreenProps {}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = () => {
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [rateLimitNotice, setRateLimitNotice] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setRateLimitNotice(false);

    try {
      // TODO: Replace with actual API call
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          setRateLimitNotice(true);
          throw new Error('Too many requests. Please try again later.');
        }
        throw new Error('Failed to send reset link');
      }

      setShowSuccessModal(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      // For demonstration, always show success to prevent email enumeration
      setShowSuccessModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigation.goBack();
  };

  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={64} color="#FF6B6B" />
            </View>

            <Text style={styles.title}>Reset Your Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            <View style={styles.form}>
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomTextInput
                    label="Email Address"
                    placeholder="Enter your email"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    leftIcon="email"
                    error={errors.email?.message}
                    required
                  />
                )}
              />

              {rateLimitNotice && (
                <View style={styles.rateLimitContainer}>
                  <Icon name="info" size={20} color="#FF6B6B" />
                  <Text style={styles.rateLimitText}>
                    Too many requests. Please wait before trying again.
                  </Text>
                </View>
              )}

              <CustomButton
                title="Send Reset Link"
                onPress={handleSubmit(onSubmit)}
                variant="primary"
                size="large"
                fullWidth
                loading={isLoading}
                style={styles.submitButton}
              />

              <TouchableOpacity
                style={styles.backToLoginContainer}
                onPress={handleBackToLogin}
              >
                <Icon name="arrow-back" size={16} color="#FF6B6B" />
                <Text style={styles.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Success Modal */}
          <Modal
            visible={showSuccessModal}
            transparent={true}
            animationType="fade"
            onRequestClose={handleCloseSuccessModal}
          >
            <TouchableWithoutFeedback onPress={handleCloseSuccessModal}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View style={styles.modalIconContainer}>
                      <Icon name="email" size={48} color="#51CF66" />
                    </View>
                    
                    <Text style={styles.modalTitle}>Check Your Email</Text>
                    <Text style={styles.modalMessage}>
                      We've sent a password reset link to {getValues('email')}
                    </Text>
                    <Text style={styles.modalSubMessage}>
                      The link will expire in 15 minutes. Don't forget to check your spam folder.
                    </Text>

                    <View style={styles.modalButtonContainer}>
                      <CustomButton
                        title="Got It"
                        onPress={handleCloseSuccessModal}
                        variant="primary"
                        size="medium"
                        fullWidth
                      />
                      
                      <CustomButton
                        title="Resend Email"
                        onPress={() => {
                          setShowSuccessModal(false);
                          handleSubmit(onSubmit)();
                        }}
                        variant="ghost"
                        size="medium"
                        fullWidth
                        style={styles.resendButton}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  headerSpacer: {
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
  rateLimitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  rateLimitText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  submitButton: {
    marginBottom: 24,
  },
  backToLoginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  backToLoginText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  modalSubMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtonContainer: {
    width: '100%',
  },
  resendButton: {
    marginTop: 12,
  },
});

export default ForgotPasswordScreen;