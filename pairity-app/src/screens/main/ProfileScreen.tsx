import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Modal,
  Share,
  Alert,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'react-native-image-picker';
import { ProgressBar } from 'react-native-paper';
import CustomButton from '@/components/CustomButton';

const { width: screenWidth } = Dimensions.get('window');

interface ProfilePhoto {
  id: string;
  uri: string;
  isMain: boolean;
}

interface ProfilePrompt {
  id: string;
  question: string;
  answer: string;
  likes: number;
  comments: number;
}

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const scrollViewRef = useRef<ScrollView>(null);

  const [refreshing, setRefreshing] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0.75);

  const [photos, setPhotos] = useState<ProfilePhoto[]>([
    { id: '1', uri: 'https://i.pravatar.cc/600?img=8', isMain: true },
    { id: '2', uri: 'https://i.pravatar.cc/600?img=9', isMain: false },
    { id: '3', uri: 'https://i.pravatar.cc/600?img=10', isMain: false },
  ]);

  const [profileData] = useState({
    name: 'John Doe',
    age: 28,
    location: 'San Francisco, CA',
    work: 'Software Engineer at Tech Co',
    education: 'BS Computer Science, Stanford',
    height: "5'11\"",
    bodyType: 'Athletic',
    relationshipGoals: 'Long-term relationship',
    children: 'Want someday',
    languages: ['English', 'Spanish'],
    zodiac: 'Libra',
    bio: 'Adventure seeker, coffee enthusiast, and tech geek. Love hiking on weekends, trying new restaurants, and having deep conversations. Looking for someone who shares my passion for life and isn\'t afraid to be themselves.',
    interests: ['Hiking', 'Photography', 'Cooking', 'Travel', 'Music', 'Reading', 'Yoga', 'Movies'],
    lifestyle: {
      drinking: 'Socially',
      smoking: 'Never',
      workout: '3-4 times a week',
      pets: 'Dog lover',
      diet: 'No restrictions',
    },
    personality: {
      extroversion: 0.7,
      agreeable: 0.8,
      adventurous: 0.9,
      romantic: 0.75,
      ambitious: 0.85,
    },
    loveLanguage: 'Quality Time',
    lookingFor: 'Someone who values communication, has a great sense of humor, and is ready for a meaningful connection. Bonus points if you love dogs and spontaneous adventures!',
    dealBreakers: ['Smoking', 'No sense of humor', 'Dishonesty'],
    ageRange: { min: 24, max: 35 },
    maxDistance: 50,
  });

  const [prompts] = useState<ProfilePrompt[]>([
    {
      id: '1',
      question: 'My perfect Sunday involves...',
      answer: 'Sleeping in, brunch with friends, exploring a farmers market, and ending the day with a good movie and wine.',
      likes: 42,
      comments: 8,
    },
    {
      id: '2',
      question: 'The way to my heart is...',
      answer: 'Through good food, genuine laughter, and showing me your favorite hidden spots in the city.',
      likes: 38,
      comments: 5,
    },
    {
      id: '3',
      question: 'I\'ll know it\'s real when...',
      answer: 'We can be completely ourselves around each other, silence feels comfortable, and we make each other better people.',
      likes: 56,
      comments: 12,
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile' as never);
  };

  const handleSettings = () => {
    navigation.navigate('Settings' as never);
  };

  const handleShareProfile = async () => {
    try {
      await Share.share({
        message: `Check out my profile on Pairity: https://pairity.com/user/${user?.id}`,
        title: 'Share Profile',
      });
    } catch (error) {
      Alert.alert('Error', 'Unable to share profile');
    }
  };

  const handlePhotoUpload = () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        const newPhoto: ProfilePhoto = {
          id: Date.now().toString(),
          uri: response.assets[0].uri || '',
          isMain: photos.length === 0,
        };
        setPhotos([...photos, newPhoto]);
      }
    });
  };

  const renderPhoto = ({ item, index }: { item: ProfilePhoto; index: number }) => (
    <TouchableOpacity
      onPress={() => {
        setSelectedPhotoIndex(index);
        setShowPhotoModal(true);
      }}
    >
      <Image 
        source={{ uri: item.uri }} 
        style={styles.photo}
        contentFit="cover"
      />
      {item.isMain && (
        <View style={styles.mainPhotoBadge}>
          <Text style={styles.mainPhotoText}>Main</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderInterest = (interest: string) => (
    <View key={interest} style={styles.interestTag}>
      <Text style={styles.interestText}>{interest}</Text>
    </View>
  );

  const renderPrompt = (prompt: ProfilePrompt) => (
    <View key={prompt.id} style={styles.promptCard}>
      <Text style={styles.promptQuestion}>{prompt.question}</Text>
      <Text style={styles.promptAnswer}>{prompt.answer}</Text>
      <View style={styles.promptActions}>
        <TouchableOpacity style={styles.promptAction}>
          <Icon name="favorite-border" size={20} color="#666" />
          <Text style={styles.promptActionText}>{prompt.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.promptAction}>
          <Icon name="chat-bubble-outline" size={20} color="#666" />
          <Text style={styles.promptActionText}>{prompt.comments}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const PersonalityTrait = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.personalityTrait}>
      <Text style={styles.personalityLabel}>{label}</Text>
      <View style={styles.personalityBarContainer}>
        <View style={[styles.personalityBar, { width: `${value * 100}%` }]} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShareProfile} style={styles.headerButton}>
              <Icon name="share" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettings} style={styles.headerButton}>
              <Icon name="settings" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Photo Gallery */}
          <FlatList
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id}
            style={styles.photoGallery}
          />
          
          {photos.length < 6 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={handlePhotoUpload}>
              <Icon name="add-a-photo" size={24} color="#666" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          )}

          {/* Profile Completeness */}
          <View style={styles.completenessContainer}>
            <Text style={styles.completenessText}>
              Profile {Math.round(profileCompleteness * 100)}% Complete
            </Text>
            <ProgressBar
              progress={profileCompleteness}
              color="#FF6B6B"
              style={styles.progressBar}
            />
          </View>

          {/* Edit Profile Button */}
          <CustomButton
            title="Edit Profile"
            onPress={handleEditProfile}
            variant="primary"
            size="large"
            fullWidth
            style={styles.editButton}
          />
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <View style={styles.basicInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{profileData.name}, {profileData.age}</Text>
              {user?.isVerified && (
                <Icon name="verified" size={20} color="#339AF0" style={styles.verifiedIcon} />
              )}
            </View>
            <View style={styles.locationContainer}>
              <Icon name="location-on" size={16} color="#666" />
              <Text style={styles.location}>{profileData.location}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Icon name="work" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.work}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="school" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.education}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="straighten" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.height}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="fitness-center" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.bodyType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="favorite" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.relationshipGoals}</Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="child-care" size={20} color="#666" />
              <Text style={styles.infoText}>{profileData.children}</Text>
            </View>
          </View>
        </View>

        {/* About Me */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bio}>{profileData.bio}</Text>
          
          <Text style={styles.subsectionTitle}>Interests</Text>
          <View style={styles.interestsContainer}>
            {profileData.interests.map(renderInterest)}
          </View>

          <Text style={styles.subsectionTitle}>Lifestyle</Text>
          <View style={styles.lifestyleContainer}>
            <View style={styles.lifestyleItem}>
              <Icon name="local-bar" size={16} color="#666" />
              <Text style={styles.lifestyleText}>Drinks {profileData.lifestyle.drinking}</Text>
            </View>
            <View style={styles.lifestyleItem}>
              <Icon name="smoke-free" size={16} color="#666" />
              <Text style={styles.lifestyleText}>{profileData.lifestyle.smoking}</Text>
            </View>
            <View style={styles.lifestyleItem}>
              <Icon name="fitness-center" size={16} color="#666" />
              <Text style={styles.lifestyleText}>{profileData.lifestyle.workout}</Text>
            </View>
            <View style={styles.lifestyleItem}>
              <Icon name="pets" size={16} color="#666" />
              <Text style={styles.lifestyleText}>{profileData.lifestyle.pets}</Text>
            </View>
          </View>

          <Text style={styles.subsectionTitle}>Personality</Text>
          <PersonalityTrait label="Extroversion" value={profileData.personality.extroversion} />
          <PersonalityTrait label="Agreeable" value={profileData.personality.agreeable} />
          <PersonalityTrait label="Adventurous" value={profileData.personality.adventurous} />
          <PersonalityTrait label="Romantic" value={profileData.personality.romantic} />
          <PersonalityTrait label="Ambitious" value={profileData.personality.ambitious} />

          <Text style={styles.subsectionTitle}>Love Language</Text>
          <View style={styles.loveLanguageContainer}>
            <Icon name="favorite" size={20} color="#FF6B6B" />
            <Text style={styles.loveLanguageText}>{profileData.loveLanguage}</Text>
          </View>
        </View>

        {/* My Ideal Match */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Ideal Match</Text>
          <Text style={styles.lookingForText}>{profileData.lookingFor}</Text>
          
          <Text style={styles.subsectionTitle}>Preferences</Text>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Age Range:</Text>
            <Text style={styles.preferenceValue}>
              {profileData.ageRange.min} - {profileData.ageRange.max} years
            </Text>
          </View>
          <View style={styles.preferenceItem}>
            <Text style={styles.preferenceLabel}>Distance:</Text>
            <Text style={styles.preferenceValue}>Within {profileData.maxDistance} miles</Text>
          </View>
        </View>

        {/* Profile Prompts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Answers</Text>
          {prompts.map(renderPrompt)}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Photo Modal */}
      <Modal
        visible={showPhotoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowPhotoModal(false)}
          />
          <View style={styles.modalContent}>
            <FlatList
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              data={photos}
              renderItem={({ item }) => (
                <Image 
                  source={{ uri: item.uri }} 
                  style={styles.modalPhoto}
                  contentFit="contain"
                />
              )}
              keyExtractor={(item) => item.id}
              initialScrollIndex={selectedPhotoIndex}
              getItemLayout={(data, index) => ({
                length: screenWidth,
                offset: screenWidth * index,
                index,
              })}
            />
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setShowPhotoModal(false)}
            >
              <Icon name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingBottom: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  headerButton: {
    padding: 8,
    marginLeft: 12,
  },
  photoGallery: {
    aspectRatio: 4/5, // Standard portrait ratio for dating apps
  },
  photo: {
    width: '100%',
    aspectRatio: 4/5,
  },
  mainPhotoBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  mainPhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  addPhotoButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  addPhotoText: {
    marginLeft: 8,
    color: '#666',
    fontWeight: '600',
  },
  completenessContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  completenessText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  editButton: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  basicInfo: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  verifiedIcon: {
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  bio: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 14,
    color: '#333',
  },
  lifestyleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  lifestyleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  lifestyleText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  personalityTrait: {
    marginBottom: 12,
  },
  personalityLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  personalityBarContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  personalityBar: {
    height: 8,
    backgroundColor: '#FF6B6B',
    borderRadius: 4,
  },
  loveLanguageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
  },
  loveLanguageText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
  lookingForText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  preferenceLabel: {
    fontSize: 14,
    color: '#666',
  },
  preferenceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  promptCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  promptQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  promptAnswer: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  promptActions: {
    flexDirection: 'row',
  },
  promptAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  promptActionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bottomSpacer: {
    height: 100,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
  },
  modalPhoto: {
    width: '100%',
    flex: 1,
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
});

export default ProfileScreen;