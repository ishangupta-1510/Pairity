import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface CustomTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  showPasswordToggle?: boolean;
  required?: boolean;
}

const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconPress,
      containerStyle,
      showPasswordToggle = false,
      required = false,
      secureTextEntry = false,
      style,
      ...props
    },
    ref
  ) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
    const [isFocused, setIsFocused] = useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const renderRightIcon = () => {
      if (showPasswordToggle && secureTextEntry) {
        return (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={togglePasswordVisibility}
          >
            <Icon
              name={isPasswordVisible ? 'visibility-off' : 'visibility'}
              size={24}
              color="#666"
            />
          </TouchableOpacity>
        );
      }

      if (rightIcon) {
        return (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onRightIconPress}
          >
            <Icon name={rightIcon} size={24} color="#666" />
          </TouchableOpacity>
        );
      }

      return null;
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        )}
        
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.focused,
            error && styles.error,
          ]}
        >
          {leftIcon && (
            <Icon
              name={leftIcon}
              size={24}
              color={isFocused ? '#FF6B6B' : '#666'}
              style={styles.leftIcon}
            />
          )}
          
          <TextInput
            ref={ref}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
              style,
            ]}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholderTextColor="#999"
            {...props}
          />
          
          {renderRightIcon()}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {helperText && !error && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#FF6B6B',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    minHeight: 48,
  },
  focused: {
    borderColor: '#FF6B6B',
    backgroundColor: '#fff',
  },
  error: {
    borderColor: '#FF6B6B',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  leftIcon: {
    marginLeft: 16,
  },
  iconButton: {
    padding: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

CustomTextInput.displayName = 'CustomTextInput';

export default CustomTextInput;