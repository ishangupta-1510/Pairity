import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '@/components/ThemeProvider';
import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { UserVerification, VerificationType, VerificationStatus } from '@/types/reporting';

const UserVerificationScreen: React.FC = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const cameraRef = useRef<Camera>(null);
  
  const [activeSection, setActiveSection] = useState<'overview' | 'photo' | 'id' | 'social'>('overview');
  const [verifications, setVerifications] = useState<UserVerification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Photo verification state
  const [photoVerificationStep, setPhotoVerificationStep] = useState<'instructions' | 'camera' | 'processing'>('instructions');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [requiredGesture, setRequiredGesture] = useState<string>('peace_sign');
  
  // ID verification state
  const [idVerificationStep, setIdVerificationStep] = useState<'instructions' | 'upload' | 'processing'>('instructions');
  const [uploadedDocument, setUploadedDocument] = useState<string | null>(null);
  
  const gestures = [
    { key: 'peace_sign', label: 'Peace Sign ✌️', description: 'Hold up two fingers in a peace sign' },
    { key: 'thumbs_up', label: 'Thumbs Up 👍', description: 'Give a thumbs up gesture' },
    { key: 'pointing', label: 'Point at Camera 👉', description: 'Point directly at the camera' },
    { key: 'wave', label: 'Wave Hello 👋', description: 'Wave at the camera' },
  ];

  const socialPlatforms = [
    {
      type: VerificationType.SOCIAL_INSTAGRAM,
      name: 'Instagram',
      icon: 'photo-camera',
      color: '#E4405F',
      description: 'Connect your Instagram account for verification',
      connected: false,
    },
    {
      type: VerificationType.SOCIAL_FACEBOOK,
      name: 'Facebook',
      icon: 'facebook',
      color: '#1877F2',
      description: 'Verify through your Facebook profile',
      connected: false,
    },
    {
      type: VerificationType.SOCIAL_LINKEDIN,
      name: 'LinkedIn',
      icon: 'business',
      color: '#0A66C2',
      description: 'Professional verification through LinkedIn',
      connected: false,
    },
    {
      type: VerificationType.SOCIAL_TWITTER,
      name: 'Twitter/X',
      icon: 'alternate-email',
      color: '#000000',
      description: 'Verify through your Twitter/X account',
      connected: false,
    },
  ];

  const startPhotoVerification = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera permission is required for photo verification.');
      return;
    }

    // Randomly select a gesture
    const randomGesture = gestures[Math.floor(Math.random() * gestures.length)];
    setRequiredGesture(randomGesture.key);
    setPhotoVerificationStep('camera');
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
        exif: false,
      });

      setCapturedPhoto(photo.uri);
      setPhotoVerificationStep('processing');
      
      // Simulate AI processing
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock verification result
      const faceMatchScore = 0.85 + Math.random() * 0.1; // 85-95%
      
      const verification: UserVerification = {
        id: `photo_verification_${Date.now()}`,
        userId: 'current-user-id', // Replace with actual user ID
        type: VerificationType.PHOTO,
        status: faceMatchScore > 0.8 ? VerificationStatus.VERIFIED : VerificationStatus.FAILED,
        submittedAt: new Date(),
        verifiedAt: faceMatchScore > 0.8 ? new Date() : undefined,
        selfieUri: photo.uri,
        gestureRequired: requiredGesture,
        faceMatchScore,
        reviewerId: 'ai_system',
      };

      setVerifications([...verifications, verification]);
      setIsLoading(false);
      
      if (faceMatchScore > 0.8) {
        Alert.alert(
          'Verification Successful! ✅',
          `Your photo has been verified with ${(faceMatchScore * 100).toFixed(0)}% confidence. You now have a verified badge!`,
          [{ text: 'Great!', onPress: () => setActiveSection('overview') }]
        );
      } else {
        Alert.alert(
          'Verification Failed',
          'We couldn\'t verify your photo. Please try again with better lighting and make sure your face is clearly visible.',
          [{ text: 'Try Again', onPress: () => setPhotoVerificationStep('instructions') }]
        );
      }
    } catch (error) {
      console.error('Photo capture error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const startIdVerification = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'image/*',
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setUploadedDocument(result.uri);
        setIdVerificationStep('processing');
        setIsLoading(true);
        
        // Simulate OCR processing
        await new Promise(resolve => setTimeout(resolve, 4000));
        
        // Mock ID verification result
        const extractedData = {
          name: 'John Doe',
          dateOfBirth: '1990-05-15',
          documentNumber: 'D123456789',
        };
        
        const verification: UserVerification = {
          id: `id_verification_${Date.now()}`,
          userId: 'current-user-id',
          type: VerificationType.ID,
          status: VerificationStatus.PENDING,
          submittedAt: new Date(),
          documentType: 'Driver License',
          documentUri: result.uri,
          extractedData,
          notes: 'Submitted for manual review',
        };

        setVerifications([...verifications, verification]);
        setIsLoading(false);
        
        Alert.alert(
          'ID Submitted for Review',
          'Your ID has been submitted for verification. We\'ll review it within 24-48 hours and notify you of the result.',
          [{ text: 'OK', onPress: () => setActiveSection('overview') }]
        );
      }
    } catch (error) {
      console.error('Document picker error:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    }
  };

  const connectSocialAccount = (platform: typeof socialPlatforms[0]) => {
    Alert.alert(
      `Connect ${platform.name}`,
      `You'll be redirected to ${platform.name} to authorize the connection.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Connect',
          onPress: async () => {
            setIsLoading(true);
            
            // Simulate OAuth flow
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const verification: UserVerification = {
              id: `social_verification_${Date.now()}`,
              userId: 'current-user-id',
              type: platform.type,
              status: VerificationStatus.VERIFIED,
              submittedAt: new Date(),
              verifiedAt: new Date(),
              socialPlatform: platform.name.toLowerCase(),
              socialUserId: `${platform.name.toLowerCase()}_user_123`,
              socialUsername: '@johndoe',
            };

            setVerifications([...verifications, verification]);
            setIsLoading(false);
            
            Alert.alert(
              'Connected Successfully!',
              `Your ${platform.name} account has been connected and verified.`
            );
          },
        },
      ]
    );
  };

  const getVerificationStatus = (type: VerificationType) => {
    const verification = verifications.find(v => v.type === type);
    return verification?.status || VerificationStatus.UNVERIFIED;
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED:
        return { name: 'verified', color: '#4CAF50' };
      case VerificationStatus.PENDING:
        return { name: 'schedule', color: '#FF9800' };
      case VerificationStatus.FAILED:
      case VerificationStatus.REJECTED:
        return { name: 'error', color: '#F44336' };
      default:
        return { name: 'radio-button-unchecked', color: theme.colors.textSecondary };
    }
  };

  const renderOverview = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.overviewCard, { backgroundColor: theme.colors.surface }]}>
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.accent]}
          style={styles.overviewHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Icon name="verified-user" size={32} color="white" />
          <Text style={styles.overviewTitle}>Get Verified</Text>
          <Text style={styles.overviewSubtitle}>
            Increase your matches by 40% with verification badges
          </Text>
        </LinearGradient>

        <View style={styles.verificationMethods}>
          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setActiveSection('photo')}
          >
            <View style={styles.methodHeader}>
              <Icon name="photo-camera" size={24} color={theme.colors.primary} />
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                  Photo Verification
                </Text>
                <Text style={[styles.methodDescription, { color: theme.colors.textSecondary }]}>
                  Take a selfie with a gesture
                </Text>
              </View>
              <Icon 
                {...getStatusIcon(getVerificationStatus(VerificationType.PHOTO))}
                size={20} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setActiveSection('id')}
          >
            <View style={styles.methodHeader}>
              <Icon name="badge" size={24} color={theme.colors.primary} />
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                  ID Verification
                </Text>
                <Text style={[styles.methodDescription, { color: theme.colors.textSecondary }]}>
                  Upload government ID (optional)
                </Text>
              </View>
              <Icon 
                {...getStatusIcon(getVerificationStatus(VerificationType.ID))}
                size={20} 
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.methodCard}
            onPress={() => setActiveSection('social')}
          >
            <View style={styles.methodHeader}>
              <Icon name="share" size={24} color={theme.colors.primary} />
              <View style={styles.methodInfo}>
                <Text style={[styles.methodTitle, { color: theme.colors.text }]}>
                  Social Verification
                </Text>
                <Text style={[styles.methodDescription, { color: theme.colors.textSecondary }]}>
                  Connect social media accounts
                </Text>
              </View>
              <View style={styles.socialBadges}>
                {socialPlatforms.slice(0, 2).map(platform => (
                  <Icon
                    key={platform.type}
                    {...getStatusIcon(getVerificationStatus(platform.type))}
                    size={16}
                  />
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.benefitsTitle, { color: theme.colors.text }]}>
          Verification Benefits
        </Text>
        <View style={styles.benefitsList}>
          {[
            'Get more matches with verified badge',
            'Build trust with other users',
            'Access to premium features',
            'Priority in search results',
            'Enhanced safety and security',
          ].map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Icon name="check-circle" size={16} color={theme.colors.accent} />
              <Text style={[styles.benefitText, { color: theme.colors.textSecondary }]}>
                {benefit}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  const renderPhotoVerification = () => {
    const currentGesture = gestures.find(g => g.key === requiredGesture);
    
    return (
      <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
        {photoVerificationStep === 'instructions' && (
          <View style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
            <Icon name="photo-camera" size={64} color={theme.colors.primary} />
            <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
              Photo Verification
            </Text>
            <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
              We'll ask you to take a selfie with a specific gesture to verify that your photos are really you.
            </Text>
            
            <View style={styles.requirementsList}>
              <Text style={[styles.requirementsTitle, { color: theme.colors.text }]}>
                Requirements:
              </Text>
              {[
                'Good lighting',
                'Face clearly visible',
                'No sunglasses or masks',
                'Make the requested gesture',
                'Look directly at camera',
              ].map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <Icon name="check" size={16} color={theme.colors.accent} />
                  <Text style={[styles.requirementText, { color: theme.colors.textSecondary }]}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              onPress={startPhotoVerification}
            >
              <Text style={styles.primaryButtonText}>Start Verification</Text>
            </TouchableOpacity>
          </View>
        )}

        {photoVerificationStep === 'camera' && (
          <View style={styles.cameraContainer}>
            <View style={[styles.gestureInstruction, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.gestureText, { color: theme.colors.text }]}>
                Please make this gesture: {currentGesture?.label}
              </Text>
              <Text style={[styles.gestureDescription, { color: theme.colors.textSecondary }]}>
                {currentGesture?.description}
              </Text>
            </View>

            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={Camera.Constants.Type.front}
              autoFocus={Camera.Constants.AutoFocus.on}
            >
              <View style={styles.cameraOverlay}>
                <View style={styles.faceOutline} />
              </View>
            </Camera>

            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={[styles.captureButton, { borderColor: theme.colors.primary }]}
                onPress={capturePhoto}
                disabled={isLoading}
              >
                <View style={[styles.captureInner, { backgroundColor: theme.colors.primary }]} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {photoVerificationStep === 'processing' && (
          <View style={[styles.processingCard, { backgroundColor: theme.colors.surface }]}>
            {capturedPhoto && (
              <Image source={{ uri: capturedPhoto }} style={styles.capturedImage} />
            )}
            
            {isLoading ? (
              <>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
                  Processing Your Photo...
                </Text>
                <Text style={[styles.processingText, { color: theme.colors.textSecondary }]}>
                  Our AI is comparing your selfie with your profile photos
                </Text>
              </>
            ) : (
              <Text style={[styles.processingComplete, { color: theme.colors.accent }]}>
                Processing Complete!
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderIdVerification = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      {idVerificationStep === 'instructions' && (
        <View style={[styles.instructionsCard, { backgroundColor: theme.colors.surface }]}>
          <Icon name="badge" size={64} color={theme.colors.primary} />
          <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
            ID Verification (Optional)
          </Text>
          <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
            Upload a government-issued ID to get additional verification. This helps build trust with other users.
          </Text>
          
          <View style={styles.acceptedIds}>
            <Text style={[styles.acceptedTitle, { color: theme.colors.text }]}>
              Accepted Documents:
            </Text>
            {[
              'Driver\'s License',
              'Passport',
              'National ID Card',
              'State ID Card',
            ].map((doc, index) => (
              <View key={index} style={styles.acceptedItem}>
                <Icon name="description" size={16} color={theme.colors.accent} />
                <Text style={[styles.acceptedText, { color: theme.colors.textSecondary }]}>
                  {doc}
                </Text>
              </View>
            ))}
          </View>

          <View style={[styles.securityNote, { backgroundColor: theme.colors.background }]}>
            <Icon name="security" size={20} color={theme.colors.accent} />
            <Text style={[styles.securityText, { color: theme.colors.textSecondary }]}>
              Your documents are encrypted and securely stored. We only use them for verification purposes.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={startIdVerification}
          >
            <Text style={styles.primaryButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>
      )}

      {idVerificationStep === 'processing' && (
        <View style={[styles.processingCard, { backgroundColor: theme.colors.surface }]}>
          {uploadedDocument && (
            <Image source={{ uri: uploadedDocument }} style={styles.uploadedDocument} />
          )}
          
          {isLoading ? (
            <>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={[styles.processingTitle, { color: theme.colors.text }]}>
                Processing Your Document...
              </Text>
              <Text style={[styles.processingText, { color: theme.colors.textSecondary }]}>
                Extracting information and verifying authenticity
              </Text>
            </>
          ) : (
            <Text style={[styles.processingComplete, { color: theme.colors.accent }]}>
              Document Uploaded Successfully!
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderSocialVerification = () => (
    <ScrollView style={styles.sectionContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.socialCard, { backgroundColor: theme.colors.surface }]}>
        <Icon name="share" size={64} color={theme.colors.primary} />
        <Text style={[styles.instructionsTitle, { color: theme.colors.text }]}>
          Social Verification
        </Text>
        <Text style={[styles.instructionsText, { color: theme.colors.textSecondary }]}>
          Connect your social media accounts to add credibility to your profile.
        </Text>

        <View style={styles.socialPlatforms}>
          {socialPlatforms.map(platform => {
            const status = getVerificationStatus(platform.type);
            const statusIcon = getStatusIcon(status);
            
            return (
              <TouchableOpacity
                key={platform.type}
                style={[
                  styles.platformCard,
                  { 
                    backgroundColor: theme.colors.background,
                    borderColor: status === VerificationStatus.VERIFIED ? platform.color : 'transparent',
                  }
                ]}
                onPress={() => connectSocialAccount(platform)}
                disabled={status === VerificationStatus.VERIFIED}
              >
                <Icon name={platform.icon} size={24} color={platform.color} />
                <View style={styles.platformInfo}>
                  <Text style={[styles.platformName, { color: theme.colors.text }]}>
                    {platform.name}
                  </Text>
                  <Text style={[styles.platformDescription, { color: theme.colors.textSecondary }]}>
                    {platform.description}
                  </Text>
                </View>
                <Icon name={statusIcon.name} size={20} color={statusIcon.color} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );

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
          Verification
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Navigation */}
      {activeSection !== 'overview' && (
        <View style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={styles.backTab}
            onPress={() => setActiveSection('overview')}
          >
            <Icon name="arrow-back" size={16} color={theme.colors.primary} />
            <Text style={[styles.backTabText, { color: theme.colors.primary }]}>
              Back to Overview
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'photo' && renderPhotoVerification()}
        {activeSection === 'id' && renderIdVerification()}
        {activeSection === 'social' && renderSocialVerification()}
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={[styles.loadingContent, { backgroundColor: theme.colors.surface }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Processing...
            </Text>
          </View>
        </View>
      )}
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
  tabContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    flex: 1,
    padding: 16,
  },
  overviewCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  overviewHeader: {
    padding: 24,
    alignItems: 'center',
  },
  overviewTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 12,
    marginBottom: 8,
  },
  overviewSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  verificationMethods: {
    padding: 16,
  },
  methodCard: {
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  methodDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  socialBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  benefitsCard: {
    padding: 16,
    borderRadius: 16,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  benefitsList: {
    gap: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benefitText: {
    fontSize: 14,
    flex: 1,
  },
  instructionsCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  requirementsList: {
    alignSelf: 'stretch',
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 14,
  },
  acceptedIds: {
    alignSelf: 'stretch',
    marginBottom: 16,
  },
  acceptedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  acceptedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  acceptedText: {
    fontSize: 14,
  },
  securityNote: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 24,
  },
  securityText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  primaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    flex: 1,
  },
  gestureInstruction: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  gestureText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  gestureDescription: {
    fontSize: 14,
    textAlign: 'center',
  },
  camera: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceOutline: {
    width: 200,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 100,
    borderStyle: 'dashed',
  },
  cameraControls: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  processingCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  capturedImage: {
    width: 200,
    height: 250,
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadedDocument: {
    width: 250,
    height: 200,
    borderRadius: 12,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  processingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  processingText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 18,
  },
  processingComplete: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  socialCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  socialPlatforms: {
    alignSelf: 'stretch',
    gap: 12,
  },
  platformCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  platformInfo: {
    flex: 1,
  },
  platformName: {
    fontSize: 16,
    fontWeight: '500',
  },
  platformDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
});

export default UserVerificationScreen;