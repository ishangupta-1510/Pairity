import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  Platform,
  Vibration,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import CustomSlider from '@/components/CustomSlider';
import CustomSwitch from '@/components/CustomSwitch';
import SectionHeader from '@/components/SectionHeader';
import SettingItem from '@/components/SettingItem';
import { logout } from '@/store/slices/authSlice';

const { width: screenWidth } = Dimensions.get('window');

interface SettingsState {
  // Account
  email: string;
  phone: string;
  twoFactorEnabled: boolean;
  linkedAccounts: string[];
  accountType: 'free' | 'premium';
  
  // Discovery
  maxDistance: number;
  ageRange: [number, number];
  showMe: 'men' | 'women' | 'everyone';
  globalMode: boolean;
  showMeTo: string;
  recentlyActive: boolean;
  verifiedOnly: boolean;
  
  // Privacy
  profileVisible: boolean;
  readReceipts: boolean;
  onlineStatus: boolean;
  showDistance: boolean;
  messagePermission: 'everyone' | 'matches';
  profileInSearch: boolean;
  
  // Notifications
  pushNotifications: boolean;
  notifications: {
    newMatches: boolean;
    messages: boolean;
    likes: boolean;
    profileViews: boolean;
    promotions: boolean;
    datingTips: boolean;
  };
  emailNotifications: boolean;
  smsNotifications: boolean;
  quietHours: { enabled: boolean; start: string; end: string };
  
  // App Settings
  language: string;
  theme: 'light' | 'dark' | 'system';
  autoPlayVideos: boolean;
  dataSaver: boolean;
  soundEffects: boolean;
  hapticFeedback: boolean;
}

const EnhancedSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const searchInputRef = useRef<TextInput>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentChanges, setRecentChanges] = useState<string[]>([]);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [settings, setSettings] = useState<SettingsState>({
    // Account
    email: user?.email || 'user@example.com',
    phone: user?.phone || '',
    twoFactorEnabled: false,
    linkedAccounts: ['Google'],
    accountType: 'free',
    
    // Discovery
    maxDistance: 25,
    ageRange: [22, 35],
    showMe: 'everyone',
    globalMode: false,
    showMeTo: 'everyone',
    recentlyActive: true,
    verifiedOnly: false,
    
    // Privacy
    profileVisible: true,
    readReceipts: true,
    onlineStatus: true,
    showDistance: true,
    messagePermission: 'everyone',
    profileInSearch: false,
    
    // Notifications
    pushNotifications: true,
    notifications: {
      newMatches: true,
      messages: true,
      likes: true,
      profileViews: false,
      promotions: false,
      datingTips: true,
    },
    emailNotifications: true,
    smsNotifications: false,
    quietHours: { enabled: false, start: '22:00', end: '08:00' },
    
    // App Settings
    language: 'English',
    theme: 'system',
    autoPlayVideos: true,
    dataSaver: false,
    soundEffects: true,
    hapticFeedback: true,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const savedSettings = await AsyncStorage.getItem('userSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: SettingsState) => {
    try {
      await AsyncStorage.setItem('userSettings', JSON.stringify(newSettings));
      // API call would go here
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    }
  };

  const updateSetting = async <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
    showToast: boolean = true
  ) => {
    const oldValue = settings[key];
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Haptic feedback
    if (settings.hapticFeedback && Platform.OS === 'ios') {
      Vibration.vibrate(10);
    }
    
    // Save to storage and API
    const success = await saveSettings(newSettings);
    
    if (success && showToast) {
      // Add to recent changes for undo
      const changeDescription = `Changed ${key}`;
      setRecentChanges(prev => [...prev, changeDescription]);
      
      // Show toast with undo option
      Toast.show({
        type: 'success',
        text1: 'Setting Updated',
        text2: 'Tap to undo',
        visibilityTime: 5000,
        onPress: () => {
          // Undo the change
          updateSetting(key, oldValue as SettingsState[K], false);
          Toast.hide();
        },
      });
      
      // Clear undo option after 5 seconds
      if (undoTimeout) clearTimeout(undoTimeout);
      const timeout = setTimeout(() => {
        setRecentChanges(prev => prev.filter(c => c !== changeDescription));
      }, 5000);
      setUndoTimeout(timeout);
    } else if (!success) {
      // Revert on failure
      setSettings({ ...settings, [key]: oldValue });
      Toast.show({
        type: 'error',
        text1: 'Failed to update setting',
        text2: 'Please try again',
      });
    }
  };

  const toggleNotification = (key: keyof typeof settings.notifications) => {
    const newNotifications = {
      ...settings.notifications,
      [key]: !settings.notifications[key],
    };
    updateSetting('notifications', newNotifications);
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
            dispatch(logout());
            navigation.navigate('Auth' as never);
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
            // Show confirmation modal
            navigation.navigate('DeleteAccountConfirm' as never);
          }
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await AsyncStorage.multiRemove([
                'cache_images',
                'cache_data',
                'temp_files',
              ]);
              Toast.show({
                type: 'success',
                text1: 'Cache Cleared',
                text2: 'All cached data has been removed',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Failed to clear cache',
              });
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      // API call to request data export
      Toast.show({
        type: 'success',
        text1: 'Data Export Requested',
        text2: 'You will receive an email when your data is ready',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to request data export',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter settings based on search query
  const filterSettings = (section: string) => {
    if (!searchQuery) return true;
    return section.toLowerCase().includes(searchQuery.toLowerCase());
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Search */}
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchContainer}>
            <Icon name="search" size={24} color="#666" />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search settings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearchQuery('');
              }}
            >
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Icon name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Settings</Text>
            <TouchableOpacity onPress={() => setShowSearch(true)}>
              <Icon name="search" size={24} color="#333" />
            </TouchableOpacity>
          </>
        )}
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Account Settings */}
        {filterSettings('account') && (
          <>
            <SectionHeader title="Account" icon="person" />
            
            <SettingItem
              icon="email"
              title="Email Address"
              subtitle={settings.email}
              showArrow
              verified={user?.emailVerified}
              onPress={() => navigation.navigate('ChangeEmail' as never)}
            />
            
            <SettingItem
              icon="phone"
              title="Phone Number"
              subtitle={settings.phone || 'Add phone number'}
              showArrow
              verified={!!settings.phone}
              onPress={() => navigation.navigate('AddPhone' as never)}
            />
            
            <SettingItem
              icon="lock"
              title="Change Password"
              showArrow
              onPress={() => navigation.navigate('ChangePassword' as never)}
            />
            
            <SettingItem
              icon="security"
              title="Two-Factor Authentication"
              subtitle={settings.twoFactorEnabled ? 'Enabled' : 'Not enabled'}
              showArrow
              badge={!settings.twoFactorEnabled ? 'Recommended' : undefined}
              onPress={() => navigation.navigate('TwoFactor' as never)}
            />
            
            <SettingItem
              icon="link"
              title="Linked Accounts"
              subtitle={settings.linkedAccounts.join(', ')}
              showArrow
              onPress={() => navigation.navigate('LinkedAccounts' as never)}
            />
            
            <SettingItem
              icon="star"
              title="Account Type"
              subtitle={settings.accountType === 'premium' ? 'Premium' : 'Free'}
              badge={settings.accountType === 'premium' ? 'Premium' : undefined}
              badgeColor="#FFD43B"
              showArrow={settings.accountType === 'free'}
              onPress={
                settings.accountType === 'free'
                  ? () => navigation.navigate('Upgrade' as never)
                  : undefined
              }
            />
          </>
        )}

        {/* Discovery Settings */}
        {filterSettings('discovery') && (
          <>
            <SectionHeader title="Discovery" icon="explore" />
            
            <View style={styles.settingItem}>
              <CustomSlider
                label="Maximum Distance"
                value={settings.maxDistance}
                onValueChange={(value) => updateSetting('maxDistance', value)}
                minimumValue={1}
                maximumValue={100}
                unit="miles"
                icon="location-on"
              />
            </View>
            
            <View style={styles.settingItem}>
              <CustomSlider
                label="Age Range"
                value={settings.ageRange}
                onValueChange={(value) => updateSetting('ageRange', value as [number, number])}
                minimumValue={18}
                maximumValue={99}
                isDualSlider
                icon="cake"
              />
            </View>
            
            <SettingItem
              icon="people"
              title="Show Me"
              subtitle={
                settings.showMe === 'everyone'
                  ? 'Everyone'
                  : settings.showMe === 'men'
                  ? 'Men'
                  : 'Women'
              }
              showArrow
              onPress={() => navigation.navigate('ShowMePreference' as never)}
            />
            
            <SettingItem
              icon="public"
              title="Global Mode"
              subtitle="See people around the world"
              badge={settings.accountType === 'free' ? 'Premium' : undefined}
              rightComponent={
                <CustomSwitch
                  value={settings.globalMode}
                  onValueChange={(value) => updateSetting('globalMode', value)}
                  disabled={settings.accountType === 'free'}
                />
              }
            />
            
            <SettingItem
              icon="schedule"
              title="Recently Active"
              subtitle="Only show recently active users"
              rightComponent={
                <CustomSwitch
                  value={settings.recentlyActive}
                  onValueChange={(value) => updateSetting('recentlyActive', value)}
                />
              }
            />
            
            <SettingItem
              icon="verified"
              title="Verified Profiles Only"
              subtitle="Only show verified users"
              rightComponent={
                <CustomSwitch
                  value={settings.verifiedOnly}
                  onValueChange={(value) => updateSetting('verifiedOnly', value)}
                />
              }
            />
          </>
        )}

        {/* Privacy Settings */}
        {filterSettings('privacy') && (
          <>
            <SectionHeader title="Privacy" icon="privacy-tip" />
            
            <SettingItem
              icon="visibility"
              title="Profile Visibility"
              subtitle="Make my profile visible"
              rightComponent={
                <CustomSwitch
                  value={settings.profileVisible}
                  onValueChange={(value) => updateSetting('profileVisible', value)}
                />
              }
            />
            
            <SettingItem
              icon="done-all"
              title="Read Receipts"
              subtitle="Show when you read messages"
              rightComponent={
                <CustomSwitch
                  value={settings.readReceipts}
                  onValueChange={(value) => updateSetting('readReceipts', value)}
                />
              }
            />
            
            <SettingItem
              icon="circle"
              title="Online Status"
              subtitle="Show when you're online"
              rightComponent={
                <CustomSwitch
                  value={settings.onlineStatus}
                  onValueChange={(value) => updateSetting('onlineStatus', value)}
                />
              }
            />
            
            <SettingItem
              icon="location-on"
              title="Show Distance"
              subtitle="Show distance on your profile"
              rightComponent={
                <CustomSwitch
                  value={settings.showDistance}
                  onValueChange={(value) => updateSetting('showDistance', value)}
                />
              }
            />
            
            <SettingItem
              icon="block"
              title="Block List"
              subtitle="Manage blocked users"
              showArrow
              onPress={() => navigation.navigate('BlockList' as never)}
            />
            
            <SettingItem
              icon="message"
              title="Who Can Message Me"
              subtitle={settings.messagePermission === 'everyone' ? 'Everyone' : 'Matches Only'}
              showArrow
              onPress={() => navigation.navigate('MessagePermissions' as never)}
            />
            
            <SettingItem
              icon="search"
              title="Profile in Search Engines"
              subtitle="Allow search engines to find your profile"
              rightComponent={
                <CustomSwitch
                  value={settings.profileInSearch}
                  onValueChange={(value) => updateSetting('profileInSearch', value)}
                />
              }
            />
            
            <SettingItem
              icon="cloud-download"
              title="Download My Data"
              subtitle="Request a copy of your data"
              showArrow
              onPress={handleExportData}
            />
          </>
        )}

        {/* Notification Settings */}
        {filterSettings('notifications') && (
          <>
            <SectionHeader title="Notifications" icon="notifications" />
            
            <SettingItem
              icon="notifications-active"
              title="Push Notifications"
              subtitle="Master toggle for all notifications"
              rightComponent={
                <CustomSwitch
                  value={settings.pushNotifications}
                  onValueChange={(value) => updateSetting('pushNotifications', value)}
                />
              }
            />
            
            {settings.pushNotifications && (
              <>
                <SettingItem
                  icon="favorite"
                  title="New Matches"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.newMatches}
                      onValueChange={() => toggleNotification('newMatches')}
                    />
                  }
                />
                
                <SettingItem
                  icon="chat"
                  title="Messages"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.messages}
                      onValueChange={() => toggleNotification('messages')}
                    />
                  }
                />
                
                <SettingItem
                  icon="thumb-up"
                  title="Likes"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.likes}
                      onValueChange={() => toggleNotification('likes')}
                    />
                  }
                />
                
                <SettingItem
                  icon="visibility"
                  title="Profile Views"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.profileViews}
                      onValueChange={() => toggleNotification('profileViews')}
                    />
                  }
                />
                
                <SettingItem
                  icon="local-offer"
                  title="Promotions"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.promotions}
                      onValueChange={() => toggleNotification('promotions')}
                    />
                  }
                />
                
                <SettingItem
                  icon="lightbulb"
                  title="Dating Tips"
                  rightComponent={
                    <CustomSwitch
                      value={settings.notifications.datingTips}
                      onValueChange={() => toggleNotification('datingTips')}
                    />
                  }
                />
              </>
            )}
            
            <SettingItem
              icon="email"
              title="Email Notifications"
              subtitle="Receive notifications via email"
              rightComponent={
                <CustomSwitch
                  value={settings.emailNotifications}
                  onValueChange={(value) => updateSetting('emailNotifications', value)}
                />
              }
            />
            
            {settings.phone && (
              <SettingItem
                icon="sms"
                title="SMS Notifications"
                subtitle="Receive SMS for important updates"
                rightComponent={
                  <CustomSwitch
                    value={settings.smsNotifications}
                    onValueChange={(value) => updateSetting('smsNotifications', value)}
                  />
                }
              />
            )}
            
            <SettingItem
              icon="bedtime"
              title="Quiet Hours"
              subtitle={
                settings.quietHours.enabled
                  ? `${settings.quietHours.start} - ${settings.quietHours.end}`
                  : 'Not set'
              }
              showArrow
              onPress={() => navigation.navigate('QuietHours' as never)}
            />
          </>
        )}

        {/* App Settings */}
        {filterSettings('app') && (
          <>
            <SectionHeader title="App Settings" icon="settings" />
            
            <SettingItem
              icon="language"
              title="Language"
              subtitle={settings.language}
              showArrow
              onPress={() => navigation.navigate('Language' as never)}
            />
            
            <SettingItem
              icon="palette"
              title="Theme"
              subtitle={
                settings.theme === 'system'
                  ? 'System'
                  : settings.theme === 'dark'
                  ? 'Dark'
                  : 'Light'
              }
              showArrow
              onPress={() => navigation.navigate('Theme' as never)}
            />
            
            <SettingItem
              icon="play-circle"
              title="Auto-play Videos"
              subtitle="Automatically play videos in feed"
              rightComponent={
                <CustomSwitch
                  value={settings.autoPlayVideos}
                  onValueChange={(value) => updateSetting('autoPlayVideos', value)}
                />
              }
            />
            
            <SettingItem
              icon="data-usage"
              title="Data Saver Mode"
              subtitle="Reduce data usage"
              rightComponent={
                <CustomSwitch
                  value={settings.dataSaver}
                  onValueChange={(value) => updateSetting('dataSaver', value)}
                />
              }
            />
            
            <SettingItem
              icon="volume-up"
              title="Sound Effects"
              rightComponent={
                <CustomSwitch
                  value={settings.soundEffects}
                  onValueChange={(value) => updateSetting('soundEffects', value)}
                />
              }
            />
            
            <SettingItem
              icon="vibration"
              title="Haptic Feedback"
              subtitle="Vibration feedback"
              rightComponent={
                <CustomSwitch
                  value={settings.hapticFeedback}
                  onValueChange={(value) => {
                    updateSetting('hapticFeedback', value);
                    if (value && Platform.OS === 'ios') {
                      Vibration.vibrate(10);
                    }
                  }}
                />
              }
            />
            
            <SettingItem
              icon="cleaning-services"
              title="Clear Cache"
              subtitle="Free up storage space"
              showArrow
              onPress={handleClearCache}
            />
          </>
        )}

        {/* Premium/Subscription */}
        {filterSettings('subscription') && settings.accountType === 'premium' && (
          <>
            <SectionHeader title="Subscription" icon="star" />
            
            <SettingItem
              icon="credit-card"
              title="Current Plan"
              subtitle="Premium Monthly"
              badge="Active"
              badgeColor="#51CF66"
              showArrow
              onPress={() => navigation.navigate('Subscription' as never)}
            />
            
            <SettingItem
              icon="payment"
              title="Payment Method"
              subtitle="•••• 4242"
              showArrow
              onPress={() => navigation.navigate('PaymentMethods' as never)}
            />
            
            <SettingItem
              icon="receipt"
              title="Billing History"
              showArrow
              onPress={() => navigation.navigate('BillingHistory' as never)}
            />
            
            <SettingItem
              icon="refresh"
              title="Restore Purchases"
              showArrow
              onPress={() => {
                setLoading(true);
                setTimeout(() => {
                  setLoading(false);
                  Toast.show({
                    type: 'success',
                    text1: 'Purchases Restored',
                  });
                }, 2000);
              }}
            />
          </>
        )}

        {/* Safety & Support */}
        {filterSettings('support') && (
          <>
            <SectionHeader title="Safety & Support" icon="shield" />
            
            <SettingItem
              icon="security"
              title="Safety Center"
              showArrow
              onPress={() => navigation.navigate('SafetyCenter' as never)}
            />
            
            <SettingItem
              icon="report-problem"
              title="Report a Problem"
              showArrow
              onPress={() => navigation.navigate('ReportProblem' as never)}
            />
            
            <SettingItem
              icon="help"
              title="Help Center"
              showArrow
              onPress={() => navigation.navigate('HelpCenter' as never)}
            />
            
            <SettingItem
              icon="gavel"
              title="Community Guidelines"
              showArrow
              onPress={() => navigation.navigate('Guidelines' as never)}
            />
            
            <SettingItem
              icon="description"
              title="Terms of Service"
              showArrow
              onPress={() => navigation.navigate('Terms' as never)}
            />
            
            <SettingItem
              icon="privacy-tip"
              title="Privacy Policy"
              showArrow
              onPress={() => navigation.navigate('Privacy' as never)}
            />
            
            <SettingItem
              icon="support-agent"
              title="Contact Support"
              showArrow
              onPress={() => navigation.navigate('ContactSupport' as never)}
            />
          </>
        )}

        {/* Advanced Settings */}
        {filterSettings('advanced') && (
          <>
            <SectionHeader title="Advanced" icon="settings-applications" />
            
            <SettingItem
              icon="backup"
              title="Backup Settings"
              subtitle="Save settings to cloud"
              showArrow
              onPress={() => {
                Toast.show({
                  type: 'success',
                  text1: 'Settings Backed Up',
                });
              }}
            />
            
            <SettingItem
              icon="restore"
              title="Restore Settings"
              subtitle="Restore from backup"
              showArrow
              onPress={() => navigation.navigate('RestoreSettings' as never)}
            />
            
            <SettingItem
              icon="history"
              title="Change History"
              subtitle="View recent setting changes"
              badge={recentChanges.length > 0 ? String(recentChanges.length) : undefined}
              showArrow
              onPress={() => navigation.navigate('ChangeHistory' as never)}
            />
            
            {__DEV__ && (
              <SettingItem
                icon="code"
                title="Developer Options"
                showArrow
                onPress={() => navigation.navigate('DeveloperOptions' as never)}
              />
            )}
          </>
        )}

        {/* About */}
        {filterSettings('about') && (
          <>
            <SectionHeader title="About" icon="info" />
            
            <SettingItem
              icon="info"
              title="Version"
              subtitle="1.0.0 (Build 100)"
            />
            
            <SettingItem
              icon="update"
              title="Check for Updates"
              showArrow
              onPress={() => {
                Toast.show({
                  type: 'info',
                  text1: 'You\'re up to date!',
                });
              }}
            />
            
            <SettingItem
              icon="share"
              title="Share Pairity"
              showArrow
              onPress={() => navigation.navigate('ShareApp' as never)}
            />
            
            <SettingItem
              icon="rate-review"
              title="Rate Us"
              showArrow
              onPress={() => navigation.navigate('RateApp' as never)}
            />
          </>
        )}

        {/* Account Actions */}
        {filterSettings('account') && (
          <>
            <SectionHeader title="Account Actions" icon="manage-accounts" />
            
            <TouchableOpacity style={styles.actionButton} onPress={handleSignOut}>
              <Icon name="logout" size={20} color="#FF6B6B" />
              <Text style={styles.actionButtonText}>Sign Out</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleDeleteAccount}
            >
              <Icon name="delete-forever" size={20} color="#FF6B6B" />
              <Text style={styles.dangerButtonText}>Delete Account</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    paddingVertical: 8,
  },
  scrollView: {
    flex: 1,
  },
  settingItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginVertical: 8,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  dangerButton: {
    backgroundColor: '#FFF5F5',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default EnhancedSettingsScreen;