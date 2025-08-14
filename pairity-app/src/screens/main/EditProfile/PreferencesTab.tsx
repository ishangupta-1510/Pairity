import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';
import CustomPicker from '@/components/CustomPicker';
import CustomTextInput from '@/components/CustomTextInput';

interface PreferencesTabProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

const PreferencesTab: React.FC<PreferencesTabProps> = ({ control, errors }) => {
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showDistance: true,
    showActiveStatus: true,
    readReceipts: true,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    superLikes: true,
    promotions: false,
    inAppSounds: true,
    inAppVibrations: true,
  });

  const drinkingOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Rarely', value: 'rarely' },
    { label: 'Socially', value: 'socially' },
    { label: 'Frequently', value: 'frequently' },
    { label: 'Prefer not to say', value: 'prefer-not' },
  ];

  const smokingOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Occasionally', value: 'occasionally' },
    { label: 'Socially', value: 'socially' },
    { label: 'Regularly', value: 'regularly' },
    { label: 'Trying to quit', value: 'quitting' },
  ];

  const workoutOptions = [
    { label: 'Never', value: 'never' },
    { label: 'Rarely', value: 'rarely' },
    { label: '1-2 times a week', value: '1-2' },
    { label: '3-4 times a week', value: '3-4' },
    { label: '5+ times a week', value: '5+' },
    { label: 'Every day', value: 'daily' },
  ];

  const petsOptions = [
    { label: 'No pets', value: 'none' },
    { label: 'Dog lover', value: 'dog' },
    { label: 'Cat lover', value: 'cat' },
    { label: 'All pets', value: 'all' },
    { label: 'Allergic to pets', value: 'allergic' },
    { label: 'Other pets', value: 'other' },
  ];

  const dietOptions = [
    { label: 'No restrictions', value: 'none' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Pescatarian', value: 'pescatarian' },
    { label: 'Kosher', value: 'kosher' },
    { label: 'Halal', value: 'halal' },
    { label: 'Gluten-free', value: 'gluten-free' },
    { label: 'Keto', value: 'keto' },
  ];

  const loveLanguageOptions = [
    { label: 'Words of Affirmation', value: 'words' },
    { label: 'Quality Time', value: 'time' },
    { label: 'Physical Touch', value: 'touch' },
    { label: 'Acts of Service', value: 'service' },
    { label: 'Receiving Gifts', value: 'gifts' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Dating Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dating Preferences</Text>
        
        <View style={styles.preferenceItem}>
          <Text style={styles.label}>Age Range</Text>
          <Controller
            control={control}
            name="ageRangeMin"
            render={({ field: { onChange, value } }) => (
              <View>
                <View style={styles.rangeDisplay}>
                  <Text style={styles.rangeText}>{value || 18} - </Text>
                  <Controller
                    control={control}
                    name="ageRangeMax"
                    render={({ field: { value: maxValue } }) => (
                      <Text style={styles.rangeText}>{maxValue || 35} years</Text>
                    )}
                  />
                </View>
                <View style={styles.dualSliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={18}
                    maximumValue={60}
                    step={1}
                    value={value || 24}
                    onValueChange={onChange}
                    minimumTrackTintColor="#FF6B6B"
                    maximumTrackTintColor="#ddd"
                    thumbTintColor="#FF6B6B"
                  />
                  <Controller
                    control={control}
                    name="ageRangeMax"
                    render={({ field: { onChange: onChangeMax, value: maxValue } }) => (
                      <Slider
                        style={[styles.slider, styles.sliderOverlay]}
                        minimumValue={18}
                        maximumValue={60}
                        step={1}
                        value={maxValue || 35}
                        onValueChange={onChangeMax}
                        minimumTrackTintColor="transparent"
                        maximumTrackTintColor="#ddd"
                        thumbTintColor="#FF6B6B"
                      />
                    )}
                  />
                </View>
              </View>
            )}
          />
        </View>

        <View style={styles.preferenceItem}>
          <Text style={styles.label}>Maximum Distance</Text>
          <Controller
            control={control}
            name="maxDistance"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.rangeText}>{value || 50} miles</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={1}
                  maximumValue={100}
                  step={1}
                  value={value || 50}
                  onValueChange={onChange}
                  minimumTrackTintColor="#FF6B6B"
                  maximumTrackTintColor="#ddd"
                  thumbTintColor="#FF6B6B"
                />
              </View>
            )}
          />
        </View>

        <Controller
          control={control}
          name="lookingFor"
          render={({ field: { onChange, value } }) => (
            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>What I'm Looking For</Text>
              <CustomTextInput
                value={value}
                onChangeText={onChange}
                placeholder="Describe your ideal match..."
                multiline
                numberOfLines={3}
                maxLength={300}
                style={styles.textArea}
              />
              <Text style={styles.characterCount}>{value?.length || 0}/300</Text>
            </View>
          )}
        />
      </View>

      {/* Lifestyle Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lifestyle</Text>
        
        <Controller
          control={control}
          name="drinking"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Drinking"
              value={value}
              onValueChange={onChange}
              items={drinkingOptions}
              icon="local-bar"
            />
          )}
        />

        <Controller
          control={control}
          name="smoking"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Smoking"
              value={value}
              onValueChange={onChange}
              items={smokingOptions}
              icon="smoke-free"
            />
          )}
        />

        <Controller
          control={control}
          name="workout"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Exercise"
              value={value}
              onValueChange={onChange}
              items={workoutOptions}
              icon="fitness-center"
            />
          )}
        />

        <Controller
          control={control}
          name="pets"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Pets"
              value={value}
              onValueChange={onChange}
              items={petsOptions}
              icon="pets"
            />
          )}
        />

        <Controller
          control={control}
          name="diet"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Diet"
              value={value}
              onValueChange={onChange}
              items={dietOptions}
              icon="restaurant"
            />
          )}
        />

        <Controller
          control={control}
          name="loveLanguage"
          render={({ field: { onChange, value } }) => (
            <CustomPicker
              label="Love Language"
              value={value}
              onValueChange={onChange}
              items={loveLanguageOptions}
              icon="favorite"
            />
          )}
        />
      </View>

      {/* Privacy Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="visibility" size={20} color="#666" />
            <Text style={styles.switchText}>Show My Profile</Text>
          </View>
          <Switch
            value={privacySettings.showProfile}
            onValueChange={(value) =>
              setPrivacySettings({ ...privacySettings, showProfile: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="location-on" size={20} color="#666" />
            <Text style={styles.switchText}>Show Distance</Text>
          </View>
          <Switch
            value={privacySettings.showDistance}
            onValueChange={(value) =>
              setPrivacySettings({ ...privacySettings, showDistance: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="circle" size={20} color="#666" />
            <Text style={styles.switchText}>Show Active Status</Text>
          </View>
          <Switch
            value={privacySettings.showActiveStatus}
            onValueChange={(value) =>
              setPrivacySettings({ ...privacySettings, showActiveStatus: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="done-all" size={20} color="#666" />
            <Text style={styles.switchText}>Read Receipts</Text>
          </View>
          <Switch
            value={privacySettings.readReceipts}
            onValueChange={(value) =>
              setPrivacySettings({ ...privacySettings, readReceipts: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notification Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="favorite" size={20} color="#666" />
            <Text style={styles.switchText}>New Matches</Text>
          </View>
          <Switch
            value={notificationSettings.newMatches}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, newMatches: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="chat" size={20} color="#666" />
            <Text style={styles.switchText}>Messages</Text>
          </View>
          <Switch
            value={notificationSettings.messages}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, messages: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="thumb-up" size={20} color="#666" />
            <Text style={styles.switchText}>Likes</Text>
          </View>
          <Switch
            value={notificationSettings.likes}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, likes: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.switchItem}>
          <View style={styles.switchLabel}>
            <Icon name="star" size={20} color="#666" />
            <Text style={styles.switchText}>Super Likes</Text>
          </View>
          <Switch
            value={notificationSettings.superLikes}
            onValueChange={(value) =>
              setNotificationSettings({ ...notificationSettings, superLikes: value })
            }
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor="#fff"
          />
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  preferenceItem: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  rangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rangeText: {
    fontSize: 16,
    color: '#666',
  },
  dualSliderContainer: {
    position: 'relative',
    height: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderOverlay: {
    position: 'absolute',
    top: 0,
  },
  textAreaContainer: {
    marginTop: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  bottomSpacer: {
    height: 100,
  },
});

export default PreferencesTab;