// Reporting System Types

export enum ReportReason {
  FAKE_PROFILE = 'fake_profile',
  INAPPROPRIATE_PHOTOS = 'inappropriate_photos',
  HARASSMENT = 'harassment',
  SPAM = 'spam',
  UNDERAGE = 'underage',
  OFFENSIVE_LANGUAGE = 'offensive_language',
  THREATENING_BEHAVIOR = 'threatening_behavior',
  OFF_PLATFORM_BEHAVIOR = 'off_platform_behavior',
  OTHER = 'other',
}

export enum ReportStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
  ESCALATED = 'escalated',
}

export enum ReportPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ModerationAction {
  WARNING = 'warning',
  TEMPORARY_SUSPENSION = 'temporary_suspension',
  PERMANENT_BAN = 'permanent_ban',
  IP_BAN = 'ip_ban',
  DEVICE_BAN = 'device_ban',
  PHOTO_REMOVAL = 'photo_removal',
  BIO_EDIT = 'bio_edit',
  MESSAGE_DELETION = 'message_deletion',
  NO_ACTION = 'no_action',
}

export enum VerificationStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  REJECTED = 'rejected',
}

export enum VerificationType {
  PHOTO = 'photo',
  ID = 'id',
  SOCIAL_INSTAGRAM = 'social_instagram',
  SOCIAL_FACEBOOK = 'social_facebook',
  SOCIAL_LINKEDIN = 'social_linkedin',
  SOCIAL_TWITTER = 'social_twitter',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
  UNDER_REVIEW = 'under_review',
  APPEALING = 'appealing',
}

export interface ReportEvidence {
  type: 'screenshot' | 'message' | 'photo';
  uri?: string;
  messageId?: string;
  photoId?: string;
  description?: string;
  timestamp: Date;
}

export interface Report {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  customReason?: string;
  description: string;
  evidence: ReportEvidence[];
  incidentTimestamp?: Date;
  
  // Actions taken by reporter
  blockedUser: boolean;
  unmatchedUser: boolean;
  hidProfile: boolean;
  
  // Report metadata
  status: ReportStatus;
  priority: ReportPriority;
  createdAt: Date;
  updatedAt: Date;
  
  // Moderation details
  assignedModeratorId?: string;
  reviewedAt?: Date;
  moderationAction?: ModerationAction;
  moderatorNotes?: string;
  resolutionNotes?: string;
}

export interface BlockedUser {
  id: string;
  userId: string;
  blockedUserId: string;
  reason?: string;
  notes?: string;
  createdAt: Date;
  reportId?: string;
}

export interface SafetyTip {
  id: string;
  title: string;
  description: string;
  category: 'general' | 'dating' | 'video_call' | 'meeting' | 'emergency';
  icon: string;
  priority: number;
  isExpanded?: boolean;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  relationship: string;
  isEmergencyContact: boolean;
  canShareLocation: boolean;
  createdAt: Date;
}

export interface SafetyCheckIn {
  id: string;
  userId: string;
  dateId?: string;
  scheduledTime: Date;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  emergencyContacts: string[];
  status: 'scheduled' | 'completed' | 'missed' | 'emergency';
  completedAt?: Date;
  notes?: string;
}

export interface UserVerification {
  id: string;
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  submittedAt: Date;
  reviewedAt?: Date;
  verifiedAt?: Date;
  
  // Photo verification specific
  selfieUri?: string;
  gestureRequired?: string;
  faceMatchScore?: number;
  
  // ID verification specific
  documentType?: string;
  documentUri?: string;
  extractedData?: {
    name: string;
    dateOfBirth: string;
    documentNumber: string;
  };
  
  // Social verification specific
  socialPlatform?: string;
  socialUserId?: string;
  socialUsername?: string;
  
  // Review details
  reviewerId?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface ModerationQueue {
  reports: Report[];
  verifications: UserVerification[];
  appeals: Appeal[];
  flaggedContent: FlaggedContent[];
}

export interface FlaggedContent {
  id: string;
  contentType: 'photo' | 'message' | 'bio';
  contentId: string;
  userId: string;
  flagReason: string;
  confidence: number;
  aiFlags: string[];
  humanReviewRequired: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'removed';
  createdAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
}

export interface Appeal {
  id: string;
  userId: string;
  originalReportId?: string;
  banReason: string;
  appealReason: string;
  statement: string;
  evidence: ReportEvidence[];
  status: 'pending' | 'under_review' | 'approved' | 'denied';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  resolution?: string;
  resolutionNotes?: string;
}

export interface UserTrustScore {
  userId: string;
  score: number; // 0-100
  factors: {
    reportCount: number;
    verificationLevel: number;
    accountAge: number;
    engagementPattern: number;
    responseRate: number;
  };
  restrictions: {
    limitedSwipes: boolean;
    limitedMessages: boolean;
    shadowBanned: boolean;
    requiresReview: boolean;
  };
  lastUpdated: Date;
}

export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetUserId: string;
  action: ModerationAction;
  reason: string;
  duration?: number; // in days for temporary actions
  evidence?: string[];
  notes?: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface AuditLog {
  id: string;
  userId?: string;
  moderatorId?: string;
  action: string;
  target: string;
  targetId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
}

export interface ContentModerationRule {
  id: string;
  name: string;
  type: 'photo' | 'message' | 'bio';
  enabled: boolean;
  confidence: number;
  action: 'flag' | 'block' | 'review';
  pattern?: string;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportAnalytics {
  totalReports: number;
  reportsByReason: Record<ReportReason, number>;
  reportsByStatus: Record<ReportStatus, number>;
  averageResponseTime: number;
  falsePositiveRate: number;
  repeatOffenders: number;
  geographicPatterns: {
    region: string;
    count: number;
  }[];
  trendsOverTime: {
    date: string;
    count: number;
  }[];
}