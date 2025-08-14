import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

interface ComparisonFeature {
  feature: string;
  free: boolean | string;
  premium: boolean | string;
}

const FeatureComparisonTable: React.FC = () => {
  const theme = useTheme();

  const comparisonFeatures: ComparisonFeature[] = [
    {
      feature: 'Daily Swipes',
      free: '100',
      premium: 'Unlimited',
    },
    {
      feature: 'See Who Likes You',
      free: false,
      premium: true,
    },
    {
      feature: 'Advanced Filters',
      free: false,
      premium: true,
    },
    {
      feature: 'Priority Likes',
      free: false,
      premium: true,
    },
    {
      feature: 'Rewind Last Swipe',
      free: false,
      premium: true,
    },
    {
      feature: 'Travel Mode',
      free: false,
      premium: true,
    },
    {
      feature: 'Browse Invisibly',
      free: false,
      premium: true,
    },
    {
      feature: 'Super Likes',
      free: '5/month',
      premium: '25/month',
    },
    {
      feature: 'Profile Boost',
      free: false,
      premium: true,
    },
    {
      feature: 'Read Receipts',
      free: false,
      premium: true,
    },
    {
      feature: 'Message Before Match',
      free: false,
      premium: true,
    },
    {
      feature: 'HD Photos',
      free: false,
      premium: true,
    },
  ];

  const renderFeatureValue = (value: boolean | string, isPremium: boolean) => {
    if (typeof value === 'boolean') {
      return (
        <View style={styles.featureValue}>
          {value ? (
            <Icon 
              name="check-circle" 
              size={20} 
              color={isPremium ? theme.colors.premium : theme.colors.accent} 
            />
          ) : (
            <Icon 
              name="close" 
              size={20} 
              color={theme.colors.textSecondary} 
            />
          )}
        </View>
      );
    }
    
    return (
      <View style={styles.featureValue}>
        <Text 
          style={[
            styles.featureText, 
            { 
              color: isPremium ? theme.colors.premium : theme.colors.textSecondary,
              fontWeight: isPremium ? '600' : 'normal',
            }
          ]}
        >
          {value}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerColumn}>
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            Feature
          </Text>
        </View>
        <View style={styles.headerColumn}>
          <Text style={[styles.headerText, { color: theme.colors.text }]}>
            Free
          </Text>
        </View>
        <View style={styles.headerColumn}>
          <View style={[styles.premiumHeader, { backgroundColor: theme.colors.premium }]}>
            <Text style={styles.premiumHeaderText}>Premium</Text>
          </View>
        </View>
      </View>

      {/* Features */}
      {comparisonFeatures.map((item, index) => (
        <View 
          key={index} 
          style={[
            styles.row, 
            index % 2 === 0 && { backgroundColor: `${theme.colors.text}05` }
          ]}
        >
          <View style={styles.column}>
            <Text style={[styles.featureName, { color: theme.colors.text }]}>
              {item.feature}
            </Text>
          </View>
          <View style={styles.column}>
            {renderFeatureValue(item.free, false)}
          </View>
          <View style={styles.column}>
            {renderFeatureValue(item.premium, true)}
          </View>
        </View>
      ))}

      {/* Footer CTA */}
      <View style={[styles.footer, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={[styles.footerText, { color: theme.colors.primary }]}>
          Upgrade to Premium and unlock all features
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  premiumHeader: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumHeaderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    minHeight: 50,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureName: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'left',
    flex: 1,
  },
  featureValue: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 24,
  },
  featureText: {
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default FeatureComparisonTable;