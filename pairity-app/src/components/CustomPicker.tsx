import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width: screenWidth } = Dimensions.get('window');

interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  items: PickerItem[];
  placeholder?: string;
  error?: string;
  icon?: string;
  disabled?: boolean;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  label,
  value,
  onValueChange,
  items,
  placeholder = 'Select an option',
  error,
  icon,
  disabled = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedItem = items.find(item => item.value === value);

  const handleSelect = (itemValue: string) => {
    onValueChange(itemValue);
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: PickerItem }) => (
    <TouchableOpacity
      style={[
        styles.item,
        item.value === value && styles.itemSelected,
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text style={[
        styles.itemText,
        item.value === value && styles.itemTextSelected,
      ]}>
        {item.label}
      </Text>
      {item.value === value && (
        <Icon name="check" size={20} color="#FF6B6B" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={[
          styles.picker,
          error && styles.pickerError,
          disabled && styles.pickerDisabled,
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.pickerContent}>
          {icon && (
            <Icon
              name={icon}
              size={20}
              color={disabled ? '#999' : '#666'}
              style={styles.icon}
            />
          )}
          <Text style={[
            styles.pickerText,
            !selectedItem && styles.placeholderText,
            disabled && styles.disabledText,
          ]}>
            {selectedItem ? selectedItem.label : placeholder}
          </Text>
        </View>
        <Icon
          name="arrow-drop-down"
          size={24}
          color={disabled ? '#999' : '#666'}
        />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label || 'Select Option'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Icon name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              renderItem={renderItem}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  pickerError: {
    borderColor: '#FF6B6B',
  },
  pickerDisabled: {
    backgroundColor: '#f5f5f5',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  placeholderText: {
    color: '#999',
  },
  disabledText: {
    color: '#999',
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  list: {
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemSelected: {
    backgroundColor: '#FFF5F5',
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
  itemTextSelected: {
    color: '#FF6B6B',
    fontWeight: '600',
  },
});

export default CustomPicker;