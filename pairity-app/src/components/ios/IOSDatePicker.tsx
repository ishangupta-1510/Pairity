import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface IOSDatePickerProps {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
  onChange: (date: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  minuteInterval?: 1 | 2 | 3 | 4 | 5 | 6 | 10 | 12 | 15 | 20 | 30;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  format?: (date: Date) => string;
}

const IOSDatePicker: React.FC<IOSDatePickerProps> = ({
  value,
  mode = 'date',
  display = 'spinner',
  onChange,
  minimumDate,
  maximumDate,
  minuteInterval,
  label,
  placeholder = 'Select date',
  disabled = false,
  format,
}) => {
  const theme = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(value);

  const formatDate = (date: Date): string => {
    if (format) return format(date);
    
    if (mode === 'date') {
      return date.toLocaleDateString();
    } else if (mode === 'time') {
      return date.toLocaleTimeString();
    } else {
      return date.toLocaleString();
    }
  };

  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleDone = () => {
    onChange(tempDate);
    setShowPicker(false);
  };

  const handleCancel = () => {
    setTempDate(value);
    setShowPicker(false);
  };

  if (Platform.OS !== 'ios') {
    // Fallback for non-iOS platforms
    return (
      <View style={styles.container}>
        {label && (
          <Text style={[styles.label, { color: theme.colors.text }]}>
            {label}
          </Text>
        )}
        <TouchableOpacity
          style={[
            styles.input,
            { backgroundColor: theme.colors.surface },
            disabled && styles.disabled,
          ]}
          onPress={() => setShowPicker(true)}
          disabled={disabled}
        >
          <Text style={[styles.inputText, { color: theme.colors.text }]}>
            {value ? formatDate(value) : placeholder}
          </Text>
        </TouchableOpacity>
        {showPicker && (
          <DateTimePicker
            value={tempDate || new Date()}
            mode={mode}
            display={display}
            onChange={handleChange}
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            minuteInterval={minuteInterval}
          />
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {label}
        </Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.input,
          { backgroundColor: theme.colors.surface },
          disabled && styles.disabled,
        ]}
        onPress={() => setShowPicker(true)}
        disabled={disabled}
      >
        <Text style={[styles.inputText, { color: theme.colors.text }]}>
          {value ? formatDate(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showPicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={handleCancel}
            activeOpacity={1}
          />
          
          <View style={[styles.pickerContainer, { backgroundColor: theme.colors.surface }]}>
            <View style={[styles.pickerHeader, { borderBottomColor: theme.colors.border }]}>
              <TouchableOpacity onPress={handleCancel}>
                <Text style={[styles.headerButton, { color: theme.colors.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              
              <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
                {label || 'Select Date'}
              </Text>
              
              <TouchableOpacity onPress={handleDone}>
                <Text style={[styles.headerButton, { color: theme.colors.primary }]}>
                  Done
                </Text>
              </TouchableOpacity>
            </View>
            
            <DateTimePicker
              value={tempDate || new Date()}
              mode={mode}
              display={display}
              onChange={handleChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              minuteInterval={minuteInterval}
              style={styles.picker}
              textColor={theme.colors.text}
              themeVariant={theme.dark ? 'dark' : 'light'}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: moderateScale(16),
  },
  label: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    marginBottom: moderateScale(8),
  },
  input: {
    height: moderateScale(48),
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(16),
    justifyContent: 'center',
  },
  inputText: {
    fontSize: moderateScale(16),
  },
  disabled: {
    opacity: 0.5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    paddingBottom: moderateScale(20),
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: moderateScale(17),
    fontWeight: '600',
  },
  headerButton: {
    fontSize: moderateScale(17),
    fontWeight: '500',
  },
  picker: {
    height: moderateScale(216),
  },
});

export default IOSDatePicker;