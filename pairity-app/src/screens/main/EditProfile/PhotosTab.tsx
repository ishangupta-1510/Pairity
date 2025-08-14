import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import CustomButton from '@/components/CustomButton';

const { width: screenWidth } = Dimensions.get('window');

interface Photo {
  id: string;
  uri: string;
  isMain: boolean;
  order: number;
}

const PhotosTab: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([
    { id: '1', uri: 'https://i.pravatar.cc/600?img=8', isMain: true, order: 0 },
    { id: '2', uri: 'https://i.pravatar.cc/600?img=9', isMain: false, order: 1 },
    { id: '3', uri: 'https://i.pravatar.cc/600?img=10', isMain: false, order: 2 },
  ]);
  
  const [showTipsModal, setShowTipsModal] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const handlePhotoUpload = () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    Alert.alert(
      'Add Photo',
      'Choose from where you want to select a photo',
      [
        { text: 'Camera', onPress: () => launchCamera(options) },
        { text: 'Gallery', onPress: () => launchGallery(options) },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const launchCamera = (options: ImagePicker.ImagePickerOptions) => {
    ImagePicker.launchCamera(options, handleImageResponse);
  };

  const launchGallery = (options: ImagePicker.ImagePickerOptions) => {
    ImagePicker.launchImageLibrary(options, handleImageResponse);
  };

  const handleImageResponse = (response: ImagePicker.ImagePickerResponse) => {
    if (response.assets && response.assets[0]) {
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri: response.assets[0].uri || '',
        isMain: photos.length === 0,
        order: photos.length,
      };
      setPhotos([...photos, newPhoto]);
    }
  };

  const deletePhoto = (photoId: string) => {
    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedPhotos = photos.filter(p => p.id !== photoId);
            // Update main photo if deleted
            if (updatedPhotos.length > 0 && !updatedPhotos.some(p => p.isMain)) {
              updatedPhotos[0].isMain = true;
            }
            setPhotos(updatedPhotos);
          },
        },
      ]
    );
  };

  const setMainPhoto = (photoId: string) => {
    const updatedPhotos = photos.map(photo => ({
      ...photo,
      isMain: photo.id === photoId,
    }));
    setPhotos(updatedPhotos);
  };

  const renderPhoto = ({ item, drag, isActive }: RenderItemParams<Photo>) => {
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[styles.photoContainer, isActive && styles.photoContainerActive]}
        >
          <Image source={{ uri: item.uri }} style={styles.photo} />
          {item.isMain && (
            <View style={styles.mainBadge}>
              <Text style={styles.mainBadgeText}>Main</Text>
            </View>
          )}
          <View style={styles.photoActions}>
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => setMainPhoto(item.id)}
            >
              <Icon name="star" size={20} color={item.isMain ? '#FFD43B' : '#fff'} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.photoActionButton}
              onPress={() => deletePhoto(item.id)}
            >
              <Icon name="delete" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const PhotoTips = () => (
    <Modal
      visible={showTipsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTipsModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Photo Tips</Text>
            <TouchableOpacity onPress={() => setShowTipsModal(false)}>
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.tipsContent}>
            <View style={styles.tipItem}>
              <Icon name="photo-camera" size={24} color="#FF6B6B" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Show Your Face Clearly</Text>
                <Text style={styles.tipDescription}>
                  Make sure your face is visible in at least 3 photos
                </Text>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="people" size={24} color="#FF6B6B" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Include Full Body Shots</Text>
                <Text style={styles.tipDescription}>
                  Add at least one full-length photo
                </Text>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="wb-sunny" size={24} color="#FF6B6B" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Good Lighting</Text>
                <Text style={styles.tipDescription}>
                  Natural lighting works best for photos
                </Text>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="mood" size={24} color="#FF6B6B" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Smile!</Text>
                <Text style={styles.tipDescription}>
                  Profiles with smiling photos get 14% more likes
                </Text>
              </View>
            </View>
            
            <View style={styles.tipItem}>
              <Icon name="do-not-disturb" size={24} color="#FF6B6B" />
              <View style={styles.tipTextContainer}>
                <Text style={styles.tipTitle}>Avoid Filters</Text>
                <Text style={styles.tipDescription}>
                  Use real, unfiltered photos for authenticity
                </Text>
              </View>
            </View>
          </ScrollView>
          
          <CustomButton
            title="Got It!"
            onPress={() => setShowTipsModal(false)}
            variant="primary"
            fullWidth
            style={styles.tipButton}
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your Photos</Text>
          <TouchableOpacity onPress={() => setShowTipsModal(true)}>
            <Icon name="help-outline" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.sectionDescription}>
          Add up to 6 photos. Drag to reorder them.
        </Text>
        
        <View style={styles.photosGrid}>
          <DraggableFlatList
            data={photos}
            onDragEnd={({ data }) => setPhotos(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderPhoto}
            numColumns={3}
            scrollEnabled={false}
          />
          
          {photos.length < 6 && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={handlePhotoUpload}
            >
              <Icon name="add" size={32} color="#666" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Video Introduction</Text>
        <Text style={styles.sectionDescription}>
          Record a 30-second video to introduce yourself (Premium feature)
        </Text>
        
        <TouchableOpacity style={styles.videoUploadButton}>
          <Icon name="videocam" size={32} color="#FF6B6B" />
          <Text style={styles.videoUploadText}>Record Video</Text>
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        </TouchableOpacity>
      </View>
      
      <PhotoTips />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  photoContainer: {
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3,
    margin: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoContainerActive: {
    opacity: 0.8,
    transform: [{ scale: 1.05 }],
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  mainBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mainBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  photoActions: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
  },
  photoActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 6,
    borderRadius: 20,
    marginLeft: 4,
  },
  addPhotoButton: {
    width: (screenWidth - 50) / 3,
    height: (screenWidth - 50) / 3,
    margin: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  videoUploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFE0E0',
    borderStyle: 'dashed',
    backgroundColor: '#FFF5F5',
  },
  videoUploadText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginTop: 8,
    fontWeight: '600',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FFD43B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  tipsContent: {
    padding: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  tipTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipDescription: {
    fontSize: 14,
    color: '#666',
  },
  tipButton: {
    margin: 20,
  },
});

export default PhotosTab;