import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Slider from '@react-native-community/slider';

interface SettingsScreenProps {}

const SettingsScreen: React.FC<SettingsScreenProps> = () => {
  const navigation = useNavigation();
  
  // Discovery Settings State
  const [maxDistance, setMaxDistance] = useState(25);
  const [ageRange, setAgeRange] = useState([22, 35]);
  const [showMe, setShowMe] = useState('everyone');
  const [globalMode, setGlobalMode] = useState(false);
  const [recentlyActive, setRecentlyActive] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Privacy Settings State
  const [profileVisible, setProfileVisible] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [onlineStatus, setOnlineStatus] = useState(true);
  const [showDistance, setShowDistance] = useState(true);
  const [profileInSearch, setProfileInSearch] = useState(false);
  const [messagePermission, setMessagePermission] = useState('everyone');

  // Notification Settings State
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    likes: true,
    profileViews: false,
    promotions: false,
    datingTips: true,
  });
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement sign out logic
            console.log('Signing out...');
          }
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            // TODO: Implement account deletion
            console.log('Deleting account...');
          }
        },
      ]
    );
  };

  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  const renderSettingItem = (
    title: string,
    subtitle?: string,
    rightComponent?: React.ReactNode,
    onPress?: () => void,
    showArrow: boolean = false
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.settingRight}>
        {rightComponent}
        {showArrow && (
          <Icon name="chevron-right" size={24} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSlider = (
    title: string,
    value: number,
    onValueChange: (value: number) => void,
    minimumValue: number = 1,
    maximumValue: number = 100,
    unit: string = 'miles'
  ) => (
    <View style={styles.sliderContainer}>
      <Text style={styles.settingTitle}>{title}</Text>
      <Text style={styles.sliderValue}>{value} {unit}</Text>
      <Slider
        style={styles.slider}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        value={value}
        onValueChange={onValueChange}
        step={1}
        minimumTrackTintColor="#FF6B6B"
        maximumTrackTintColor="#ddd"
        thumbStyle={styles.sliderThumb}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Account Settings */}
        {renderSectionHeader('Account')}
        {renderSettingItem(
          'Email Address',
          'john.doe@example.com',
          undefined,
          () => navigation.navigate('ChangeEmail' as never),
          true
        )}
        {renderSettingItem(
          'Phone Number',
          'Add phone number',
          undefined,
          () => navigation.navigate('AddPhone' as never),
          true
        )}
        {renderSettingItem(
          'Change Password',
          undefined,
          undefined,
          () => navigation.navigate('ChangePassword' as never),
          true
        )}
        {renderSettingItem(
          'Two-Factor Authentication',
          'Not enabled',
          undefined,
          () => navigation.navigate('TwoFactor' as never),
          true
        )}
        {renderSettingItem(
          'Linked Accounts',
          'Google, Facebook',
          undefined,
          () => navigation.navigate('LinkedAccounts' as never),
          true
        )}

        {/* Discovery Settings */}
        {renderSectionHeader('Discovery')}
        <View style={styles.settingItem}>
          {renderSlider(
            'Maximum Distance',
            maxDistance,
            setMaxDistance,
            1,
            100,
            'miles'
          )}
        </View>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingTitle}>Age Range</Text>
          <Text style={styles.sliderValue}>{ageRange[0]} - {ageRange[1]} years</Text>
          {/* TODO: Implement dual range slider */}
        </View>

        {renderSettingItem(
          'Show Me',
          showMe === 'everyone' ? 'Everyone' : showMe === 'men' ? 'Men' : 'Women',
          undefined,
          () => {
            // TODO: Implement show me selector
            Alert.alert('Show Me', 'Preference selector coming soon');
          },
          true
        )}

        {renderSettingItem(
          'Global Mode',
          'See people around the world (Premium)',
          <Switch
            value={globalMode}
            onValueChange={setGlobalMode}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={globalMode ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Recently Active',
          'Only show recently active users',
          <Switch
            value={recentlyActive}
            onValueChange={setRecentlyActive}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={recentlyActive ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Verified Profiles Only',
          'Only show verified users',
          <Switch
            value={verifiedOnly}
            onValueChange={setVerifiedOnly}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={verifiedOnly ? '#fff' : '#f4f3f4'}
          />
        )}

        {/* Privacy Settings */}
        {renderSectionHeader('Privacy')}
        {renderSettingItem(
          'Profile Visibility',
          'Make my profile visible',
          <Switch
            value={profileVisible}
            onValueChange={setProfileVisible}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={profileVisible ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Read Receipts',
          'Show when you read messages',
          <Switch
            value={readReceipts}
            onValueChange={setReadReceipts}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={readReceipts ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Online Status',
          'Show when you\'re online',
          <Switch
            value={onlineStatus}
            onValueChange={setOnlineStatus}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={onlineStatus ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Show Distance',
          'Show distance on your profile',
          <Switch
            value={showDistance}
            onValueChange={setShowDistance}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={showDistance ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Block List',
          'Manage blocked users',
          undefined,
          () => navigation.navigate('BlockList' as never),
          true
        )}

        {renderSettingItem(
          'Profile in Search Engines',
          'Allow search engines to find your profile',
          <Switch
            value={profileInSearch}
            onValueChange={setProfileInSearch}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={profileInSearch ? '#fff' : '#f4f3f4'}
          />
        )}

        {/* Notification Settings */}
        {renderSectionHeader('Notifications')}
        {renderSettingItem(
          'Push Notifications',
          'Master toggle for all notifications',
          <Switch
            value={pushNotifications}
            onValueChange={setPushNotifications}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
          />
        )}

        {pushNotifications && (
          <>
            {renderSettingItem(
              'New Matches',
              undefined,
              <Switch
                value={notifications.newMatches}
                onValueChange={() => toggleNotification('newMatches')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.newMatches ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              'Messages',
              undefined,
              <Switch
                value={notifications.messages}
                onValueChange={() => toggleNotification('messages')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.messages ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              'Likes',
              undefined,
              <Switch
                value={notifications.likes}
                onValueChange={() => toggleNotification('likes')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.likes ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              'Profile Views',
              undefined,
              <Switch
                value={notifications.profileViews}
                onValueChange={() => toggleNotification('profileViews')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.profileViews ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              'Promotions',
              undefined,
              <Switch
                value={notifications.promotions}
                onValueChange={() => toggleNotification('promotions')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.promotions ? '#fff' : '#f4f3f4'}
              />
            )}

            {renderSettingItem(
              'Dating Tips',
              undefined,
              <Switch
                value={notifications.datingTips}
                onValueChange={() => toggleNotification('datingTips')}
                trackColor={{ false: '#ddd', true: '#FF6B6B' }}
                thumbColor={notifications.datingTips ? '#fff' : '#f4f3f4'}
              />
            )}
          </>
        )}

        {renderSettingItem(
          'Email Notifications',
          'Receive notifications via email',
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: '#ddd', true: '#FF6B6B' }}
            thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
          />
        )}

        {renderSettingItem(
          'Quiet Hours',
          'Set notification quiet hours',
          undefined,
          () => navigation.navigate('QuietHours' as never),
          true
        )}

        {/* App Settings */}
        {renderSectionHeader('App')}
        {renderSettingItem(
          'Language',
          'English',
          undefined,
          () => navigation.navigate('Language' as never),
          true
        )}

        {renderSettingItem(
          'Help & Support',
          undefined,
          undefined,
          () => navigation.navigate('Support' as never),
          true
        )}

        {renderSettingItem(
          'Privacy Policy',
          undefined,
          undefined,
          () => navigation.navigate('PrivacyPolicy' as never),
          true
        )}

        {renderSettingItem(
          'Terms of Service',
          undefined,
          undefined,
          () => navigation.navigate('TermsOfService' as never),
          true
        )}

        {renderSettingItem(
          'About',
          'Version 1.0.0',
          undefined,
          () => navigation.navigate('About' as never),
          true
        )}

        {/* Danger Zone */}
        {renderSectionHeader('Account')}
        <TouchableOpacity style={styles.dangerButton} onPress={handleSignOut}>
          <Text style={styles.dangerButtonText}>Sign Out</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
          <Text style={styles.dangerButtonText}>Delete Account</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 16,
  },
  headerSpacer: {
    flex: 1,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f8f8',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
  },
  sliderValue: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#FF6B6B',
    width: 20,
    height: 20,
  },
  dangerButton: {
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default SettingsScreen;