import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ReportReason, ReportEvidence, Report } from '@/types/reporting';

interface ReportUserScreenProps {
  route: {
    params: {
      userId: string;
      userName: string;
      userPhoto: string;
      messageIds?: string[];
      photoIds?: string[];
    };
  };
}

const ReportUserScreen: React.FC<ReportUserScreenProps> = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  
  const { userId, userName, userPhoto, messageIds = [], photoIds = [] } = route.params as any;

  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(null);
  const [customReason, setCustomReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState<ReportEvidence[]>([]);
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [incidentDate, setIncidentDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Follow-up actions
  const [blockUser, setBlockUser] = useState(true);
  const [unmatchUser, setUnmatchUser] = useState(false);
  const [hideProfile, setHideProfile] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    {
      value: ReportReason.FAKE_PROFILE,
      label: 'Fake profile/Catfishing',
      icon: 'person-remove',
      description: 'Profile uses fake photos or information',
    },
    {
      value: ReportReason.INAPPROPRIATE_PHOTOS,
      label: 'Inappropriate photos',
      icon: 'photo-camera',
      description: 'Nude, sexual, or offensive images',
    },
    {
      value: ReportReason.HARASSMENT,
      label: 'Harassment/Bullying',
      icon: 'report',
      description: 'Unwanted messages or behavior',
    },
    {
      value: ReportReason.SPAM,
      label: 'Spam/Advertising',
      icon: 'email',
      description: 'Promotional content or scams',
    },
    {
      value: ReportReason.UNDERAGE,
      label: 'Underage user',
      icon: 'child-care',
      description: 'User appears to be under 18',
    },
    {
      value: ReportReason.OFFENSIVE_LANGUAGE,
      label: 'Offensive language',
      icon: 'warning',
      description: 'Hate speech or discriminatory content',
    },
    {
      value: ReportReason.THREATENING_BEHAVIOR,
      label: 'Threatening behavior',
      icon: 'dangerous',
      description: 'Threats of violence or harm',
    },
    {
      value: ReportReason.OFF_PLATFORM_BEHAVIOR,
      label: 'Off-platform behavior',
      icon: 'link',
      description: 'Concerning behavior outside the app',
    },
    {
      value: ReportReason.OTHER,
      label: 'Other',
      icon: 'more-horiz',
      description: 'Something else not listed above',
    },
  ];

  const handleImagePickerPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant access to your photo library to attach evidence.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      const newEvidence: ReportEvidence = {
        type: 'screenshot',
        uri: result.assets[0].uri,
        timestamp: new Date(),
        description: 'Screenshot evidence',
      };
      
      setEvidence([...evidence, newEvidence]);
    }
  };

  const removeEvidence = (index: number) => {
    const newEvidence = [...evidence];
    newEvidence.splice(index, 1);
    setEvidence(newEvidence);
  };

  const handleMessageSelection = (messageId: string) => {
    const newSelection = selectedMessages.includes(messageId)
      ? selectedMessages.filter(id => id !== messageId)
      : [...selectedMessages, messageId];
    
    setSelectedMessages(newSelection);
  };

  const handlePhotoSelection = (photoId: string) => {
    const newSelection = selectedPhotos.includes(photoId)
      ? selectedPhotos.filter(id => id !== photoId)
      : [...selectedPhotos, photoId];
    
    setSelectedPhotos(newSelection);
  };

  const handleSubmitReport = async () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting this user.');
      return;
    }

    if (selectedReason === ReportReason.OTHER && !customReason.trim()) {
      Alert.alert('Error', 'Please provide a custom reason for reporting.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'Please provide additional details about the issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Compile all evidence
      const allEvidence: ReportEvidence[] = [
        ...evidence,
        ...selectedMessages.map(messageId => ({
          type: 'message' as const,
          messageId,
          timestamp: new Date(),
        })),
        ...selectedPhotos.map(photoId => ({
          type: 'photo' as const,
          photoId,
          timestamp: new Date(),
        })),
      ];

      const report: Omit<Report, 'id' | 'createdAt' | 'updatedAt'> = {
        reporterId: 'current-user-id', // Replace with actual user ID
        reportedUserId: userId,
        reason: selectedReason,
        customReason: selectedReason === ReportReason.OTHER ? customReason : undefined,
        description,
        evidence: allEvidence,
        incidentTimestamp: incidentDate,
        blockedUser: blockUser,
        unmatchedUser: unmatchUser,
        hidProfile: hideProfile,
        status: 'pending' as const,
        priority: 'medium' as const,
      };

      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Perform follow-up actions
      if (blockUser) {
        // Block user implementation
        console.log('Blocking user:', userId);
      }
      
      if (unmatchUser) {
        // Unmatch user implementation
        console.log('Unmatching user:', userId);
      }
      
      if (hideProfile) {
        // Hide profile implementation
        console.log('Hiding profile:', userId);
      }

      Alert.alert(
        'Report Submitted',
        'Thank you for reporting this user. We will review your report and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );

    } catch (error) {
      console.error('Error submitting report:', error);
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (selectedReason || description || evidence.length > 0) {
      Alert.alert(
        'Discard Report?',
        'Are you sure you want to discard this report?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const renderReportReason = (reason: typeof reportReasons[0]) => (
    <TouchableOpacity
      key={reason.value}
      style={[
        styles.reasonOption,
        {
          backgroundColor: selectedReason === reason.value ? theme.colors.primaryLight : theme.colors.surface,
          borderColor: selectedReason === reason.value ? theme.colors.primary : 'transparent',
        },
      ]}
      onPress={() => setSelectedReason(reason.value)}
    >
      <View style={styles.reasonContent}>
        <View style={styles.reasonIcon}>
          <Icon 
            name={reason.icon} 
            size={24} 
            color={selectedReason === reason.value ? theme.colors.primary : theme.colors.textSecondary} 
          />
        </View>
        <View style={styles.reasonText}>
          <Text style={[
            styles.reasonLabel,
            { 
              color: selectedReason === reason.value ? theme.colors.primary : theme.colors.text,
              fontWeight: selectedReason === reason.value ? '600' : 'normal',
            }
          ]}>
            {reason.label}
          </Text>
          <Text style={[styles.reasonDescription, { color: theme.colors.textSecondary }]}>
            {reason.description}
          </Text>
        </View>
        <View style={styles.radioButton}>
          <View style={[
            styles.radioOuter,
            { 
              borderColor: selectedReason === reason.value ? theme.colors.primary : theme.colors.textSecondary,
            }
          ]}>
            {selectedReason === reason.value && (
              <View style={[styles.radioInner, { backgroundColor: theme.colors.primary }]} />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEvidence = (item: ReportEvidence, index: number) => (
    <View key={index} style={[styles.evidenceItem, { backgroundColor: theme.colors.surface }]}>
      {item.type === 'screenshot' && item.uri && (
        <Image source={{ uri: item.uri }} style={styles.evidenceImage} />
      )}
      <View style={styles.evidenceInfo}>
        <Text style={[styles.evidenceType, { color: theme.colors.text }]}>
          {item.type === 'screenshot' ? 'Screenshot' : item.type}
        </Text>
        <Text style={[styles.evidenceTime, { color: theme.colors.textSecondary }]}>
          {item.timestamp.toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeEvidence}
        onPress={() => removeEvidence(index)}
      >
        <Icon name="close" size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Icon name="close" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          Report User
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* User Being Reported */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Reporting
          </Text>
          <View style={styles.userCard}>
            <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
            <Text style={[styles.userName, { color: theme.colors.text }]}>
              {userName}
            </Text>
          </View>
        </View>

        {/* Report Reason Selection */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Why are you reporting this user? *
          </Text>
          <View style={styles.reasonsList}>
            {reportReasons.map(renderReportReason)}
          </View>
        </View>

        {/* Custom Reason (if Other selected) */}
        {selectedReason === ReportReason.OTHER && (
          <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Please specify *
            </Text>
            <TextInput
              style={[
                styles.textInput,
                { 
                  backgroundColor: theme.colors.background,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                }
              ]}
              placeholder="Enter custom reason..."
              placeholderTextColor={theme.colors.textSecondary}
              value={customReason}
              onChangeText={setCustomReason}
              maxLength={100}
            />
          </View>
        )}

        {/* Evidence Collection */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Evidence (Optional)
          </Text>
          
          {/* Screenshot Attachment */}
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            onPress={handleImagePickerPress}
          >
            <Icon name="photo-camera" size={20} color={theme.colors.primary} />
            <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>
              Attach Screenshot
            </Text>
          </TouchableOpacity>

          {/* Problematic Messages */}
          {messageIds.length > 0 && (
            <View style={styles.evidenceSection}>
              <Text style={[styles.evidenceSectionTitle, { color: theme.colors.text }]}>
                Select problematic messages:
              </Text>
              {messageIds.map(messageId => (
                <TouchableOpacity
                  key={messageId}
                  style={[
                    styles.checkboxItem,
                    { backgroundColor: selectedMessages.includes(messageId) ? theme.colors.primaryLight : 'transparent' }
                  ]}
                  onPress={() => handleMessageSelection(messageId)}
                >
                  <Icon 
                    name={selectedMessages.includes(messageId) ? 'check-box' : 'check-box-outline-blank'} 
                    size={20} 
                    color={selectedMessages.includes(messageId) ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
                    Message {messageId.slice(-6)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Inappropriate Photos */}
          {photoIds.length > 0 && (
            <View style={styles.evidenceSection}>
              <Text style={[styles.evidenceSectionTitle, { color: theme.colors.text }]}>
                Select inappropriate photos:
              </Text>
              {photoIds.map(photoId => (
                <TouchableOpacity
                  key={photoId}
                  style={[
                    styles.checkboxItem,
                    { backgroundColor: selectedPhotos.includes(photoId) ? theme.colors.primaryLight : 'transparent' }
                  ]}
                  onPress={() => handlePhotoSelection(photoId)}
                >
                  <Icon 
                    name={selectedPhotos.includes(photoId) ? 'check-box' : 'check-box-outline-blank'} 
                    size={20} 
                    color={selectedPhotos.includes(photoId) ? theme.colors.primary : theme.colors.textSecondary} 
                  />
                  <Text style={[styles.checkboxText, { color: theme.colors.text }]}>
                    Photo {photoId.slice(-6)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Evidence List */}
          {evidence.length > 0 && (
            <View style={styles.evidenceList}>
              {evidence.map(renderEvidence)}
            </View>
          )}
        </View>

        {/* Additional Notes */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Additional details *
          </Text>
          <TextInput
            style={[
              styles.textArea,
              { 
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              }
            ]}
            placeholder="Please provide more details about the issue..."
            placeholderTextColor={theme.colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            maxLength={500}
            textAlignVertical="top"
          />
          <Text style={[styles.characterCount, { color: theme.colors.textSecondary }]}>
            {description.length}/500 characters
          </Text>
        </View>

        {/* Incident Timestamp */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            When did this happen?
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, { borderColor: theme.colors.border }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Icon name="event" size={20} color={theme.colors.textSecondary} />
            <Text style={[styles.dateText, { color: theme.colors.text }]}>
              {incidentDate.toLocaleDateString()} at {incidentDate.toLocaleTimeString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={incidentDate}
              mode="datetime"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setIncidentDate(selectedDate);
                }
              }}
            />
          )}
        </View>

        {/* Follow-up Actions */}
        <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            What would you like to do?
          </Text>
          
          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Block this user
              </Text>
              <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                They won't be able to message you or see your profile
              </Text>
            </View>
            <Switch
              value={blockUser}
              onValueChange={setBlockUser}
              trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primaryLight }}
              thumbColor={blockUser ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Unmatch
              </Text>
              <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                Remove this match from your matches list
              </Text>
            </View>
            <Switch
              value={unmatchUser}
              onValueChange={setUnmatchUser}
              trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primaryLight }}
              thumbColor={unmatchUser ? theme.colors.primary : '#f4f3f4'}
            />
          </View>

          <View style={styles.switchItem}>
            <View style={styles.switchInfo}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                Hide from search
              </Text>
              <Text style={[styles.switchDescription, { color: theme.colors.textSecondary }]}>
                This profile won't appear in your discovery
              </Text>
            </View>
            <Switch
              value={hideProfile}
              onValueChange={setHideProfile}
              trackColor={{ false: theme.colors.textSecondary, true: theme.colors.primaryLight }}
              thumbColor={hideProfile ? theme.colors.primary : '#f4f3f4'}
            />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.colors.textSecondary }]}
          onPress={handleCancel}
          disabled={isSubmitting}
        >
          <Text style={[styles.cancelButtonText, { color: theme.colors.textSecondary }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            { 
              backgroundColor: selectedReason && description ? theme.colors.error : theme.colors.textSecondary,
            }
          ]}
          onPress={handleSubmitReport}
          disabled={!selectedReason || !description || isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </Text>
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
  headerButton: {
    padding: 8,
    width: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userName: {
    fontSize: 18,
    fontWeight: '500',
  },
  reasonsList: {
    gap: 8,
  },
  reasonOption: {
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
  },
  reasonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reasonIcon: {
    width: 32,
    alignItems: 'center',
  },
  reasonText: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  reasonDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  radioButton: {
    alignItems: 'center',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  evidenceSection: {
    marginBottom: 16,
  },
  evidenceSectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 8,
  },
  checkboxText: {
    fontSize: 14,
  },
  evidenceList: {
    gap: 8,
  },
  evidenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  evidenceImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  evidenceInfo: {
    flex: 1,
  },
  evidenceType: {
    fontSize: 14,
    fontWeight: '500',
  },
  evidenceTime: {
    fontSize: 12,
    marginTop: 2,
  },
  removeEvidence: {
    padding: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    gap: 8,
  },
  dateText: {
    fontSize: 16,
  },
  switchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 16,
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ReportUserScreen;