import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  showFilter?: boolean;
  onFilterPress?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFocus,
  onBlur,
  showFilter = false,
  onFilterPress,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedWidth = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedWidth, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
    onBlur?.();
  };

  const handleClear = () => {
    onChangeText('');
  };

  const borderColor = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#FF6B6B'],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      <Icon name="search" size={20} color={isFocused ? '#FF6B6B' : '#999'} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
          <Icon name="close" size={18} color="#999" />
        </TouchableOpacity>
      )}
      {showFilter && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterButton}>
          <Icon name="tune" size={20} color="#666" />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 0,
  },
  clearButton: {
    padding: 4,
  },
  filterButton: {
    padding: 4,
    marginLeft: 8,
    borderLeftWidth: 1,
    borderLeftColor: '#e0e0e0',
    paddingLeft: 12,
  },
});

export default SearchBar;