import { useState, useCallback } from 'react';
import { validateField, validateForm } from '../utils/validators/schemas';

export const useForm = (initialValues, schema) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback(
    (field) => async (value) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      
      // Clear error when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
      
      // Validate on change if field was touched
      if (touched[field] && schema) {
        const error = await validateField(schema, field, value);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    },
    [errors, touched, schema]
  );

  // Handle input blur
  const handleBlur = useCallback(
    (field) => async () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      
      // Validate on blur
      if (schema) {
        const error = await validateField(schema, field, values[field]);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
        }
      }
    },
    [values, schema]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (onSubmit) => async () => {
      setIsSubmitting(true);
      
      // Validate all fields
      if (schema) {
        const validation = await validateForm(schema, values);
        
        if (!validation.isValid) {
          setErrors(validation.errors);
          setIsSubmitting(false);
          
          // Mark all fields as touched
          const allTouched = {};
          Object.keys(values).forEach((key) => {
            allTouched[key] = true;
          });
          setTouched(allTouched);
          
          return { success: false, errors: validation.errors };
        }
      }
      
      // Call the submit handler
      try {
        const result = await onSubmit(values);
        setIsSubmitting(false);
        return { success: true, data: result };
      } catch (error) {
        setIsSubmitting(false);
        return { success: false, error: error.message };
      }
    },
    [values, schema]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  // Set field value
  const setFieldValue = useCallback((field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Set field error
  const setFieldError = useCallback((field, error) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  // Set multiple values
  const setMultipleValues = useCallback((newValues) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  // Validate single field
  const validateSingleField = useCallback(
    async (field) => {
      if (!schema) return null;
      
      const error = await validateField(schema, field, values[field]);
      if (error) {
        setErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        setErrors((prev) => ({ ...prev, [field]: null }));
      }
      return error;
    },
    [values, schema]
  );

  // Validate all fields
  const validateAllFields = useCallback(async () => {
    if (!schema) return true;
    
    const validation = await validateForm(schema, values);
    setErrors(validation.errors);
    return validation.isValid;
  }, [values, schema]);

  // Check if form is valid
  const isValid = Object.keys(errors).every((key) => !errors[key]) && 
                  Object.keys(touched).length > 0;

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setFieldError,
    setMultipleValues,
    validateSingleField,
    validateAllFields,
  };
};