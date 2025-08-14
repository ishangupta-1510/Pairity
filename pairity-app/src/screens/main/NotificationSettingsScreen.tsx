import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

import {
  updatePushPreferences,
  updateInAppPreferences,
  updateEmailPreferences,
  updateSmsPreferences,
  updateQuietHours,
} from '@/store/slices/notificationSlice';

import SectionHeader from '@/components/settings/SectionHeader';
import SettingItem from '@/components/settings/SettingItem';
import CustomSwitch from '@/components/settings/CustomSwitch';

const NotificationSettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { preferences } = useSelector((state: RootState) => state.notifications);
  const [expandedSections, setExpandedSections] = useState<string[]>(['push']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handlePushToggle = (key: keyof typeof preferences.pushNotifications, value: boolean) => {
    if (key === 'enabled' && !value) {
      Alert.alert(
        'Disable Push Notifications',
        'You won\'t receive any push notifications. You can re-enable them anytime.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            onPress: () => dispatch(updatePushPreferences({ [key]: value })),
          },
        ]
      );
    } else {
      dispatch(updatePushPreferences({ [key]: value }));
    }
  };

  const handleInAppToggle = (key: keyof typeof preferences.inAppNotifications, value: boolean) => {
    dispatch(updateInAppPreferences({ [key]: value }));
  };

  const handleEmailToggle = (key: keyof typeof preferences.emailNotifications, value: boolean) => {
    dispatch(updateEmailPreferences({ [key]: value }));
  };

  const handleSmsToggle = (key: keyof typeof preferences.smsNotifications, value: boolean) => {
    dispatch(updateSmsPreferences({ [key]: value }));
  };

  const handleQuietHoursToggle = (enabled: boolean) => {
    dispatch(updateQuietHours({ enabled }));
  };

  const navigateToQuietHours = () => {
    navigation.navigate('QuietHoursSettings' as never);
  };

  const navigateToAdvancedSettings = () => {
    navigation.navigate('AdvancedNotificationSettings' as never);
  };

  const testNotifications = () => {
    Alert.alert(
      'Test Notification',
      'This would send a test notification to verify your settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Test',
          onPress: () => {
            // TODO: Implement test notification
            Alert.alert('Success', 'Test notification sent!');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Notification Settings
        </Text>
        <TouchableOpacity onPress={testNotifications} style={styles.testButton}>
          <Icon name="send" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Push Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => toggleSection('push')}
          >
            <SectionHeader
              title="Push Notifications"
              subtitle="Notifications sent to your device"
              icon="notifications"
              expandable
              expanded={expandedSections.includes('push')}
            />
            <CustomSwitch
              value={preferences.pushNotifications.enabled}
              onValueChange={(value) => handlePushToggle('enabled', value)}
            />
          </TouchableOpacity>

          {expandedSections.includes('push') && preferences.pushNotifications.enabled && (
            <View style={styles.subsection}>
              <SettingItem
                title="New Matches"
                subtitle="When someone matches with you"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.matches}
                    onValueChange={(value) => handlePushToggle('matches', value)}
                  />
                }
              />
              <SettingItem
                title="New Likes"
                subtitle="When someone likes your profile"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.likes}
                    onValueChange={(value) => handlePushToggle('likes', value)}
                  />
                }
              />
              <SettingItem
                title="Messages"
                subtitle="New messages from matches"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.messages}
                    onValueChange={(value) => handlePushToggle('messages', value)}
                  />
                }
              />
              <SettingItem
                title="Profile Views"
                subtitle="When someone views your profile"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.profileViews}
                    onValueChange={(value) => handlePushToggle('profileViews', value)}
                  />
                }
              />
              <SettingItem
                title="System Updates"
                subtitle="App updates and announcements"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.system}
                    onValueChange={(value) => handlePushToggle('system', value)}
                  />
                }
              />
              <SettingItem
                title="Premium Features"
                subtitle="Premium offers and features"
                rightElement={
                  <CustomSwitch
                    value={preferences.pushNotifications.premium}
                    onValueChange={(value) => handlePushToggle('premium', value)}
                  />
                }
              />
            </View>
          )}
        </View>

        {/* In-App Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => toggleSection('inapp')}
          >
            <SectionHeader
              title="In-App Notifications"
              subtitle="Banners and alerts within the app"
              icon="phone-android"
              expandable
              expanded={expandedSections.includes('inapp')}
            />
            <CustomSwitch
              value={preferences.inAppNotifications.enabled}
              onValueChange={(value) => handleInAppToggle('enabled', value)}
            />
          </TouchableOpacity>

          {expandedSections.includes('inapp') && preferences.inAppNotifications.enabled && (
            <View style={styles.subsection}>
              <SettingItem
                title="Banner Notifications"
                subtitle="Show sliding banners for important events"
                rightElement={
                  <CustomSwitch
                    value={preferences.inAppNotifications.banners}
                    onValueChange={(value) => handleInAppToggle('banners', value)}
                  />
                }
              />
              <SettingItem
                title="Toast Messages"
                subtitle="Show toast messages for actions"
                rightElement={
                  <CustomSwitch
                    value={preferences.inAppNotifications.toasts}
                    onValueChange={(value) => handleInAppToggle('toasts', value)}
                  />
                }
              />
              <SettingItem
                title="Sound Effects"
                subtitle="Play sounds for notifications"
                rightElement={
                  <CustomSwitch
                    value={preferences.inAppNotifications.sounds}
                    onValueChange={(value) => handleInAppToggle('sounds', value)}
                  />
                }
              />
              <SettingItem
                title="Vibration"
                subtitle="Vibrate for notifications"
                rightElement={
                  <CustomSwitch
                    value={preferences.inAppNotifications.vibration}
                    onValueChange={(value) => handleInAppToggle('vibration', value)}
                  />
                }
              />
            </View>
          )}
        </View>

        {/* Email Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => toggleSection('email')}
          >
            <SectionHeader
              title="Email Notifications"
              subtitle="Receive notifications via email"
              icon="email"
              expandable
              expanded={expandedSections.includes('email')}
            />
            <CustomSwitch
              value={preferences.emailNotifications.enabled}
              onValueChange={(value) => handleEmailToggle('enabled', value)}
            />
          </TouchableOpacity>

          {expandedSections.includes('email') && preferences.emailNotifications.enabled && (
            <View style={styles.subsection}>
              <SettingItem
                title="New Matches"
                subtitle="Email me about new matches"
                rightElement={
                  <CustomSwitch
                    value={preferences.emailNotifications.matches}
                    onValueChange={(value) => handleEmailToggle('matches', value)}
                  />
                }
              />
              <SettingItem
                title="Weekly Digest"
                subtitle="Weekly summary of activity"
                rightElement={
                  <CustomSwitch
                    value={preferences.emailNotifications.weeklyDigest}
                    onValueChange={(value) => handleEmailToggle('weeklyDigest', value)}
                  />
                }
              />
              <SettingItem
                title="Promotions"
                subtitle="Special offers and promotions"
                rightElement={
                  <CustomSwitch
                    value={preferences.emailNotifications.promotions}
                    onValueChange={(value) => handleEmailToggle('promotions', value)}
                  />
                }
              />
            </View>
          )}
        </View>

        {/* SMS Notifications */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.sectionHeaderTouchable}
            onPress={() => toggleSection('sms')}
          >
            <SectionHeader
              title="SMS Notifications"
              subtitle="Text messages to your phone"
              icon="sms"
              expandable
              expanded={expandedSections.includes('sms')}
            />
            <CustomSwitch
              value={preferences.smsNotifications.enabled}
              onValueChange={(value) => handleSmsToggle('enabled', value)}
            />
          </TouchableOpacity>

          {expandedSections.includes('sms') && preferences.smsNotifications.enabled && (
            <View style={styles.subsection}>
              <Text style={[styles.disclaimer, { color: theme.colors.textSecondary }]}>
                SMS notifications require phone verification
              </Text>
              <SettingItem
                title="New Matches"
                subtitle="SMS for important matches"
                rightElement={
                  <CustomSwitch
                    value={preferences.smsNotifications.matches}
                    onValueChange={(value) => handleSmsToggle('matches', value)}
                  />
                }
              />
              <SettingItem
                title="Security Alerts"
                subtitle="SMS for security-related events"
                rightElement={
                  <CustomSwitch
                    value={preferences.smsNotifications.securityAlerts}
                    onValueChange={(value) => handleSmsToggle('securityAlerts', value)}
                  />
                }
              />
            </View>
          )}
        </View>

        {/* Advanced Settings */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader
            title="Advanced Settings"
            subtitle="Fine-tune your notification experience"
            icon="tune"
          />
          
          <SettingItem
            title="Quiet Hours"
            subtitle={
              preferences.quietHours.enabled
                ? `${preferences.quietHours.startTime} - ${preferences.quietHours.endTime}`
                : 'Set times to pause notifications'
            }
            onPress={navigateToQuietHours}
            rightElement={
              <View style={styles.quietHoursToggle}>
                <CustomSwitch
                  value={preferences.quietHours.enabled}
                  onValueChange={handleQuietHoursToggle}
                />
                <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
              </View>
            }
          />
          
          <SettingItem
            title="Notification Frequency"
            subtitle="Manage batching and timing"
            onPress={navigateToAdvancedSettings}
            rightElement={
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            }
          />
          
          <SettingItem
            title="Do Not Disturb"
            subtitle="Weekend and weekday preferences"
            onPress={navigateToAdvancedSettings}
            rightElement={
              <Icon name="chevron-right" size={20} color={theme.colors.textSecondary} />
            }
          />
        </View>

        {/* Help Section */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <SectionHeader
            title="Help & Support"
            subtitle="Troubleshooting and information"
            icon="help"
          />
          
          <SettingItem
            title="Test Notifications"
            subtitle="Send a test notification"
            onPress={testNotifications}
            rightElement={
              <Icon name="send" size={20} color={theme.colors.primary} />
            }
          />
          
          <SettingItem
            title="Notification Permissions"
            subtitle="Check system notification settings"
            onPress={() => {
              Alert.alert(
                'Notification Permissions',
                'To manage system notification permissions, go to your device Settings > Apps > Pairity > Notifications',
                [{ text: 'OK' }]
              );
            }}
            rightElement={
              <Icon name="settings" size={20} color={theme.colors.textSecondary} />
            }
          />
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  testButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionHeaderTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  subsection: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  disclaimer: {
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  quietHoursToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomSpacer: {
    height: 32,
  },
});

export default NotificationSettingsScreen;