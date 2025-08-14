import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { hideBanner } from '@/store/slices/notificationSlice';
import Toast from 'react-native-toast-message';

import NotificationBanner from './NotificationBanner';

const NotificationManager: React.FC = () => {
  const dispatch = useDispatch();
  const { activeBanners } = useSelector((state: RootState) => state.notifications);

  const handleBannerDismiss = (bannerId: string) => {
    dispatch(hideBanner(bannerId));
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* In-app notification banners */}
      {activeBanners.map((banner) => (
        <NotificationBanner
          key={banner.id}
          notification={banner}
          onDismiss={() => handleBannerDismiss(banner.id)}
        />
      ))}
      
      {/* Toast notifications */}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default NotificationManager;