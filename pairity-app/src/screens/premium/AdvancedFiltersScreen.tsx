import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';

import {
  updateFilterPreset,
  saveFilterPreset,
  deleteFilterPreset,
} from '@/store/slices/premiumSlice';
import { PremiumFeature, FilterPreset } from '@/types/premium';

interface FilterSection {
  title: string;
  icon: string;
  filters: FilterOption[];
}

interface FilterOption {
  key: string;
  label: string;
  type: 'range' | 'multiselect' | 'toggle' | 'select';
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  value?: any;
}

const AdvancedFiltersScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const { features, savedFilterPresets } = useSelector((state: RootState) => state.premium);
  const hasAdvancedFilters = features.includes(PremiumFeature.ADVANCED_FILTERS);

  const [currentPreset, setCurrentPreset] = useState<FilterPreset>({
    id: 'current',
    name: 'Current Filters',
    filters: {},
    isDefault: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  const filterSections: FilterSection[] = [
    {
      title: 'Demographics',
      icon: 'person',
      filters: [
        {
          key: 'ageRange',
          label: 'Age Range',
          type: 'range',
          min: 18,
          max: 65,
          step: 1,
          unit: 'years',
          value: [25, 35],
        },
        {
          key: 'distance',
          label: 'Distance',
          type: 'range',
          min: 1,
          max: 100,
          step: 1,
          unit: 'km',
          value: [1, 50],
        },
        {
          key: 'height',
          label: 'Height',
          type: 'range',
          min: 150,
          max: 210,
          step: 1,
          unit: 'cm',
          value: [160, 190],
        },
        {
          key: 'education',
          label: 'Education Level',
          type: 'multiselect',
          options: [
            'High School',
            'Some College',
            'Undergraduate',
            'Graduate',
            'PhD/Doctorate',
          ],
          value: [],
        },
      ],
    },
    {
      title: 'Lifestyle',
      icon: 'lifestyle',
      filters: [
        {
          key: 'smoking',
          label: 'Smoking',
          type: 'multiselect',
          options: [
            'Non-smoker',
            'Social smoker',
            'Regular smoker',
            'Prefer not to say',
          ],
          value: ['Non-smoker'],
        },
        {
          key: 'drinking',
          label: 'Drinking',
          type: 'multiselect',
          options: [
            'Never',
            'Rarely',
            'Socially',
            'Regularly',
            'Prefer not to say',
          ],
          value: ['Socially'],
        },
        {
          key: 'exercise',
          label: 'Exercise Frequency',
          type: 'multiselect',
          options: [
            'Daily',
            'Several times a week',
            'Weekly',
            'Rarely',
            'Never',
          ],
          value: [],
        },
        {
          key: 'diet',
          label: 'Diet',
          type: 'multiselect',
          options: [
            'Omnivore',
            'Vegetarian',
            'Vegan',
            'Pescatarian',
            'Keto',
            'Paleo',
            'Other',
          ],
          value: [],
        },
      ],
    },
    {
      title: 'Personal',
      icon: 'psychology',
      filters: [
        {
          key: 'religion',
          label: 'Religion',
          type: 'multiselect',
          options: [
            'Christian',
            'Catholic',
            'Jewish',
            'Muslim',
            'Hindu',
            'Buddhist',
            'Agnostic',
            'Atheist',
            'Spiritual',
            'Other',
            'Prefer not to say',
          ],
          value: [],
        },
        {
          key: 'politics',
          label: 'Political Views',
          type: 'multiselect',
          options: [
            'Liberal',
            'Conservative',
            'Moderate',
            'Independent',
            'Other',
            'Prefer not to say',
          ],
          value: [],
        },
        {
          key: 'children',
          label: 'Children',
          type: 'multiselect',
          options: [
            'Have children',
            'Want children',
            "Don't want children",
            'Open to children',
            'Prefer not to say',
          ],
          value: [],
        },
        {
          key: 'pets',
          label: 'Pets',
          type: 'multiselect',
          options: [
            'Dog lover',
            'Cat lover',
            'Have pets',
            'Want pets',
            "Don't like pets",
            'Allergic to pets',
          ],
          value: [],
        },
      ],
    },
    {
      title: 'Preferences',
      icon: 'tune',
      filters: [
        {
          key: 'showOnline',
          label: 'Show only online users',
          type: 'toggle',
          value: false,
        },
        {
          key: 'showVerified',
          label: 'Show only verified profiles',
          type: 'toggle',
          value: false,
        },
        {
          key: 'showPhotos',
          label: 'Show only profiles with photos',
          type: 'toggle',
          value: true,
        },
        {
          key: 'showComplete',
          label: 'Show only complete profiles',
          type: 'toggle',
          value: false,
        },
      ],
    },
  ];

  useEffect(() => {
    // Initialize with saved preset or default values
    if (savedFilterPresets.length > 0) {
      const defaultPreset = savedFilterPresets.find(p => p.isDefault);
      if (defaultPreset) {
        setCurrentPreset(defaultPreset);
        setSelectedPresetId(defaultPreset.id);
      }
    }
  }, [savedFilterPresets]);

  const updateFilterValue = (sectionIndex: number, filterIndex: number, value: any) => {
    const updatedSections = [...filterSections];
    updatedSections[sectionIndex].filters[filterIndex].value = value;
    
    // Update current preset
    const updatedPreset = {
      ...currentPreset,
      filters: {
        ...currentPreset.filters,
        [`${sectionIndex}_${filterIndex}`]: value,
      },
      updatedAt: new Date(),
    };
    
    setCurrentPreset(updatedPreset);
  };

  const handleSavePreset = () => {
    Alert.prompt(
      'Save Filter Preset',
      'Enter a name for this filter preset:',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: (name) => {
            if (name && name.trim()) {
              const newPreset: FilterPreset = {
                ...currentPreset,
                id: `preset_${Date.now()}`,
                name: name.trim(),
                isDefault: savedFilterPresets.length === 0,
              };
              
              dispatch(saveFilterPreset(newPreset));
              setSelectedPresetId(newPreset.id);
              Alert.alert('Success', 'Filter preset saved successfully!');
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setCurrentPreset(preset);
    setSelectedPresetId(preset.id);
    Alert.alert('Success', `Loaded preset: ${preset.name}`);
  };

  const handleDeletePreset = (preset: FilterPreset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            dispatch(deleteFilterPreset(preset.id));
            if (selectedPresetId === preset.id) {
              setSelectedPresetId(null);
            }
          },
        },
      ]
    );
  };

  const handleApplyFilters = () => {
    // Apply filters and navigate back
    navigation.goBack();
    // In a real app, you would pass these filters to the discovery/swipe screens
    Alert.alert('Success', 'Advanced filters applied successfully!');
  };

  const handleResetFilters = () => {
    Alert.alert(
      'Reset Filters',
      'This will reset all filters to default values. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset all filter values to defaults
            filterSections.forEach((section, sectionIndex) => {
              section.filters.forEach((filter, filterIndex) => {
                if (filter.type === 'range') {
                  updateFilterValue(sectionIndex, filterIndex, [filter.min, filter.max]);
                } else if (filter.type === 'multiselect') {
                  updateFilterValue(sectionIndex, filterIndex, []);
                } else if (filter.type === 'toggle') {
                  updateFilterValue(sectionIndex, filterIndex, false);
                }
              });
            });
          },
        },
      ]
    );
  };

  const renderRangeFilter = (filter: FilterOption, sectionIndex: number, filterIndex: number) => (
    <View style={styles.filterItem}>
      <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
        {filter.label}
      </Text>
      <View style={styles.rangeContainer}>
        <Text style={[styles.rangeValue, { color: theme.colors.textSecondary }]}>
          {filter.value[0]} - {filter.value[1]} {filter.unit}
        </Text>
        {/* In a real app, you would use a proper range slider component */}
        <View style={styles.rangeSliderPlaceholder}>
          <Text style={[styles.rangeSliderText, { color: theme.colors.textSecondary }]}>
            Range Slider ({filter.min} - {filter.max})
          </Text>
        </View>
      </View>
    </View>
  );

  const renderMultiselectFilter = (filter: FilterOption, sectionIndex: number, filterIndex: number) => (
    <View style={styles.filterItem}>
      <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
        {filter.label}
      </Text>
      <View style={styles.multiselectContainer}>
        {filter.options?.map((option, optionIndex) => {
          const isSelected = filter.value?.includes(option);
          return (
            <TouchableOpacity
              key={optionIndex}
              style={[
                styles.multiselectOption,
                {
                  backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.background,
                  borderColor: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                },
              ]}
              onPress={() => {
                const currentValue = filter.value || [];
                const newValue = isSelected
                  ? currentValue.filter((v: string) => v !== option)
                  : [...currentValue, option];
                updateFilterValue(sectionIndex, filterIndex, newValue);
              }}
            >
              <Text
                style={[
                  styles.multiselectOptionText,
                  {
                    color: isSelected ? theme.colors.primary : theme.colors.textSecondary,
                  },
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderToggleFilter = (filter: FilterOption, sectionIndex: number, filterIndex: number) => (
    <View style={[styles.filterItem, styles.toggleFilterItem]}>
      <Text style={[styles.filterLabel, { color: theme.colors.text }]}>
        {filter.label}
      </Text>
      <Switch
        value={filter.value}
        onValueChange={(value) => updateFilterValue(sectionIndex, filterIndex, value)}
        trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primaryLight }}
        thumbColor={filter.value ? theme.colors.primary : '#f4f3f4'}
      />
    </View>
  );

  const renderFilter = (filter: FilterOption, sectionIndex: number, filterIndex: number) => {
    switch (filter.type) {
      case 'range':
        return renderRangeFilter(filter, sectionIndex, filterIndex);
      case 'multiselect':
        return renderMultiselectFilter(filter, sectionIndex, filterIndex);
      case 'toggle':
        return renderToggleFilter(filter, sectionIndex, filterIndex);
      default:
        return null;
    }
  };

  if (!hasAdvancedFilters) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Advanced Filters
          </Text>
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.upgradePrompt}>
          <Icon name="tune" size={64} color={theme.colors.textSecondary} />
          <Text style={[styles.upgradeTitle, { color: theme.colors.text }]}>
            Premium Feature
          </Text>
          <Text style={[styles.upgradeMessage, { color: theme.colors.textSecondary }]}>
            Upgrade to Premium to access advanced filtering options
          </Text>
          <TouchableOpacity
            style={[styles.upgradeButton, { backgroundColor: theme.colors.premium }]}
            onPress={() => navigation.navigate('PremiumLanding' as never)}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          Advanced Filters
        </Text>
        <TouchableOpacity
          onPress={handleResetFilters}
          style={styles.resetButton}
        >
          <Text style={[styles.resetButtonText, { color: theme.colors.textSecondary }]}>
            Reset
          </Text>
        </TouchableOpacity>
      </View>

      {/* Saved Presets */}
      {savedFilterPresets.length > 0 && (
        <View style={[styles.presetsSection, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.presetsSectionTitle, { color: theme.colors.text }]}>
            Saved Presets
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.presetsList}>
              {savedFilterPresets.map((preset) => (
                <View key={preset.id} style={styles.presetItem}>
                  <TouchableOpacity
                    style={[
                      styles.presetButton,
                      {
                        backgroundColor: selectedPresetId === preset.id 
                          ? theme.colors.primaryLight 
                          : theme.colors.background,
                        borderColor: selectedPresetId === preset.id 
                          ? theme.colors.primary 
                          : theme.colors.textSecondary,
                      },
                    ]}
                    onPress={() => handleLoadPreset(preset)}
                  >
                    <Text
                      style={[
                        styles.presetButtonText,
                        {
                          color: selectedPresetId === preset.id 
                            ? theme.colors.primary 
                            : theme.colors.text,
                        },
                      ]}
                    >
                      {preset.name}
                    </Text>
                    {preset.isDefault && (
                      <Icon name="star" size={16} color={theme.colors.accent} />
                    )}
                  </TouchableOpacity>
                  
                  {!preset.isDefault && (
                    <TouchableOpacity
                      style={styles.deletePresetButton}
                      onPress={() => handleDeletePreset(preset)}
                    >
                      <Icon name="close" size={16} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {filterSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.sectionHeader}>
              <Icon name={section.icon} size={24} color={theme.colors.primary} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {section.title}
              </Text>
            </View>
            
            {section.filters.map((filter, filterIndex) => (
              <View key={`${sectionIndex}_${filterIndex}`}>
                {renderFilter(filter, sectionIndex, filterIndex)}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.saveButton, { backgroundColor: theme.colors.primaryLight }]}
          onPress={handleSavePreset}
        >
          <Icon name="bookmark" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
            Save Preset
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.applyButton, { backgroundColor: theme.colors.premium }]}
          onPress={handleApplyFilters}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
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
  headerRight: {
    width: 40,
  },
  resetButton: {
    padding: 8,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  upgradePrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  upgradeMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  upgradeButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 24,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  presetsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  presetsSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  presetsList: {
    flexDirection: 'row',
    gap: 8,
  },
  presetItem: {
    position: 'relative',
  },
  presetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  presetButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  deletePresetButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  filterItem: {
    marginBottom: 20,
  },
  toggleFilterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  rangeContainer: {
    alignItems: 'center',
  },
  rangeValue: {
    fontSize: 14,
    marginBottom: 8,
  },
  rangeSliderPlaceholder: {
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  rangeSliderText: {
    fontSize: 12,
  },
  multiselectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  multiselectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  multiselectOptionText: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  saveButton: {
    flex: 0,
  },
  applyButton: {
    flex: 1,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AdvancedFiltersScreen;