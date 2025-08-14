import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { SubscriptionPlan } from '@/types/premium';

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
  style?: any;
}

const SubscriptionPlanCard: React.FC<SubscriptionPlanCardProps> = ({
  plan,
  isSelected,
  onSelect,
  onSubscribe,
  style,
}) => {
  const theme = useTheme();

  const getPeriodText = () => {
    switch (plan.billingPeriod) {
      case 'monthly': return 'month';
      case 'quarterly': return '3 months';
      case '6-month': return '6 months';
      case 'yearly': return 'year';
      default: return plan.billingPeriod;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          backgroundColor: theme.colors.surface,
          borderColor: isSelected ? theme.colors.premium : 'transparent',
        },
        isSelected && styles.selected,
        style,
      ]}
      onPress={onSelect}
      activeOpacity={0.8}
    >
      {plan.isPopular && (
        <View style={[styles.popularBadge, { backgroundColor: theme.colors.premium }]}>
          <Text style={styles.popularText}>{plan.badge || 'Popular'}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={[styles.planName, { color: theme.colors.text }]}>
          {plan.name}
        </Text>
        {plan.savingsPercentage && (
          <View style={[styles.savingsBadge, { backgroundColor: theme.colors.accent }]}>
            <Text style={styles.savingsText}>Save {plan.savingsPercentage}%</Text>
          </View>
        )}
      </View>

      <View style={styles.priceContainer}>
        <Text style={[styles.price, { color: theme.colors.premium }]}>
          ${plan.price}
        </Text>
        <Text style={[styles.period, { color: theme.colors.textSecondary }]}>
          /{getPeriodText()}
        </Text>
        {plan.originalPrice && (
          <Text style={[styles.originalPrice, { color: theme.colors.textSecondary }]}>
            ${plan.originalPrice}
          </Text>
        )}
      </View>

      <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
        {plan.description}
      </Text>

      <TouchableOpacity
        style={[
          styles.subscribeButton,
          { 
            backgroundColor: isSelected ? theme.colors.premium : theme.colors.primaryLight,
          },
        ]}
        onPress={onSubscribe}
      >
        <Text
          style={[
            styles.subscribeText,
            { 
              color: isSelected ? 'white' : theme.colors.primary,
            },
          ]}
        >
          {plan.trialDays ? `Try ${plan.trialDays} days free` : 'Subscribe'}
        </Text>
      </TouchableOpacity>

      {isSelected && (
        <View style={styles.checkmark}>
          <Icon name="check-circle" size={20} color={theme.colors.premium} />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selected: {
    elevation: 4,
    shadowOpacity: 0.2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: plan => plan.isPopular ? 8 : 0,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
  },
  savingsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  savingsText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
    gap: 4,
  },
  price: {
    fontSize: 32,
    fontWeight: '700',
  },
  period: {
    fontSize: 16,
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 18,
  },
  subscribeButton: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  subscribeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
});

export default SubscriptionPlanCard;