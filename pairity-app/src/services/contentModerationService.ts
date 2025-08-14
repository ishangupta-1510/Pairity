import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { FlaggedContent, ContentModerationRule } from '@/types/reporting';

export interface ModerationResult {
  isApproved: boolean;
  confidence: number;
  flags: string[];
  reason?: string;
  requiresHumanReview: boolean;
}

export interface PhotoAnalysis {
  hasNudity: boolean;
  hasFace: boolean;
  hasWeapon: boolean;
  hasText: boolean;
  textContent?: string;
  confidence: number;
  flags: string[];
}

export interface MessageAnalysis {
  hasProfanity: boolean;
  isSpam: boolean;
  hasPhoneNumber: boolean;
  hasLink: boolean;
  isHarassment: boolean;
  sentiment: 'positive' | 'neutral' | 'negative';
  confidence: number;
  flags: string[];
}

class ContentModerationService {
  private profanityWords: string[] = [
    // Basic profanity filter - in production, use a comprehensive list
    'damn', 'hell', 'stupid', 'idiot', 'hate', 'kill', 'die', 'ugly',
    // Add more words as needed
  ];

  private spamPatterns: RegExp[] = [
    /click here/i,
    /free money/i,
    /make \$\d+/i,
    /visit my website/i,
    /send me money/i,
    /wire transfer/i,
    /western union/i,
    /bitcoin/i,
    /cryptocurrency/i,
  ];

  private phonePatterns: RegExp[] = [
    /\b\d{3}-\d{3}-\d{4}\b/, // XXX-XXX-XXXX
    /\b\(\d{3}\)\s?\d{3}-\d{4}\b/, // (XXX) XXX-XXXX
    /\b\d{10}\b/, // XXXXXXXXXX
    /\+\d{1,3}\s?\d{3,4}\s?\d{3,4}\s?\d{3,4}/, // International
  ];

  private linkPatterns: RegExp[] = [
    /https?:\/\/[^\s]+/i,
    /www\.[^\s]+/i,
    /[^\s]+\.(com|net|org|edu|gov|co|io|me)/i,
  ];

  private harassmentPatterns: RegExp[] = [
    /you\s+(are|r)\s+(ugly|fat|stupid|worthless)/i,
    /(kill\s+your?self|kys)/i,
    /(nobody\s+likes?\s+you)/i,
    /(go\s+die)/i,
    /(waste\s+of\s+space)/i,
  ];

  /**
   * Moderate photo content using AI-powered analysis
   */
  async moderatePhoto(photoUri: string): Promise<ModerationResult> {
    try {
      // In a real implementation, this would use TensorFlow Lite or cloud AI services
      const analysis = await this.analyzePhoto(photoUri);
      
      const flags: string[] = [];
      let requiresHumanReview = false;
      
      if (analysis.hasNudity && analysis.confidence > 0.8) {
        flags.push('nudity_detected');
        requiresHumanReview = true;
      }
      
      if (!analysis.hasFace && analysis.confidence > 0.9) {
        flags.push('no_face_detected');
      }
      
      if (analysis.hasWeapon && analysis.confidence > 0.7) {
        flags.push('weapon_detected');
        requiresHumanReview = true;
      }
      
      if (analysis.hasText) {
        flags.push('text_in_image');
        if (analysis.textContent) {
          const textModeration = await this.moderateMessage(analysis.textContent);
          if (!textModeration.isApproved) {
            flags.push(...textModeration.flags);
            requiresHumanReview = true;
          }
        }
      }

      const isApproved = flags.length === 0 || (flags.length === 1 && flags[0] === 'no_face_detected');
      
      return {
        isApproved,
        confidence: analysis.confidence,
        flags,
        requiresHumanReview,
        reason: flags.length > 0 ? flags.join(', ') : undefined,
      };
    } catch (error) {
      console.error('Photo moderation error:', error);
      return {
        isApproved: false,
        confidence: 0,
        flags: ['moderation_error'],
        requiresHumanReview: true,
        reason: 'Moderation service error',
      };
    }
  }

  /**
   * Moderate message content
   */
  async moderateMessage(message: string): Promise<ModerationResult> {
    try {
      const analysis = await this.analyzeMessage(message);
      
      const flags: string[] = [];
      let requiresHumanReview = false;
      
      if (analysis.hasProfanity) {
        flags.push('profanity_detected');
      }
      
      if (analysis.isSpam) {
        flags.push('spam_detected');
        requiresHumanReview = true;
      }
      
      if (analysis.hasPhoneNumber) {
        flags.push('phone_number_detected');
      }
      
      if (analysis.hasLink) {
        flags.push('link_detected');
      }
      
      if (analysis.isHarassment) {
        flags.push('harassment_detected');
        requiresHumanReview = true;
      }
      
      if (analysis.sentiment === 'negative' && analysis.confidence > 0.8) {
        flags.push('negative_sentiment');
      }

      const isApproved = flags.length === 0 || 
        (flags.length === 1 && ['phone_number_detected', 'link_detected'].includes(flags[0]));
      
      return {
        isApproved,
        confidence: analysis.confidence,
        flags,
        requiresHumanReview,
        reason: flags.length > 0 ? flags.join(', ') : undefined,
      };
    } catch (error) {
      console.error('Message moderation error:', error);
      return {
        isApproved: false,
        confidence: 0,
        flags: ['moderation_error'],
        requiresHumanReview: true,
        reason: 'Moderation service error',
      };
    }
  }

  /**
   * Moderate bio/profile content
   */
  async moderateBio(bio: string): Promise<ModerationResult> {
    try {
      // Bio moderation is similar to message moderation but with different thresholds
      const messageAnalysis = await this.analyzeMessage(bio);
      
      const flags: string[] = [];
      let requiresHumanReview = false;
      
      if (messageAnalysis.hasProfanity) {
        flags.push('inappropriate_language');
      }
      
      if (messageAnalysis.isSpam) {
        flags.push('promotional_content');
        requiresHumanReview = true;
      }
      
      if (messageAnalysis.hasPhoneNumber || messageAnalysis.hasLink) {
        flags.push('contact_info_detected');
      }
      
      // Check for age indicators
      if (this.containsAgeBelow18(bio)) {
        flags.push('underage_indicator');
        requiresHumanReview = true;
      }
      
      // Check bio length
      if (bio.length < 10) {
        flags.push('insufficient_bio');
      }

      const isApproved = flags.length === 0 || 
        (flags.length === 1 && ['contact_info_detected', 'insufficient_bio'].includes(flags[0]));
      
      return {
        isApproved,
        confidence: messageAnalysis.confidence,
        flags,
        requiresHumanReview,
        reason: flags.length > 0 ? flags.join(', ') : undefined,
      };
    } catch (error) {
      console.error('Bio moderation error:', error);
      return {
        isApproved: false,
        confidence: 0,
        flags: ['moderation_error'],
        requiresHumanReview: true,
        reason: 'Moderation service error',
      };
    }
  }

  /**
   * Analyze photo using mock AI (in production, use TensorFlow Lite or cloud service)
   */
  private async analyzePhoto(photoUri: string): Promise<PhotoAnalysis> {
    // Mock analysis - in production, implement actual AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing time
    
    // Mock results based on filename or random generation
    const filename = photoUri.toLowerCase();
    
    return {
      hasNudity: filename.includes('nude') || Math.random() > 0.95,
      hasFace: !filename.includes('noface') && Math.random() > 0.1,
      hasWeapon: filename.includes('weapon') || Math.random() > 0.98,
      hasText: filename.includes('text') || Math.random() > 0.8,
      textContent: filename.includes('text') ? 'Sample text extracted from image' : undefined,
      confidence: 0.8 + Math.random() * 0.2, // 80-100%
      flags: [],
    };
  }

  /**
   * Analyze message content
   */
  private async analyzeMessage(message: string): Promise<MessageAnalysis> {
    const lowerMessage = message.toLowerCase();
    
    // Profanity detection
    const hasProfanity = this.profanityWords.some(word => 
      lowerMessage.includes(word.toLowerCase())
    );
    
    // Spam detection
    const isSpam = this.spamPatterns.some(pattern => pattern.test(message));
    
    // Phone number detection
    const hasPhoneNumber = this.phonePatterns.some(pattern => pattern.test(message));
    
    // Link detection
    const hasLink = this.linkPatterns.some(pattern => pattern.test(message));
    
    // Harassment detection
    const isHarassment = this.harassmentPatterns.some(pattern => pattern.test(message));
    
    // Sentiment analysis (simplified)
    const sentiment = this.analyzeSentiment(message);
    
    const flags: string[] = [];
    if (hasProfanity) flags.push('profanity');
    if (isSpam) flags.push('spam');
    if (hasPhoneNumber) flags.push('phone_number');
    if (hasLink) flags.push('link');
    if (isHarassment) flags.push('harassment');
    
    return {
      hasProfanity,
      isSpam,
      hasPhoneNumber,
      hasLink,
      isHarassment,
      sentiment,
      confidence: 0.7 + Math.random() * 0.3, // 70-100%
      flags,
    };
  }

  /**
   * Simple sentiment analysis
   */
  private analyzeSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['love', 'great', 'awesome', 'amazing', 'wonderful', 'fantastic', 'good', 'nice', 'happy', 'beautiful'];
    const negativeWords = ['hate', 'terrible', 'awful', 'horrible', 'bad', 'ugly', 'stupid', 'annoying', 'sad', 'angry'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Check if bio contains indicators of being under 18
   */
  private containsAgeBelow18(bio: string): boolean {
    const agePatterns = [
      /\b(1[0-7]|[1-9])\s*(years?\s*old|yo|y\.o\.)\b/i,
      /\bi'?m\s*(1[0-7]|[1-9])\b/i,
      /\bborn\s*in\s*(200[6-9]|201[0-9]|202[0-9])\b/i, // Born after 2006
      /\bhigh\s*school\s*(student|senior|junior|sophomore|freshman)\b/i,
      /\b(teen|teenager|minor)\b/i,
    ];
    
    return agePatterns.some(pattern => pattern.test(bio));
  }

  /**
   * Flag content for review
   */
  async flagContent(
    contentType: 'photo' | 'message' | 'bio',
    contentId: string,
    userId: string,
    moderationResult: ModerationResult
  ): Promise<FlaggedContent> {
    const flaggedContent: FlaggedContent = {
      id: `flagged_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contentType,
      contentId,
      userId,
      flagReason: moderationResult.reason || 'Automated flagging',
      confidence: moderationResult.confidence,
      aiFlags: moderationResult.flags,
      humanReviewRequired: moderationResult.requiresHumanReview,
      status: 'pending',
      createdAt: new Date(),
    };

    // Store flagged content
    try {
      const existingFlagged = await AsyncStorage.getItem('flaggedContent');
      const flaggedList: FlaggedContent[] = existingFlagged ? JSON.parse(existingFlagged) : [];
      flaggedList.push(flaggedContent);
      await AsyncStorage.setItem('flaggedContent', JSON.stringify(flaggedList));
    } catch (error) {
      console.error('Error storing flagged content:', error);
    }

    return flaggedContent;
  }

  /**
   * Get flagged content for moderation queue
   */
  async getFlaggedContent(): Promise<FlaggedContent[]> {
    try {
      const stored = await AsyncStorage.getItem('flaggedContent');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading flagged content:', error);
      return [];
    }
  }

  /**
   * Update flagged content status
   */
  async updateFlaggedContentStatus(
    contentId: string,
    status: 'approved' | 'rejected' | 'removed',
    reviewerId: string,
    notes?: string
  ): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('flaggedContent');
      const flaggedList: FlaggedContent[] = stored ? JSON.parse(stored) : [];
      
      const index = flaggedList.findIndex(item => item.id === contentId);
      if (index !== -1) {
        flaggedList[index] = {
          ...flaggedList[index],
          status,
          reviewedAt: new Date(),
          reviewerId,
        };
        
        await AsyncStorage.setItem('flaggedContent', JSON.stringify(flaggedList));
      }
    } catch (error) {
      console.error('Error updating flagged content:', error);
    }
  }

  /**
   * Get moderation rules
   */
  async getModerationRules(): Promise<ContentModerationRule[]> {
    try {
      const stored = await AsyncStorage.getItem('moderationRules');
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Return default rules if none stored
      return this.getDefaultModerationRules();
    } catch (error) {
      console.error('Error loading moderation rules:', error);
      return this.getDefaultModerationRules();
    }
  }

  /**
   * Update moderation rules
   */
  async updateModerationRules(rules: ContentModerationRule[]): Promise<void> {
    try {
      await AsyncStorage.setItem('moderationRules', JSON.stringify(rules));
    } catch (error) {
      console.error('Error updating moderation rules:', error);
    }
  }

  /**
   * Get default moderation rules
   */
  private getDefaultModerationRules(): ContentModerationRule[] {
    return [
      {
        id: 'nudity_detection',
        name: 'Nudity Detection',
        type: 'photo',
        enabled: true,
        confidence: 0.8,
        action: 'block',
        aiModel: 'nudity_classifier',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'face_requirement',
        name: 'Face Detection Required',
        type: 'photo',
        enabled: true,
        confidence: 0.9,
        action: 'flag',
        aiModel: 'face_detector',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'profanity_filter',
        name: 'Profanity Filter',
        type: 'message',
        enabled: true,
        confidence: 0.7,
        action: 'flag',
        pattern: this.profanityWords.join('|'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'spam_detection',
        name: 'Spam Detection',
        type: 'message',
        enabled: true,
        confidence: 0.8,
        action: 'block',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'harassment_detection',
        name: 'Harassment Detection',
        type: 'message',
        enabled: true,
        confidence: 0.9,
        action: 'review',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'contact_info_filter',
        name: 'Contact Information Filter',
        type: 'bio',
        enabled: true,
        confidence: 0.8,
        action: 'flag',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Batch moderate content
   */
  async moderateBatch(
    items: Array<{
      type: 'photo' | 'message' | 'bio';
      content: string;
      id: string;
      userId: string;
    }>
  ): Promise<Array<{ id: string; result: ModerationResult }>> {
    const results = [];
    
    for (const item of items) {
      let result: ModerationResult;
      
      switch (item.type) {
        case 'photo':
          result = await this.moderatePhoto(item.content);
          break;
        case 'message':
          result = await this.moderateMessage(item.content);
          break;
        case 'bio':
          result = await this.moderateBio(item.content);
          break;
        default:
          result = {
            isApproved: false,
            confidence: 0,
            flags: ['unknown_type'],
            requiresHumanReview: true,
            reason: 'Unknown content type',
          };
      }
      
      results.push({ id: item.id, result });
      
      // Flag content if not approved
      if (!result.isApproved) {
        await this.flagContent(item.type, item.id, item.userId, result);
      }
    }
    
    return results;
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(): Promise<{
    totalFlagged: number;
    pendingReview: number;
    approved: number;
    rejected: number;
    flagsByType: Record<string, number>;
  }> {
    try {
      const flaggedContent = await this.getFlaggedContent();
      
      const stats = {
        totalFlagged: flaggedContent.length,
        pendingReview: flaggedContent.filter(item => item.status === 'pending').length,
        approved: flaggedContent.filter(item => item.status === 'approved').length,
        rejected: flaggedContent.filter(item => item.status === 'rejected').length,
        flagsByType: {} as Record<string, number>,
      };
      
      // Count flags by type
      flaggedContent.forEach(item => {
        item.aiFlags.forEach(flag => {
          stats.flagsByType[flag] = (stats.flagsByType[flag] || 0) + 1;
        });
      });
      
      return stats;
    } catch (error) {
      console.error('Error getting moderation stats:', error);
      return {
        totalFlagged: 0,
        pendingReview: 0,
        approved: 0,
        rejected: 0,
        flagsByType: {},
      };
    }
  }
}

export const contentModerationService = new ContentModerationService();