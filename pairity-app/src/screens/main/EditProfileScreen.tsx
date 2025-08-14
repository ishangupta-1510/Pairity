import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import * as ImagePicker from 'react-native-image-picker';
import CustomButton from '@/components/CustomButton';
import CustomTextInput from '@/components/CustomTextInput';
import PhotosTab from './EditProfile/PhotosTab';
import BasicInfoTab from './EditProfile/BasicInfoTab';
import PreferencesTab from './EditProfile/PreferencesTab';
import PromptsTab from './EditProfile/PromptsTab';

const { width: screenWidth } = Dimensions.get('window');

interface EditProfileData {
  name: string;
  bio: string;
  work: string;
  education: string;
  height: string;
  bodyType: string;
  relationshipGoals: string;
  children: string;
  drinking: string;
  smoking: string;
  workout: string;
  pets: string;
  diet: string;
  zodiac: string;
  loveLanguage: string;
  lookingFor: string;
  ageRangeMin: number;
  ageRangeMax: number;
  maxDistance: number;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'photos', title: 'Photos', icon: 'photo-camera' },
    { key: 'basicInfo', title: 'Basic Info', icon: 'person' },
    { key: 'preferences', title: 'Preferences', icon: 'tune' },
    { key: 'prompts', title: 'Prompts', icon: 'question-answer' },
  ]);
  
  const [hasChanges, setHasChanges] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<EditProfileData>({
    defaultValues: {
      name: user?.firstName || '',
      bio: '',
      work: '',
      education: '',
      height: '',
      bodyType: 'Average',
      relationshipGoals: 'Long-term relationship',
      children: 'Want someday',
      drinking: 'Socially',
      smoking: 'Never',
      workout: '3-4 times a week',
      pets: 'Dog lover',
      diet: 'No restrictions',
      zodiac: 'Libra',
      loveLanguage: 'Quality Time',
      lookingFor: '',
      ageRangeMin: 24,
      ageRangeMax: 35,
      maxDistance: 50,
    },
  });

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveEnabled && isDirty) {
      const subscription = watch((data) => {
        autoSaveProfile(data);
      });
      return () => subscription.unsubscribe();
    }
  }, [watch, isDirty, autoSaveEnabled]);

  const autoSaveProfile = async (data: any) => {
    try {
      await AsyncStorage.setItem('profileDraft', JSON.stringify(data));
      setHasChanges(true);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  const loadDraft = async () => {
    try {
      const draft = await AsyncStorage.getItem('profileDraft');
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        reset(parsedDraft);
        Alert.alert('Draft Found', 'Would you like to continue editing your previous changes?', [
          { text: 'Discard', onPress: () => clearDraft() },
          { text: 'Continue', onPress: () => {} },
        ]);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const clearDraft = async () => {
    try {
      await AsyncStorage.removeItem('profileDraft');
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  useEffect(() => {
    loadDraft();
  }, []);

  const onSaveAndContinue = async (data: EditProfileData) => {
    try {
      // API call to save profile
      console.log('Saving profile:', data);
      setHasChanges(false);
      await clearDraft();
      Alert.alert('Success', 'Profile saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const onSaveAndView = async (data: EditProfileData) => {
    try {
      await onSaveAndContinue(data);
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  const handleDiscardChanges = () => {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: async () => {
              await clearDraft();
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      style={styles.tabBar}
      indicatorStyle={styles.tabIndicator}
      labelStyle={styles.tabLabel}
      tabStyle={styles.tab}
      scrollEnabled
      renderIcon={({ route, focused }) => (
        <Icon
          name={route.icon}
          size={20}
          color={focused ? '#FF6B6B' : '#999'}
        />
      )}
    />
  );

  const renderScene = SceneMap({
    photos: () => <PhotosTab />,
    basicInfo: () => <BasicInfoTab control={control} errors={errors} />,
    preferences: () => <PreferencesTab control={control} errors={errors} />,
    prompts: () => <PromptsTab />,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscardChanges} style={styles.headerButton}>
          <Icon name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfilePreview' as never)}
          style={styles.headerButton}
        >
          <Icon name="visibility" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {hasChanges && (
        <View style={styles.changeIndicator}>
          <Icon name="info" size={16} color="#FF6B6B" />
          <Text style={styles.changeIndicatorText}>You have unsaved changes</Text>
        </View>
      )}

      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: screenWidth }}
        renderTabBar={renderTabBar}
        swipeEnabled
        lazy
      />

      <View style={styles.footer}>
        <CustomButton
          title="Save & Continue"
          onPress={handleSubmit(onSaveAndContinue)}
          variant="outline"
          size="medium"
          style={styles.footerButton}
        />
        <CustomButton
          title="Save & View"
          onPress={handleSubmit(onSaveAndView)}
          variant="primary"
          size="medium"
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  changeIndicatorText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  tabBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    width: 'auto',
    minWidth: 100,
  },
  tabIndicator: {
    backgroundColor: '#FF6B6B',
    height: 3,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'none',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default EditProfileScreen;