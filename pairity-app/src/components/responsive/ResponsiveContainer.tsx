import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native';
import { useDeviceInfo, useAdaptivePadding, useSafeContentWidth } from '@/hooks/useResponsive';
import { useTheme } from '@/components/ThemeProvider';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  keyboardAvoiding?: boolean;
  safeArea?: boolean;
  centered?: boolean;
  maxWidth?: number;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  scrollable = false,
  keyboardAvoiding = false,
  safeArea = true,
  centered = false,
  maxWidth,
  style,
  contentContainerStyle,
  edges = ['top', 'bottom'],
}) => {
  const theme = useTheme();
  const deviceInfo = useDeviceInfo();
  const padding = useAdaptivePadding();
  const contentWidth = useSafeContentWidth();

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: theme.colors.background,
    ...style,
  };

  const innerContainerStyle: ViewStyle = {
    flex: 1,
    paddingHorizontal: padding,
    maxWidth: maxWidth || (deviceInfo.isTablet ? 768 : undefined),
    width: '100%',
    alignSelf: centered ? 'center' : undefined,
    ...contentContainerStyle,
  };

  const content = scrollable ? (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.scrollContent, innerContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={innerContainerStyle}>
      {children}
    </View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {content}
    </KeyboardAvoidingView>
  ) : content;

  if (safeArea) {
    return (
      <SafeAreaView style={containerStyle} edges={edges}>
        {wrappedContent}
      </SafeAreaView>
    );
  }

  return (
    <View style={containerStyle}>
      {wrappedContent}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
});

export default ResponsiveContainer;