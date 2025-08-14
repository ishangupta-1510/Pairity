import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { useAccessibility } from '@/hooks/useAccessibility';
import AccessibleButton from '@/components/accessibility/AccessibleButton';
import { ColorBlindMode } from '@/types/accessibility';
import { moderateScale } from '@/utils/responsive';

const AccessibilitySettingsScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const {
    settings,
    screenReader,
    updateSetting,
    getAccessibleFontSize,
    announceSuccess,
    announceNavigation,
  } = useAccessibility();

  React.useEffect(() => {
    announceNavigation('Accessibility Settings', 'Configure accessibility options');
  }, []);

  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    updateSetting(key, value);
    announceSuccess(`${key.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
  };

  const handleFontScaleChange = (delta: number) => {
    const newScale = Math.max(0.8, Math.min(2.0, settings.fontScale + delta));
    updateSetting('fontScale', newScale);
    announceSuccess(`Font size ${delta > 0 ? 'increased' : 'decreased'}`);
  };

  const handleColorBlindMode = (mode: ColorBlindMode) => {
    updateSetting('colorBlindMode', mode);
    announceSuccess(`Color blind mode set to ${mode}`);
  };

  const openSystemSettings = () => {
    Alert.alert(
      'System Settings',
      'Would you like to open system accessibility settings?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('App-Prefs:ACCESSIBILITY');
            } else {
              Linking.openSettings();
            }
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string, description?: string) => (
    <View style={styles.sectionHeader}>
      <Text
        style={[styles.sectionTitle, { color: theme.colors.text }]}
        accessibilityRole="header"
        accessible={true}
      >
        {title}
      </Text>
      {description && (
        <Text style={[styles.sectionDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      )}
    </View>
  );

  const renderToggleItem = (
    key: keyof typeof settings,
    title: string,
    description: string,
    icon: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <Icon name={icon} size={moderateScale(24)} color={theme.colors.primary} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          {title}
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={settings[key] as boolean}
        onValueChange={(value) => handleToggle(key, value)}
        trackColor={{
          false: theme.colors.border,
          true: theme.colors.primaryLight,
        }}
        thumbColor={settings[key] ? theme.colors.primary : theme.colors.textSecondary}
        accessible={true}
        accessibilityLabel={`${title} toggle`}
        accessibilityHint={`Currently ${settings[key] ? 'enabled' : 'disabled'}. Double tap to toggle.`}
        accessibilityRole="switch"
        accessibilityState={{ checked: settings[key] as boolean }}
      />
    </View>
  );

  const renderFontScaleControl = () => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <Icon name="text-fields" size={moderateScale(24)} color={theme.colors.primary} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          Font Size
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          Current scale: {Math.round(settings.fontScale * 100)}%
        </Text>
        <View style={styles.fontScaleControls}>
          <AccessibleButton
            title="A-"
            onPress={() => handleFontScaleChange(-0.1)}
            variant="outline"
            size="small"
            accessibilityLabel="Decrease font size"
            accessibilityHint="Makes text smaller"
          />
          <Text
            style={[
              styles.previewText,
              {
                color: theme.colors.text,
                fontSize: getAccessibleFontSize(moderateScale(16)),
              },
            ]}
            accessible={true}
            accessibilityLabel={`Preview text at ${Math.round(settings.fontScale * 100)}% scale`}
          >
            Sample Text
          </Text>
          <AccessibleButton
            title="A+"
            onPress={() => handleFontScaleChange(0.1)}
            variant="outline"
            size="small"
            accessibilityLabel="Increase font size"
            accessibilityHint="Makes text larger"
          />
        </View>
      </View>
    </View>
  );

  const renderColorBlindOptions = () => (
    <View style={[styles.settingItem, { backgroundColor: theme.colors.surface }]}>
      <Icon name="palette" size={moderateScale(24)} color={theme.colors.primary} />
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>
          Color Blind Support
        </Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          Current: {settings.colorBlindMode}
        </Text>
        <View style={styles.colorBlindOptions}>
          {Object.values(ColorBlindMode).map((mode) => (
            <AccessibleButton
              key={mode}
              title={mode.charAt(0).toUpperCase() + mode.slice(1)}
              onPress={() => handleColorBlindMode(mode)}
              variant={settings.colorBlindMode === mode ? 'primary' : 'outline'}
              size="small"
              style={styles.colorBlindButton}
              accessibilityLabel={`${mode} color blind mode`}
              accessibilityState={{ selected: settings.colorBlindMode === mode }}
            />
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <AccessibleButton
          icon="arrow-back"
          onPress={() => navigation.goBack()}
          variant="text"
          accessibilityLabel="Go back"
          accessibilityHint="Returns to previous screen"
        />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Accessibility
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Screen Reader Status */}
        <View style={[styles.statusCard, { backgroundColor: theme.colors.surface }]}>
          <Icon 
            name={screenReader.enabled ? 'accessibility' : 'accessibility-new'} 
            size={moderateScale(32)} 
            color={screenReader.enabled ? theme.colors.success : theme.colors.textSecondary} 
          />
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
              Screen Reader: {screenReader.enabled ? 'Active' : 'Inactive'}
            </Text>
            <Text style={[styles.statusDescription, { color: theme.colors.textSecondary }]}>
              {screenReader.enabled 
                ? `${screenReader.type} is running` 
                : 'No screen reader detected'}
            </Text>
          </View>
          <AccessibleButton
            title="Settings"
            onPress={openSystemSettings}
            variant="outline"
            size="small"
            accessibilityLabel="Open system accessibility settings"
          />
        </View>

        {/* Visual Settings */}
        {renderSectionHeader('Visual', 'Customize visual appearance for better readability')}
        
        {renderToggleItem(
          'highContrast',
          'High Contrast',
          'Increase contrast between text and background',
          'contrast'
        )}

        {renderToggleItem(
          'isBoldTextEnabled',
          'Bold Text',
          'Make text appear bolder and easier to read',
          'format-bold'
        )}

        {renderToggleItem(
          'isGrayscaleEnabled',
          'Grayscale',
          'Display content in grayscale',
          'invert-colors'
        )}

        {renderFontScaleControl()}

        {renderColorBlindOptions()}

        {/* Motion Settings */}
        {renderSectionHeader('Motion', 'Control animations and visual effects')}

        {renderToggleItem(
          'isReduceMotionEnabled',
          'Reduce Motion',
          'Minimize animations and transitions',
          'motion-photos-off'
        )}

        {renderToggleItem(
          'isReduceTransparencyEnabled',
          'Reduce Transparency',
          'Reduce transparent and blurred elements',
          'opacity'
        )}

        {renderToggleItem(
          'prefersCrossFadeTransitions',
          'Cross-Fade Transitions',
          'Use cross-fade instead of slide transitions',
          'swap-horiz'
        )}

        {/* Interaction Settings */}
        {renderSectionHeader('Interaction', 'Customize how you interact with the app')}

        {renderToggleItem(
          'hapticFeedback',
          'Haptic Feedback',
          'Feel vibrations for touch interactions',
          'vibration'
        )}

        {renderToggleItem(
          'announceNotifications',
          'Announce Notifications',
          'Read notification content aloud',
          'record-voice-over'
        )}

        {/* Media Settings */}
        {renderSectionHeader('Media', 'Control media playback and captions')}

        {renderToggleItem(
          'showCaptions',
          'Show Captions',
          'Display captions for video content',
          'closed-caption'
        )}

        {renderToggleItem(
          'autoPlayVideos',
          'Auto-play Videos',
          'Automatically play videos when visible',
          'play-circle'
        )}

        {/* Accessibility Features Info */}
        <View style={[styles.infoCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="info" size={moderateScale(24)} color={theme.colors.primary} />
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: theme.colors.text }]}>
              Additional Features
            </Text>
            <Text style={[styles.infoDescription, { color: theme.colors.textSecondary }]}>
              • Voice control: "Hey Siri" or "Ok Google"
              • Switch control: External switches
              • Magnification: Pinch to zoom
              • Keyboard navigation: Tab through elements
            </Text>
          </View>
        </View>
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
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(12),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: moderateScale(20),
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: moderateScale(16),
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(24),
  },
  statusContent: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  statusTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  statusDescription: {
    fontSize: moderateScale(14),
  },
  sectionHeader: {
    marginBottom: moderateScale(16),
    marginTop: moderateScale(8),
  },
  sectionTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  sectionDescription: {
    fontSize: moderateScale(14),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginBottom: moderateScale(12),
  },
  settingContent: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  settingTitle: {
    fontSize: moderateScale(16),
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  settingDescription: {
    fontSize: moderateScale(14),
    marginBottom: moderateScale(8),
  },
  fontScaleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(8),
  },
  previewText: {
    marginHorizontal: moderateScale(16),
    fontWeight: '500',
  },
  colorBlindOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: moderateScale(8),
    gap: moderateScale(8),
  },
  colorBlindButton: {
    marginRight: moderateScale(8),
    marginBottom: moderateScale(8),
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    marginTop: moderateScale(16),
  },
  infoContent: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  infoTitle: {
    fontSize: moderateScale(16),
    fontWeight: '600',
    marginBottom: moderateScale(8),
  },
  infoDescription: {
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
  },
});

export default AccessibilitySettingsScreen;