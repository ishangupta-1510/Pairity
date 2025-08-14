import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDeviceInfo, useIsLandscape } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';
import { moderateScale } from '@/utils/responsive';

interface TabletSplitViewProps {
  master: React.ReactNode;
  detail: React.ReactNode;
  masterWidth?: number | string;
  minMasterWidth?: number;
  maxMasterWidth?: number;
  collapsible?: boolean;
  showDivider?: boolean;
  onMasterVisibilityChange?: (visible: boolean) => void;
}

const TabletSplitView: React.FC<TabletSplitViewProps> = ({
  master,
  detail,
  masterWidth = '35%',
  minMasterWidth = 280,
  maxMasterWidth = 400,
  collapsible = true,
  showDivider = true,
  onMasterVisibilityChange,
}) => {
  const theme = useTheme();
  const deviceInfo = useDeviceInfo();
  const isLandscape = useIsLandscape();
  const [masterVisible, setMasterVisible] = useState(true);
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  // Only use split view on tablets in landscape or large tablets in portrait
  const shouldUseSplitView = deviceInfo.isTablet && 
    (isLandscape || deviceInfo.deviceSize === 'large_tablet');

  const toggleMaster = () => {
    const newValue = !masterVisible;
    setMasterVisible(newValue);
    
    Animated.timing(slideAnim, {
      toValue: newValue ? 0 : -1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    onMasterVisibilityChange?.(newValue);
  };

  if (!shouldUseSplitView) {
    // On phones or portrait tablets, show only detail view
    return <View style={styles.container}>{detail}</View>;
  }

  const calculatedMasterWidth = typeof masterWidth === 'number' 
    ? masterWidth 
    : deviceInfo.width * (parseInt(masterWidth) / 100);

  const finalMasterWidth = Math.min(
    Math.max(calculatedMasterWidth, minMasterWidth),
    maxMasterWidth
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View
        style={[
          styles.masterContainer,
          {
            width: finalMasterWidth,
            backgroundColor: theme.colors.surface,
            transform: [{
              translateX: slideAnim.interpolate({
                inputRange: [-1, 0],
                outputRange: [-finalMasterWidth, 0],
              }),
            }],
          },
        ]}
      >
        {master}
      </Animated.View>

      {showDivider && masterVisible && (
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      )}

      <View style={styles.detailContainer}>
        {collapsible && (
          <TouchableOpacity
            style={[
              styles.toggleButton,
              {
                backgroundColor: theme.colors.surface,
                left: masterVisible ? finalMasterWidth - 20 : -20,
              },
            ]}
            onPress={toggleMaster}
          >
            <Icon
              name={masterVisible ? 'chevron-left' : 'chevron-right'}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
        {detail}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  masterContainer: {
    shadowColor: '#000',
    shadowOffset: {
      width: 2,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  detailContainer: {
    flex: 1,
    position: 'relative',
  },
  divider: {
    width: 1,
  },
  toggleButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default TabletSplitView;