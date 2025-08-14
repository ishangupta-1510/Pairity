import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProgressBar } from 'react-native-paper';
import CustomTextInput from '@/components/CustomTextInput';
import CustomButton from '@/components/CustomButton';
import { registerUser } from '@/store/slices/authSlice';

// Validation schemas for each step
const step1Schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Please select your date of birth'),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select your gender',
  }),
});

const step3Schema = z.object({
  interestedIn: z.enum(['male', 'female', 'everyone'], {
    required_error: 'Please select who you are interested in',
  }),
  ageRangeMin: z.number().min(18, 'Minimum age must be 18').max(99),
  ageRangeMax: z.number().min(18, 'Maximum age must be 18').max(99),
  maxDistance: z.number().min(1, 'Distance must be at least 1 mile').max(100),
}).refine((data) => data.ageRangeMax >= data.ageRangeMin, {
  message: "Maximum age must be greater than minimum age",
  path: ["ageRangeMax"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

interface RegisterScreenProps {}

const RegisterScreen: React.FC<RegisterScreenProps> = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    step1: {} as Step1Data,
    step2: {} as Step2Data,
    step3: {} as Step3Data,
    profilePhoto: null as string | null,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Form hooks for each step
  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      gender: undefined,
    },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      interestedIn: undefined,
      ageRangeMin: 22,
      ageRangeMax: 35,
      maxDistance: 25,
    },
  });

  const totalSteps = 4;
  const progress = currentStep / totalSteps;

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await step1Form.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, step1: step1Form.getValues() }));
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      const isValid = await step2Form.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, step2: step2Form.getValues() }));
        setCurrentStep(3);
      }
    } else if (currentStep === 3) {
      const isValid = await step3Form.trigger();
      if (isValid) {
        setFormData(prev => ({ ...prev, step3: step3Form.getValues() }));
        setCurrentStep(4);
      }
    } else if (currentStep === 4) {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      Alert.alert('Terms Required', 'Please agree to the terms and conditions');
      return;
    }

    try {
      const registrationData = {
        email: formData.step1.email,
        password: formData.step1.password,
        firstName: formData.step2.firstName,
        lastName: formData.step2.lastName,
        dateOfBirth: formData.step2.dateOfBirth,
        gender: formData.step2.gender,
        interestedIn: formData.step3.interestedIn,
        preferences: {
          ageRange: {
            min: formData.step3.ageRangeMin,
            max: formData.step3.ageRangeMax,
          },
          maxDistance: formData.step3.maxDistance,
        },
        profilePhoto: formData.profilePhoto,
      };

      await dispatch(registerUser(registrationData) as any);
    } catch (error) {
      Alert.alert('Registration Failed', 'Please try again later.');
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Create your account</Text>

      <Controller
        control={step1Form.control}
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
            error={step1Form.formState.errors.email?.message}
            required
          />
        )}
      />

      <Controller
        control={step1Form.control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput
            label="Password"
            placeholder="Create a password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            showPasswordToggle
            leftIcon="lock"
            error={step1Form.formState.errors.password?.message}
            helperText="Minimum 8 characters"
            required
          />
        )}
      />

      <Controller
        control={step1Form.control}
        name="confirmPassword"
        render={({ field: { onChange, onBlur, value } }) => (
          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            showPasswordToggle
            leftIcon="lock"
            error={step1Form.formState.errors.confirmPassword?.message}
            required
          />
        )}
      />
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Personal Details</Text>
      <Text style={styles.stepSubtitle}>Tell us about yourself</Text>

      <View style={styles.nameContainer}>
        <Controller
          control={step2Form.control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              label="First Name"
              placeholder="First name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              containerStyle={styles.nameInput}
              leftIcon="person"
              error={step2Form.formState.errors.firstName?.message}
              required
            />
          )}
        />

        <Controller
          control={step2Form.control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <CustomTextInput
              label="Last Name"
              placeholder="Last name"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              containerStyle={styles.nameInput}
              leftIcon="person"
              error={step2Form.formState.errors.lastName?.message}
              required
            />
          )}
        />
      </View>

      <Controller
        control={step2Form.control}
        name="dateOfBirth"
        render={({ field: { onChange, value } }) => (
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => {
              // TODO: Implement date picker
              Alert.alert('Date Picker', 'Date picker will be implemented');
            }}
          >
            <Text style={styles.datePickerText}>
              {value || 'Select your date of birth'}
            </Text>
            <Icon name="calendar-today" size={24} color="#666" />
          </TouchableOpacity>
        )}
      />

      <Text style={styles.sectionLabel}>Gender</Text>
      <View style={styles.genderContainer}>
        {['male', 'female', 'other'].map((gender) => (
          <Controller
            key={gender}
            control={step2Form.control}
            name="gender"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  value === gender && styles.genderOptionSelected,
                ]}
                onPress={() => onChange(gender)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    value === gender && styles.genderOptionTextSelected,
                  ]}
                >
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </Text>
              </TouchableOpacity>
            )}
          />
        ))}
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Dating Preferences</Text>
      <Text style={styles.stepSubtitle}>Help us find your perfect match</Text>

      <Text style={styles.sectionLabel}>I'm interested in</Text>
      <View style={styles.genderContainer}>
        {[
          { value: 'male', label: 'Men' },
          { value: 'female', label: 'Women' },
          { value: 'everyone', label: 'Everyone' },
        ].map((option) => (
          <Controller
            key={option.value}
            control={step3Form.control}
            name="interestedIn"
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={[
                  styles.genderOption,
                  value === option.value && styles.genderOptionSelected,
                ]}
                onPress={() => onChange(option.value)}
              >
                <Text
                  style={[
                    styles.genderOptionText,
                    value === option.value && styles.genderOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        ))}
      </View>

      <Text style={styles.sectionLabel}>Age Range</Text>
      <View style={styles.ageRangeContainer}>
        <Controller
          control={step3Form.control}
          name="ageRangeMin"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Min Age"
              placeholder="22"
              value={value?.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 18)}
              keyboardType="numeric"
              containerStyle={styles.ageInput}
            />
          )}
        />
        <Text style={styles.ageRangeSeparator}>to</Text>
        <Controller
          control={step3Form.control}
          name="ageRangeMax"
          render={({ field: { onChange, value } }) => (
            <CustomTextInput
              label="Max Age"
              placeholder="35"
              value={value?.toString()}
              onChangeText={(text) => onChange(parseInt(text) || 99)}
              keyboardType="numeric"
              containerStyle={styles.ageInput}
            />
          )}
        />
      </View>

      <Controller
        control={step3Form.control}
        name="maxDistance"
        render={({ field: { onChange, value } }) => (
          <CustomTextInput
            label="Maximum Distance (miles)"
            placeholder="25"
            value={value?.toString()}
            onChangeText={(text) => onChange(parseInt(text) || 25)}
            keyboardType="numeric"
            helperText="How far are you willing to travel for dates?"
          />
        )}
      />
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Profile Photo</Text>
      <Text style={styles.stepSubtitle}>Add your best photo</Text>

      <TouchableOpacity
        style={styles.photoUploadContainer}
        onPress={() => {
          // TODO: Implement image picker
          Alert.alert('Photo Upload', 'Image picker will be implemented');
        }}
      >
        <Icon name="add-a-photo" size={48} color="#666" />
        <Text style={styles.photoUploadText}>Tap to add photo</Text>
        <Text style={styles.photoUploadSubtext}>You can add more photos later</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.termsContainer}
        onPress={() => setAgreedToTerms(!agreedToTerms)}
      >
        <Icon
          name={agreedToTerms ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color="#FF6B6B"
        />
        <Text style={styles.termsText}>
          I agree to the{' '}
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sign Up</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            color="#FF6B6B"
            style={styles.progressBar}
          />
          <Text style={styles.progressText}>
            Step {currentStep} of {totalSteps}
          </Text>
        </View>

        {/* Form Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {getCurrentStepComponent()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep > 1 && (
            <CustomButton
              title="Back"
              onPress={handleBack}
              variant="outline"
              size="large"
              style={styles.backButton}
            />
          )}
          <CustomButton
            title={currentStep === totalSteps ? 'Create Account' : 'Next'}
            onPress={handleNext}
            variant="primary"
            size="large"
            style={styles.nextButton}
          />
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
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  nameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nameInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  genderContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  genderOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#f9f9f9',
  },
  genderOptionSelected: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FF6B6B',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  genderOptionTextSelected: {
    color: '#fff',
  },
  ageRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ageInput: {
    flex: 1,
  },
  ageRangeSeparator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 12,
    marginTop: 20,
  },
  photoUploadContainer: {
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 40,
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
  },
  photoUploadText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  photoUploadSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
    marginLeft: 8,
  },
});

export default RegisterScreen;