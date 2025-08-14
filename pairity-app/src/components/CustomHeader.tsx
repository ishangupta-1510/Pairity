import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useTheme } from './ThemeProvider';

interface CustomHeaderProps {
  title?: string;
  showLogo?: boolean;
  showSearch?: boolean;
  showNotifications?: boolean;
  showProfile?: boolean;
  showPremiumButton?: boolean;
  leftButton?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
  rightButton?: {
    icon?: string;
    text?: string;
    onPress: () => void;
  };
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  notificationCount?: number;
  backgroundColor?: string;
  style?: object;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title,
  showLogo = false,
  showSearch = false,
  showNotifications = false,
  showProfile = false,
  showPremiumButton = false,
  leftButton,
  rightButton,
  onSearchChange,
  searchPlaceholder = 'Search...',
  notificationCount = 0,
  backgroundColor,
  style,
}) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchText, setSearchText] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchPress = () => {
    if (showSearch) {
      setIsSearchExpanded(!isSearchExpanded);
      if (isSearchExpanded) {
        setSearchText('');
        onSearchChange?.('');
      }
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleProfilePress = () => {
    navigation.navigate('ProfileTab' as never);
  };

  const handlePremiumPress = () => {
    navigation.navigate('PremiumUpgrade' as never);
  };

  const headerBackgroundColor = backgroundColor || theme.colors.background;
  const headerHeight = 60;
  const totalHeight = headerHeight + insets.top;

  return (
    <>
      <StatusBar
        backgroundColor={headerBackgroundColor}
        barStyle={theme.colors.background === '#fff' ? 'dark-content' : 'light-content'}
        translucent={Platform.OS === 'android'}
      />
      <View
        style={[
          styles.container,
          {
            backgroundColor: headerBackgroundColor,
            paddingTop: insets.top,
            height: totalHeight,
          },
          style,
        ]}
      >
        <View style={styles.header}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {leftButton ? (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={leftButton.onPress}
                activeOpacity={0.7}
              >
                {leftButton.icon && (
                  <Icon name={leftButton.icon} size={24} color={theme.colors.text} />
                )}
                {leftButton.text && (
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                    {leftButton.text}
                  </Text>
                )}
              </TouchableOpacity>
            ) : showLogo ? (
              <View style={styles.logoContainer}>
                <Text style={[styles.logoText, { color: theme.colors.primary }]}>
                  Pairity
                </Text>
              </View>
            ) : null}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            {isSearchExpanded ? (
              <View style={styles.searchContainer}>
                <Icon name="search" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  style={[
                    styles.searchInput,
                    { color: theme.colors.text, backgroundColor: theme.colors.surface },
                  ]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={theme.colors.textSecondary}
                  value={searchText}
                  onChangeText={handleSearchChange}
                  autoFocus
                />
                <TouchableOpacity onPress={handleSearchPress}>
                  <Icon name="close" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : title ? (
              <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
                {title}
              </Text>
            ) : null}
          </View>

          {/* Right Section */}
          <View style={styles.rightSection}>
            {showSearch && !isSearchExpanded && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleSearchPress}
                activeOpacity={0.7}
              >
                <Icon name="search" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}

            {showPremiumButton && !user?.isPremium && (
              <TouchableOpacity
                style={[styles.premiumButton, { backgroundColor: theme.colors.primary }]}
                onPress={handlePremiumPress}
                activeOpacity={0.8}
              >
                <Icon name="star" size={16} color="#fff" />
                <Text style={styles.premiumText}>Pro</Text>
              </TouchableOpacity>
            )}

            {showNotifications && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleNotificationPress}
                activeOpacity={0.7}
              >
                <Icon name="notifications" size={24} color={theme.colors.text} />
                {notificationCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {notificationCount > 99 ? '99+' : notificationCount.toString()}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {showProfile && user && (
              <TouchableOpacity
                style={styles.profileButton}
                onPress={handleProfilePress}
                activeOpacity={0.7}
              >
                {user.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <View style={[styles.profilePlaceholder, { backgroundColor: theme.colors.primary }]}>
                    <Text style={styles.profileInitial}>
                      {user.firstName?.charAt(0)?.toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                {user.isPremium && (
                  <View style={styles.premiumIndicator}>
                    <Icon name="star" size={12} color="#FFD700" />
                  </View>
                )}
              </TouchableOpacity>
            )}

            {rightButton && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={rightButton.onPress}
                activeOpacity={0.7}
              >
                {rightButton.icon && (
                  <Icon name={rightButton.icon} size={24} color={theme.colors.text} />
                )}
                {rightButton.text && (
                  <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                    {rightButton.text}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 60,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerButton: {
    padding: 8,
    marginHorizontal: 4,
    position: 'relative',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flex: 1,
    marginHorizontal: 8,
  },
  searchInput: {
    flex: 1,
    marginHorizontal: 8,
    fontSize: 16,
    padding: 0,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  premiumText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  profileButton: {
    position: 'relative',
    marginLeft: 8,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  premiumIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 1,
  },
});

export default CustomHeader;