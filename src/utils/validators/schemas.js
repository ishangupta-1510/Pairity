import * as yup from 'yup';

// Custom validation methods
const phoneRegex = /^[+]?[0-9]{10,15}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Login schema
export const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

// Registration schema
export const registrationSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Please enter a valid phone number')
    .required('Phone number is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], 'Please select your gender')
    .required('Gender is required'),
  birthDate: yup
    .date()
    .max(new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000), 'You must be at least 18 years old')
    .required('Birth date is required'),
  acceptedTerms: yup
    .boolean()
    .oneOf([true], 'You must accept the terms and conditions')
    .required('You must accept the terms and conditions'),
  referralCode: yup.string().optional(),
});

// Profile update schema
export const profileSchema = yup.object().shape({
  displayName: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Display name is required'),
  bio: yup
    .string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  height: yup
    .number()
    .min(120, 'Height must be at least 120cm')
    .max(250, 'Height must be less than 250cm')
    .optional(),
  occupation: yup
    .string()
    .max(100, 'Occupation must be less than 100 characters')
    .optional(),
  company: yup
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  education: yup
    .string()
    .max(200, 'Education must be less than 200 characters')
    .optional(),
  interests: yup
    .array()
    .of(yup.string())
    .min(3, 'Please select at least 3 interests')
    .max(10, 'You can select up to 10 interests'),
  languages: yup
    .array()
    .of(yup.string())
    .min(1, 'Please select at least 1 language'),
  drinkingHabit: yup
    .string()
    .oneOf(['never', 'socially', 'regularly'], 'Invalid selection')
    .optional(),
  smokingHabit: yup
    .string()
    .oneOf(['never', 'socially', 'regularly'], 'Invalid selection')
    .optional(),
  relationshipGoal: yup
    .string()
    .oneOf(['casual', 'serious', 'marriage', 'unsure'], 'Invalid selection')
    .optional(),
  wantsChildren: yup
    .string()
    .oneOf(['yes', 'no', 'maybe', 'have_and_want_more', 'have_and_dont_want_more'], 'Invalid selection')
    .optional(),
});

// Preferences schema
export const preferencesSchema = yup.object().shape({
  ageRange: yup.object().shape({
    min: yup
      .number()
      .min(18, 'Minimum age must be at least 18')
      .max(99, 'Maximum age limit is 99')
      .required('Minimum age is required'),
    max: yup
      .number()
      .min(yup.ref('min'), 'Maximum age must be greater than minimum age')
      .max(99, 'Maximum age limit is 99')
      .required('Maximum age is required'),
  }),
  distance: yup
    .number()
    .min(1, 'Minimum distance is 1km')
    .max(500, 'Maximum distance is 500km')
    .required('Distance preference is required'),
  genderPreference: yup
    .string()
    .oneOf(['male', 'female', 'both'], 'Invalid selection')
    .required('Gender preference is required'),
});

// Forgot password schema
export const forgotPasswordSchema = yup.object().shape({
  email: yup
    .string()
    .email('Please enter a valid email')
    .required('Email is required'),
});

// Reset password schema
export const resetPasswordSchema = yup.object().shape({
  newPassword: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      passwordRegex,
      'Password must contain uppercase, lowercase, and number'
    )
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword'), null], 'Passwords must match')
    .required('Please confirm your new password'),
});

// OTP verification schema
export const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .length(6, 'OTP must be 6 digits')
    .matches(/^\d+$/, 'OTP must contain only numbers')
    .required('OTP is required'),
});

// Message schema
export const messageSchema = yup.object().shape({
  message: yup
    .string()
    .max(1000, 'Message must be less than 1000 characters')
    .required('Message cannot be empty'),
});

// Report schema
export const reportSchema = yup.object().shape({
  reason: yup
    .string()
    .oneOf([
      'fake_profile',
      'inappropriate_content',
      'harassment',
      'spam',
      'underage',
      'other',
    ], 'Please select a reason')
    .required('Reason is required'),
  details: yup
    .string()
    .when('reason', {
      is: 'other',
      then: yup.string().min(10, 'Please provide more details').required('Details are required'),
      otherwise: yup.string().optional(),
    }),
});

// Payment schema
export const paymentSchema = yup.object().shape({
  cardNumber: yup
    .string()
    .matches(/^\d{16}$/, 'Card number must be 16 digits')
    .required('Card number is required'),
  cardHolder: yup
    .string()
    .min(3, 'Cardholder name must be at least 3 characters')
    .required('Cardholder name is required'),
  expiryMonth: yup
    .number()
    .min(1, 'Invalid month')
    .max(12, 'Invalid month')
    .required('Expiry month is required'),
  expiryYear: yup
    .number()
    .min(new Date().getFullYear(), 'Card has expired')
    .max(new Date().getFullYear() + 20, 'Invalid year')
    .required('Expiry year is required'),
  cvv: yup
    .string()
    .matches(/^\d{3,4}$/, 'CVV must be 3 or 4 digits')
    .required('CVV is required'),
});

// Settings schema
export const settingsSchema = yup.object().shape({
  pushNotifications: yup.object().shape({
    matches: yup.boolean(),
    messages: yup.boolean(),
    likes: yup.boolean(),
    superLikes: yup.boolean(),
  }),
  privacy: yup.object().shape({
    showOnlineStatus: yup.boolean(),
    showLastSeen: yup.boolean(),
    showDistance: yup.boolean(),
    showAge: yup.boolean(),
  }),
  discovery: yup.object().shape({
    pauseProfile: yup.boolean(),
    globalMode: yup.boolean(),
    autoPlayVideos: yup.boolean(),
  }),
});

// Helper function to validate a single field
export const validateField = async (schema, field, value) => {
  try {
    await schema.validateAt(field, { [field]: value });
    return null;
  } catch (error) {
    return error.message;
  }
};

// Helper function to validate entire form
export const validateForm = async (schema, values) => {
  try {
    await schema.validate(values, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};