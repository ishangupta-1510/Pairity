import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import CustomTextInput from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const newPassword = watch('newPassword');

  // Calculate password strength
  React.useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^A-Za-z0-9]/.test(newPassword)) strength++;

    setPasswordStrength(strength);
  }, [newPassword]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return '#FF6B6B';
    if (passwordStrength <= 3) return '#FFD43B';
    return '#51CF66';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  const onSubmit = async (data: PasswordFormData) => {
    setLoading(true);
    try {
      // API call to change password
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully',
      });
      
      reset();
      navigation.goBack();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to change password',
        text2: 'Please check your current password and try again',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.description}>
              Create a strong password that you don't use on other sites
            </Text>

            <Controller
              control={control}
              name="currentPassword"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Current Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.currentPassword?.message}
                  secureTextEntry={!showCurrentPassword}
                  placeholder="Enter current password"
                  rightIcon={showCurrentPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowCurrentPassword(!showCurrentPassword)}
                />
              )}
            />

            <Controller
              control={control}
              name="newPassword"
              render={({ field: { onChange, value } }) => (
                <View>
                  <CustomTextInput
                    label="New Password"
                    value={value}
                    onChangeText={onChange}
                    error={errors.newPassword?.message}
                    secureTextEntry={!showNewPassword}
                    placeholder="Enter new password"
                    rightIcon={showNewPassword ? 'visibility-off' : 'visibility'}
                    onRightIconPress={() => setShowNewPassword(!showNewPassword)}
                  />
                  {value.length > 0 && (
                    <View style={styles.strengthContainer}>
                      <View style={styles.strengthBar}>
                        <View
                          style={[
                            styles.strengthFill,
                            {
                              width: `${(passwordStrength / 5) * 100}%`,
                              backgroundColor: getPasswordStrengthColor(),
                            },
                          ]}
                        />
                      </View>
                      <Text
                        style={[
                          styles.strengthText,
                          { color: getPasswordStrengthColor() },
                        ]}
                      >
                        {getPasswordStrengthText()}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <CustomTextInput
                  label="Confirm New Password"
                  value={value}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                  secureTextEntry={!showConfirmPassword}
                  placeholder="Confirm new password"
                  rightIcon={showConfirmPassword ? 'visibility-off' : 'visibility'}
                  onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            />

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Text style={styles.requirementsTitle}>Password must contain:</Text>
              <View style={styles.requirementItem}>
                <Icon
                  name={newPassword.length >= 8 ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={newPassword.length >= 8 ? '#51CF66' : '#999'}
                />
                <Text style={styles.requirementText}>At least 8 characters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={
                    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                      ? 'check-circle'
                      : 'radio-button-unchecked'
                  }
                  size={16}
                  color={
                    /[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)
                      ? '#51CF66'
                      : '#999'
                  }
                />
                <Text style={styles.requirementText}>Upper and lowercase letters</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={/[0-9]/.test(newPassword) ? 'check-circle' : 'radio-button-unchecked'}
                  size={16}
                  color={/[0-9]/.test(newPassword) ? '#51CF66' : '#999'}
                />
                <Text style={styles.requirementText}>At least one number</Text>
              </View>
              <View style={styles.requirementItem}>
                <Icon
                  name={
                    /[^A-Za-z0-9]/.test(newPassword)
                      ? 'check-circle'
                      : 'radio-button-unchecked'
                  }
                  size={16}
                  color={/[^A-Za-z0-9]/.test(newPassword) ? '#51CF66' : '#999'}
                />
                <Text style={styles.requirementText}>At least one special character</Text>
              </View>
            </View>

            <CustomButton
              title="Change Password"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              disabled={loading}
              variant="primary"
              size="large"
              fullWidth
              style={styles.submitButton}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword' as never)}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot your current password?</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <Toast />
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
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -8,
    marginBottom: 16,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  requirements: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  submitButton: {
    marginBottom: 16,
  },
  forgotLink: {
    alignItems: 'center',
    padding: 12,
  },
  forgotText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default ChangePasswordScreen;