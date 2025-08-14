import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomSlider from '@/components/CustomSlider';
import CustomButton from '@/components/CustomButton';
import { Filter } from '@/types/discover';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  filters: Filter;
  onApply: (filters: Filter) => void;
  onReset: () => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [localFilters, setLocalFilters] = useState<Filter>(filters);

  const bodyTypes = ['Slim', 'Athletic', 'Average', 'Curvy', 'Plus Size'];
  const educationLevels = ['High School', 'Some College', "Bachelor's", "Master's", 'PhD'];
  const relationshipGoals = ['Serious Relationship', 'Casual Dating', 'New Friends', 'Marriage'];
  const languages = ['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 'Chinese', 'Japanese'];
  const interests = ['Travel', 'Music', 'Movies', 'Sports', 'Reading', 'Cooking', 'Photography', 'Art', 'Gaming', 'Fitness'];

  const toggleArrayFilter = (array: string[], value: string) => {
    if (array.includes(value)) {
      return array.filter(item => item !== value);
    }
    return [...array, value];
  };

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    const defaultFilters: Filter = {
      ageRange: [18, 99],
      distance: 100,
      heightRange: [140, 220],
      bodyTypes: [],
      education: '',
      relationshipGoals: [],
      lifestyle: {
        smoking: '',
        drinking: '',
        exercise: '',
        diet: '',
      },
      children: '',
      religion: '',
      politics: '',
      languages: [],
      interests: [],
    };
    setLocalFilters(defaultFilters);
    onReset();
  };

  const renderCheckbox = (label: string, checked: boolean, onPress: () => void) => (
    <TouchableOpacity style={styles.checkboxContainer} onPress={onPress}>
      <Icon
        name={checked ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={checked ? '#FF6B6B' : '#666'}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );

  const renderRadio = (label: string, value: string, groupValue: string, onPress: () => void) => (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <Icon
        name={value === groupValue ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={24}
        color={value === groupValue ? '#FF6B6B' : '#666'}
      />
      <Text style={styles.radioLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Filters</Text>
          <TouchableOpacity onPress={handleReset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Age Range */}
          <View style={styles.section}>
            <CustomSlider
              label="Age Range"
              value={localFilters.ageRange}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, ageRange: value as [number, number] })
              }
              minimumValue={18}
              maximumValue={99}
              isDualSlider
              icon="cake"
            />
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <CustomSlider
              label="Maximum Distance"
              value={localFilters.distance}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, distance: value as number })
              }
              minimumValue={1}
              maximumValue={500}
              unit="miles"
              icon="location-on"
            />
          </View>

          {/* Height Range */}
          <View style={styles.section}>
            <CustomSlider
              label="Height Range"
              value={localFilters.heightRange}
              onValueChange={(value) =>
                setLocalFilters({ ...localFilters, heightRange: value as [number, number] })
              }
              minimumValue={140}
              maximumValue={220}
              isDualSlider
              unit="cm"
              icon="straighten"
            />
          </View>

          {/* Body Type */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Body Type</Text>
            <View style={styles.checkboxGrid}>
              {bodyTypes.map(type => (
                <View key={type} style={styles.checkboxItem}>
                  {renderCheckbox(
                    type,
                    localFilters.bodyTypes.includes(type),
                    () => setLocalFilters({
                      ...localFilters,
                      bodyTypes: toggleArrayFilter(localFilters.bodyTypes, type),
                    })
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Education */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education Level</Text>
            {educationLevels.map(level => (
              renderRadio(
                level,
                level,
                localFilters.education,
                () => setLocalFilters({ ...localFilters, education: level })
              )
            ))}
          </View>

          {/* Relationship Goals */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Relationship Goals</Text>
            <View style={styles.checkboxGrid}>
              {relationshipGoals.map(goal => (
                <View key={goal} style={styles.checkboxItem}>
                  {renderCheckbox(
                    goal,
                    localFilters.relationshipGoals.includes(goal),
                    () => setLocalFilters({
                      ...localFilters,
                      relationshipGoals: toggleArrayFilter(localFilters.relationshipGoals, goal),
                    })
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Lifestyle */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lifestyle</Text>
            
            <Text style={styles.subsectionTitle}>Smoking</Text>
            <View style={styles.radioGroup}>
              {['Never', 'Sometimes', 'Often'].map(option => (
                renderRadio(
                  option,
                  option.toLowerCase(),
                  localFilters.lifestyle.smoking,
                  () => setLocalFilters({
                    ...localFilters,
                    lifestyle: { ...localFilters.lifestyle, smoking: option.toLowerCase() },
                  })
                )
              ))}
            </View>

            <Text style={styles.subsectionTitle}>Drinking</Text>
            <View style={styles.radioGroup}>
              {['Never', 'Socially', 'Often'].map(option => (
                renderRadio(
                  option,
                  option.toLowerCase(),
                  localFilters.lifestyle.drinking,
                  () => setLocalFilters({
                    ...localFilters,
                    lifestyle: { ...localFilters.lifestyle, drinking: option.toLowerCase() },
                  })
                )
              ))}
            </View>
          </View>

          {/* Children */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Children</Text>
            {["Don't have & don't want", "Don't have & want", 'Have & want more', "Have & don't want more", 'Open to children'].map(option => (
              renderRadio(
                option,
                option,
                localFilters.children,
                () => setLocalFilters({ ...localFilters, children: option })
              )
            ))}
          </View>

          {/* Languages */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <View style={styles.tagContainer}>
              {languages.map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[
                    styles.tag,
                    localFilters.languages.includes(lang) && styles.tagActive,
                  ]}
                  onPress={() => setLocalFilters({
                    ...localFilters,
                    languages: toggleArrayFilter(localFilters.languages, lang),
                  })}
                >
                  <Text style={[
                    styles.tagText,
                    localFilters.languages.includes(lang) && styles.tagTextActive,
                  ]}>
                    {lang}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interests */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Interests</Text>
            <View style={styles.tagContainer}>
              {interests.map(interest => (
                <TouchableOpacity
                  key={interest}
                  style={[
                    styles.tag,
                    localFilters.interests.includes(interest) && styles.tagActive,
                  ]}
                  onPress={() => setLocalFilters({
                    ...localFilters,
                    interests: toggleArrayFilter(localFilters.interests, interest),
                  })}
                >
                  <Text style={[
                    styles.tagText,
                    localFilters.interests.includes(interest) && styles.tagTextActive,
                  ]}>
                    {interest}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Apply Button */}
        <View style={styles.footer}>
          <CustomButton
            title="Apply Filters"
            onPress={handleApply}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  resetText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  checkboxGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  checkboxItem: {
    width: '50%',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  radioGroup: {
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  tagActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  tagText: {
    fontSize: 14,
    color: '#666',
  },
  tagTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  bottomSpacer: {
    height: 40,
  },
});

export default FilterModal;