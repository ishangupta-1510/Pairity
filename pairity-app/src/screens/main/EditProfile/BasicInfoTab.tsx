import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialIcons';
import CustomTextInput from '@/components/CustomTextInput';
import CustomPicker from '@/components/CustomPicker';
import CustomButton from '@/components/CustomButton';

interface BasicInfoTabProps {
  control: Control<any>;
  errors: FieldErrors<any>;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ control, errors }) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('basic');

  const heightOptions = [
    { label: "4'0\" - 4'11\"", value: 'under5' },
    { label: "5'0\" - 5'3\"", value: '5to5-3' },
    { label: "5'4\" - 5'7\"", value: '5-4to5-7' },
    { label: "5'8\" - 5'11\"", value: '5-8to5-11' },
    { label: "6'0\" - 6'3\"", value: '6to6-3' },
    { label: "6'4\" and above", value: 'above6-4' },
  ];

  const bodyTypeOptions = [
    { label: 'Slim', value: 'slim' },
    { label: 'Athletic', value: 'athletic' },
    { label: 'Average', value: 'average' },
    { label: 'Curvy', value: 'curvy' },
    { label: 'Plus Size', value: 'plus' },
  ];

  const relationshipGoalsOptions = [
    { label: 'Long-term relationship', value: 'long-term' },
    { label: 'Long-term, open to short', value: 'long-term-open' },
    { label: 'Short-term, open to long', value: 'short-term-open' },
    { label: 'Short-term fun', value: 'short-term' },
    { label: 'New friends', value: 'friends' },
    { label: 'Still figuring it out', value: 'figuring' },
  ];

  const childrenOptions = [
    { label: "Don't have & don't want", value: 'none-no' },
    { label: "Don't have & want", value: 'none-yes' },
    { label: 'Have & want more', value: 'have-yes' },
    { label: "Have & don't want more", value: 'have-no' },
    { label: 'Want someday', value: 'someday' },
    { label: 'Open to children', value: 'open' },
  ];

  const zodiacOptions = [
    { label: 'Aries', value: 'aries' },
    { label: 'Taurus', value: 'taurus' },
    { label: 'Gemini', value: 'gemini' },
    { label: 'Cancer', value: 'cancer' },
    { label: 'Leo', value: 'leo' },
    { label: 'Virgo', value: 'virgo' },
    { label: 'Libra', value: 'libra' },
    { label: 'Scorpio', value: 'scorpio' },
    { label: 'Sagittarius', value: 'sagittarius' },
    { label: 'Capricorn', value: 'capricorn' },
    { label: 'Aquarius', value: 'aquarius' },
    { label: 'Pisces', value: 'pisces' },
  ];

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const SectionHeader = ({ title, section, icon }: { title: string; section: string; icon: string }) => (
    <TouchableOpacity
      style={styles.sectionHeader}
      onPress={() => toggleSection(section)}
    >
      <View style={styles.sectionHeaderLeft}>
        <Icon name={icon} size={20} color="#666" />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <Icon
        name={expandedSection === section ? 'expand-less' : 'expand-more'}
        size={24}
        color="#666"
      />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <SectionHeader title="Basic Information" section="basic" icon="person" />
          {expandedSection === 'basic' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'Name is required' }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Full Name"
                    value={value}
                    onChangeText={onChange}
                    error={errors.name?.message}
                    placeholder="Enter your full name"
                  />
                )}
              />

              <Controller
                control={control}
                name="bio"
                rules={{
                  required: 'Bio is required',
                  maxLength: { value: 500, message: 'Bio must be less than 500 characters' },
                }}
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Bio"
                    value={value}
                    onChangeText={onChange}
                    error={errors.bio?.message}
                    placeholder="Tell us about yourself..."
                    multiline
                    numberOfLines={4}
                    maxLength={500}
                  />
                )}
              />

              <Text style={styles.characterCount}>
                {control._formValues?.bio?.length || 0}/500 characters
              </Text>
            </View>
          )}
        </View>

        {/* Work & Education */}
        <View style={styles.section}>
          <SectionHeader title="Work & Education" section="work" icon="work" />
          {expandedSection === 'work' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="work"
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Work"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Your job title and company"
                    leftIcon="work"
                  />
                )}
              />

              <Controller
                control={control}
                name="education"
                render={({ field: { onChange, value } }) => (
                  <CustomTextInput
                    label="Education"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Your education background"
                    leftIcon="school"
                  />
                )}
              />
            </View>
          )}
        </View>

        {/* Physical Attributes */}
        <View style={styles.section}>
          <SectionHeader title="Physical Attributes" section="physical" icon="straighten" />
          {expandedSection === 'physical' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="height"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    label="Height"
                    value={value}
                    onValueChange={onChange}
                    items={heightOptions}
                    placeholder="Select your height"
                  />
                )}
              />

              <Controller
                control={control}
                name="bodyType"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    label="Body Type"
                    value={value}
                    onValueChange={onChange}
                    items={bodyTypeOptions}
                    placeholder="Select body type"
                  />
                )}
              />
            </View>
          )}
        </View>

        {/* Relationship Goals */}
        <View style={styles.section}>
          <SectionHeader title="Relationship Goals" section="relationship" icon="favorite" />
          {expandedSection === 'relationship' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="relationshipGoals"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    label="Looking For"
                    value={value}
                    onValueChange={onChange}
                    items={relationshipGoalsOptions}
                    placeholder="What are you looking for?"
                  />
                )}
              />

              <Controller
                control={control}
                name="children"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    label="Children"
                    value={value}
                    onValueChange={onChange}
                    items={childrenOptions}
                    placeholder="Your thoughts on children"
                  />
                )}
              />
            </View>
          )}
        </View>

        {/* Languages & Culture */}
        <View style={styles.section}>
          <SectionHeader title="Languages & Culture" section="culture" icon="language" />
          {expandedSection === 'culture' && (
            <View style={styles.sectionContent}>
              <Controller
                control={control}
                name="languages"
                render={({ field: { onChange, value } }) => (
                  <View>
                    <Text style={styles.label}>Languages Spoken</Text>
                    <View style={styles.languageContainer}>
                      {['English', 'Spanish', 'French', 'Mandarin', 'Hindi', 'Arabic'].map((lang) => (
                        <TouchableOpacity
                          key={lang}
                          style={[
                            styles.languageChip,
                            value?.includes(lang) && styles.languageChipSelected,
                          ]}
                          onPress={() => {
                            const currentValues = value || [];
                            if (currentValues.includes(lang)) {
                              onChange(currentValues.filter((l: string) => l !== lang));
                            } else {
                              onChange([...currentValues, lang]);
                            }
                          }}
                        >
                          <Text
                            style={[
                              styles.languageChipText,
                              value?.includes(lang) && styles.languageChipTextSelected,
                            ]}
                          >
                            {lang}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              />

              <Controller
                control={control}
                name="zodiac"
                render={({ field: { onChange, value } }) => (
                  <CustomPicker
                    label="Zodiac Sign (Optional)"
                    value={value}
                    onValueChange={onChange}
                    items={zodiacOptions}
                    placeholder="Select your zodiac sign"
                  />
                )}
              />
            </View>
          )}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  sectionContent: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  languageChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    marginBottom: 8,
  },
  languageChipSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  languageChipText: {
    fontSize: 14,
    color: '#666',
  },
  languageChipTextSelected: {
    color: '#fff',
  },
  bottomSpacer: {
    height: 100,
  },
});

export default BasicInfoTab;