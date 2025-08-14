import React, { useRef, useEffect } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { useAccessibility } from '@/hooks/useAccessibility';
import { AccessibleFormFieldProps } from '@/types/accessibility';
import { moderateScale } from '@/utils/responsive';

interface AccessibleTextInputProps extends TextInputProps, AccessibleFormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'standard' | 'outlined' | 'filled';
  multiline?: boolean;
  secureTextEntry?: boolean;
  autoComplete?: string;
  keyboardType?: TextInputProps['keyboardType'];
  returnKeyType?: TextInputProps['returnKeyType'];
  maxLength?: number;
  characterCount?: boolean;
}

const AccessibleTextInput: React.FC<AccessibleTextInputProps> = ({
  label,
  value,
  onChangeText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  required = false,
  invalid = false,
  errorMessage,
  helpText,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  autoComplete,
  keyboardType = 'default',
  returnKeyType = 'done',
  maxLength,
  characterCount = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
  ...props
}) => {
  const theme = useTheme();
  const { settings, getAccessibleFontSize, announceError } = useAccessibility();
  const inputRef = useRef<TextInput>(null);
  const errorId = `${testID || 'input'}-error`;
  const helpId = `${testID || 'input'}-help`;
  const countId = `${testID || 'input'}-count`;

  // Announce errors when they change
  useEffect(() => {
    if (invalid && errorMessage) {
      announceError(errorMessage);
    }
  }, [invalid, errorMessage, announceError]);

  const getAccessibilityLabel = () => {
    if (accessibilityLabel) return accessibilityLabel;
    
    let labelText = label;
    if (required) labelText += ', required';
    if (multiline) labelText += ', text area';
    if (secureTextEntry) labelText += ', secure text entry';
    
    return labelText;
  };

  const getAccessibilityHint = () => {
    if (accessibilityHint) return accessibilityHint;
    
    let hint = '';
    if (helpText) hint += helpText;
    if (maxLength) {
      const remaining = maxLength - value.length;
      hint += `. ${remaining} characters remaining`;
    }
    
    return hint || undefined;
  };

  const getAccessibilityState = () => {
    return {
      disabled: disabled,
    };
  };

  const getContainerStyle = () => {
    const baseStyle = {
      marginBottom: moderateScale(16),
      opacity: disabled ? 0.6 : 1,
    };

    switch (variant) {
      case 'filled':
        return [styles.filledContainer, baseStyle, { backgroundColor: theme.colors.surface }];
      case 'standard':
        return [styles.standardContainer, baseStyle];
      default:
        return [
          styles.outlinedContainer, 
          baseStyle, 
          {
            borderColor: invalid 
              ? theme.colors.error 
              : theme.colors.border,
            backgroundColor: theme.colors.surface,
          }
        ];
    }
  };

  const getInputStyle = () => {
    const fontSize = getAccessibleFontSize(moderateScale(16));
    
    return [
      styles.input,
      {
        color: theme.colors.text,
        fontSize,
        fontWeight: settings.isBoldTextEnabled ? '600' : '400',
        minHeight: Platform.OS === 'ios' ? 44 : 48, // Minimum touch target
        textAlign: Platform.OS === 'android' && 
                  ['ar', 'he', 'fa'].includes('en') ? 'right' : 'left',
      },
      multiline && { 
        minHeight: moderateScale(100),
        textAlignVertical: 'top',
      },
      style,
    ];
  };

  const getLabelStyle = () => {
    return [
      styles.label,
      {
        color: invalid ? theme.colors.error : theme.colors.text,
        fontSize: getAccessibleFontSize(moderateScale(14)),
        fontWeight: settings.isBoldTextEnabled ? '600' : '500',
      },
    ];
  };

  const focus = () => {
    inputRef.current?.focus();
  };

  const blur = () => {
    inputRef.current?.blur();
  };

  return (
    <View style={getContainerStyle()}>
      {/* Label */}
      <Text style={getLabelStyle()}>
        {label}
        {required && (
          <Text style={[styles.required, { color: theme.colors.error }]}>
            {' *'}
          </Text>
        )}
      </Text>

      {/* Input Container */}
      <View style={[styles.inputContainer, invalid && styles.errorBorder]}>
        {/* Left Icon */}
        {leftIcon && (
          <Icon 
            name={leftIcon} 
            size={moderateScale(20)} 
            color={theme.colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          style={getInputStyle()}
          placeholder={props.placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          editable={!disabled}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          autoComplete={autoComplete}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          maxLength={maxLength}
          // Accessibility props
          accessible={true}
          accessibilityLabel={getAccessibilityLabel()}
          accessibilityHint={getAccessibilityHint()}
          accessibilityRole="text"
          accessibilityState={getAccessibilityState()}
          accessibilityRequired={required}
          accessibilityInvalid={invalid}
          accessibilityLabelledBy={undefined}
          accessibilityDescribedBy={invalid ? errorId : helpText ? helpId : undefined}
          testID={testID}
          // Focus management
          onFocus={() => {
            props.onFocus?.();
            if (invalid && errorMessage) {
              setTimeout(() => announceError(errorMessage), 100);
            }
          }}
          onBlur={() => {
            props.onBlur?.();
            blur();
          }}
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <Icon 
            name={rightIcon} 
            size={moderateScale(20)} 
            color={theme.colors.textSecondary}
            style={styles.rightIcon}
            onPress={onRightIconPress}
            accessible={!!onRightIconPress}
            accessibilityRole={onRightIconPress ? 'button' : undefined}
            accessibilityLabel={onRightIconPress ? `${rightIcon} button` : undefined}
          />
        )}
      </View>

      {/* Character Count */}
      {characterCount && maxLength && (
        <Text 
          style={[styles.characterCount, { color: theme.colors.textSecondary }]}
          accessible={true}
          accessibilityLabel={`${value.length} of ${maxLength} characters used`}
          accessibilityLiveRegion="polite"
          nativeID={countId}
        >
          {value.length}/{maxLength}
        </Text>
      )}

      {/* Help Text */}
      {helpText && !invalid && (
        <Text 
          style={[styles.helpText, { color: theme.colors.textSecondary }]}
          nativeID={helpId}
          accessible={true}
          accessibilityRole="text"
        >
          {helpText}
        </Text>
      )}

      {/* Error Message */}
      {invalid && errorMessage && (
        <Text 
          style={[styles.errorText, { color: theme.colors.error }]}
          nativeID={errorId}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
        >
          <Icon name="error" size={moderateScale(14)} color={theme.colors.error} />
          {' '}{errorMessage}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  outlinedContainer: {
    borderWidth: 1,
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
  },
  filledContainer: {
    borderRadius: moderateScale(8),
    padding: moderateScale(12),
  },
  standardContainer: {
    borderBottomWidth: 1,
    paddingBottom: moderateScale(8),
  },
  label: {
    marginBottom: moderateScale(8),
  },
  required: {
    fontSize: moderateScale(14),
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? moderateScale(12) : moderateScale(8),
    paddingHorizontal: moderateScale(4),
  },
  leftIcon: {
    marginRight: moderateScale(8),
  },
  rightIcon: {
    marginLeft: moderateScale(8),
  },
  errorBorder: {
    borderColor: '#F44336',
  },
  helpText: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(4),
  },
  errorText: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(4),
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: moderateScale(12),
    marginTop: moderateScale(4),
    textAlign: 'right',
  },
});

export default AccessibleTextInput;