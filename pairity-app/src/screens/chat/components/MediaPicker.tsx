import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface MediaPickerProps {
  onSelect: (media: any) => void;
  onClose: () => void;
}

const MediaPicker: React.FC<MediaPickerProps> = ({ onSelect, onClose }) => {
  const handleImagePicker = () => {
    // Simulate image selection
    onSelect({
      type: 'image',
      uri: 'https://picsum.photos/400/300',
      width: 400,
      height: 300,
    });
  };

  const handleVideoPicker = () => {
    onSelect({
      type: 'video',
      uri: 'video_url',
      thumbnail: 'https://picsum.photos/400/300',
      duration: 45,
    });
  };

  const handleGif = () => {
    onSelect({
      type: 'gif',
      uri: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyO/giphy.gif',
    });
  };

  const handleLocation = () => {
    onSelect({
      type: 'location',
      uri: '37.7749,-122.4194',
    });
  };

  const options = [
    { icon: 'photo-library', label: 'Gallery', color: '#9C27B0', onPress: handleImagePicker },
    { icon: 'photo-camera', label: 'Camera', color: '#FF6B6B', onPress: handleImagePicker },
    { icon: 'videocam', label: 'Video', color: '#339AF0', onPress: handleVideoPicker },
    { icon: 'gif', label: 'GIF', color: '#51CF66', onPress: handleGif },
    { icon: 'location-on', label: 'Location', color: '#FFD43B', onPress: handleLocation },
  ];

  return (
    <Modal
      visible={true}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.container}>
          <View style={styles.handle} />
          <Text style={styles.title}>Share</Text>
          <View style={styles.optionsGrid}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.option}
                onPress={option.onPress}
              >
                <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                  <Icon name={option.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.optionLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 30,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
  },
  option: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 12,
    color: '#666',
  },
});

export default MediaPicker;