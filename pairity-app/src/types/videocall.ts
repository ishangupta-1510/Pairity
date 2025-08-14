export interface VideoCallState {
  isInCall: boolean;
  callType: 'incoming' | 'outgoing' | 'scheduled' | null;
  callStatus: CallStatus;
  participants: CallParticipant[];
  localStream?: any; // MediaStream
  remoteStream?: any; // MediaStream
  callDuration: number;
  startTime?: Date;
  endTime?: Date;
  callId: string;
  roomId: string;
  settings: CallSettings;
  quality: NetworkQuality;
}

export enum CallStatus {
  IDLE = 'idle',
  CONNECTING = 'connecting',
  RINGING = 'ringing',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  RECONNECTING = 'reconnecting',
  ENDED = 'ended',
  FAILED = 'failed',
  DECLINED = 'declined',
  MISSED = 'missed',
}

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  isLocal: boolean;
  isMuted: boolean;
  isVideoEnabled: boolean;
  connectionQuality: 'poor' | 'good' | 'excellent';
  joinedAt: Date;
}

export interface CallSettings {
  video: {
    enabled: boolean;
    quality: VideoQuality;
    facingMode: 'front' | 'back';
    backgroundBlur: boolean;
    virtualBackground?: string;
    beautyFilter: boolean;
    filters: string[];
  };
  audio: {
    enabled: boolean;
    speakerMode: boolean;
    noiseSupression: boolean;
    echoCancellation: boolean;
    autoGainControl: boolean;
  };
  screen: {
    recording: boolean;
    sharing: boolean;
    recordingConsent: boolean;
  };
  chat: {
    enabled: boolean;
    visible: boolean;
  };
}

export enum VideoQuality {
  LOW = 'low', // 240p
  STANDARD = 'standard', // 360p
  HIGH = 'high', // 720p
  HD = 'hd', // 1080p
}

export interface NetworkQuality {
  level: 'poor' | 'fair' | 'good' | 'excellent';
  bandwidth: number; // kbps
  latency: number; // ms
  packetLoss: number; // percentage
  jitter: number; // ms
}

export interface CallSchedule {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  scheduledTime: Date;
  duration: number; // minutes
  timezone: string;
  title?: string;
  description?: string;
  virtualDateIdea?: VirtualDateIdea;
  reminderSettings: ReminderSettings;
  status: 'scheduled' | 'started' | 'completed' | 'cancelled' | 'missed';
  createdAt: Date;
  updatedAt: Date;
}

export interface VirtualDateIdea {
  id: string;
  title: string;
  description: string;
  category: 'games' | 'watch-party' | 'activities' | 'conversation';
  duration: number; // minutes
  instructions: string[];
  props?: any;
  backgroundTheme?: string;
  iceBreakers?: string[];
  playlist?: string[];
}

export interface ReminderSettings {
  enabled: boolean;
  intervals: number[]; // minutes before call [15, 60, 1440]
  sound: boolean;
  vibration: boolean;
  notification: boolean;
}

export interface CallHistory {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar: string;
  type: 'incoming' | 'outgoing';
  status: CallStatus;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  quality: NetworkQuality;
  recordingUrl?: string;
  notes?: string;
  rating?: CallRating;
}

export interface CallRating {
  overall: number; // 1-5
  videoQuality: number; // 1-5
  audioQuality: number; // 1-5
  connectionStability: number; // 1-5
  feedback?: string;
  wouldCallAgain: boolean;
}

export interface IncomingCall {
  callId: string;
  callerId: string;
  callerName: string;
  callerAvatar: string;
  callType: 'video' | 'audio';
  isScheduled: boolean;
  scheduledTime?: Date;
  customRingtone?: string;
  priority: 'normal' | 'high';
}

export interface CallMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'emoji' | 'system';
}

export interface CallEmoji {
  emoji: string;
  id: string;
  senderId: string;
  timestamp: Date;
  position: { x: number; y: number };
  animation: 'bounce' | 'float' | 'pulse';
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  sdpSemantics: 'plan-b' | 'unified-plan';
  bundlePolicy: 'balanced' | 'max-compat' | 'max-bundle';
  iceCandidatePoolSize: number;
}

export interface MediaConstraints {
  video: {
    enabled: boolean;
    width?: number;
    height?: number;
    frameRate?: number;
    facingMode?: 'front' | 'back';
  };
  audio: {
    enabled: boolean;
    sampleRate?: number;
    channelCount?: number;
    echoCancellation?: boolean;
    noiseSuppression?: boolean;
    autoGainControl?: boolean;
  };
}

export interface CallPermissions {
  camera: 'granted' | 'denied' | 'undetermined';
  microphone: 'granted' | 'denied' | 'undetermined';
  notifications: 'granted' | 'denied' | 'undetermined';
}

export interface CallAnalytics {
  callId: string;
  participantId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  quality: {
    video: {
      avgBitrate: number;
      avgFrameRate: number;
      resolution: string;
      pixelsReceived: number;
      framesSent: number;
      framesReceived: number;
      framesDropped: number;
    };
    audio: {
      avgBitrate: number;
      sampleRate: number;
      packetsLost: number;
      jitter: number;
      roundTripTime: number;
    };
    network: {
      avgBandwidth: number;
      avgLatency: number;
      packetLoss: number;
      connectionType: string;
    };
  };
  events: CallEvent[];
  userActions: CallUserAction[];
  errors: CallError[];
}

export interface CallEvent {
  type: 'call_started' | 'call_ended' | 'connection_changed' | 'quality_changed' | 'participant_joined' | 'participant_left';
  timestamp: Date;
  data?: any;
}

export interface CallUserAction {
  type: 'mute_toggle' | 'video_toggle' | 'camera_switch' | 'speaker_toggle' | 'screen_share' | 'filter_applied' | 'background_changed';
  timestamp: Date;
  value?: any;
}

export interface CallError {
  code: string;
  message: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high';
  recovered: boolean;
}

export interface SafetyReport {
  callId: string;
  reporterId: string;
  reportedUserId: string;
  reason: 'inappropriate_behavior' | 'harassment' | 'explicit_content' | 'spam' | 'fake_profile' | 'other';
  description: string;
  timestamp: Date;
  evidence?: {
    screenshots: string[];
    recording?: string;
    messages: string[];
  };
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  actions?: SafetyAction[];
}

export interface SafetyAction {
  type: 'warning' | 'temporary_ban' | 'permanent_ban' | 'call_limit' | 'profile_review';
  duration?: number; // hours
  reason: string;
  timestamp: Date;
  adminId: string;
}

export interface PremiumCallFeatures {
  unlimitedDuration: boolean;
  hdVideoQuality: boolean;
  groupCalls: boolean;
  internationalCalls: boolean;
  priorityConnection: boolean;
  advancedFilters: boolean;
  callRecording: boolean;
  customBackgrounds: boolean;
  noiseReduction: boolean;
  beautificationEffects: boolean;
}

export interface CallWidget {
  id: string;
  type: 'quick_call' | 'scheduled_call' | 'missed_call';
  participantId: string;
  participantName: string;
  participantAvatar: string;
  lastCallTime?: Date;
  nextScheduledCall?: Date;
  isPriority: boolean;
  unreadMessages: number;
}

// Audio/Video device types
export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  groupId: string;
}

export interface AudioRoute {
  type: 'earpiece' | 'speaker' | 'bluetooth' | 'headphones' | 'wired_headset';
  name: string;
  isDefault: boolean;
  isSelected: boolean;
}

// Background and filter types
export interface VideoFilter {
  id: string;
  name: string;
  type: 'beauty' | 'fun' | 'ar' | 'background';
  thumbnail: string;
  category: string;
  isPremium: boolean;
  isActive: boolean;
  settings?: any;
}

export interface VirtualBackground {
  id: string;
  name: string;
  type: 'blur' | 'image' | 'video';
  url?: string;
  thumbnail: string;
  category: 'nature' | 'office' | 'abstract' | 'seasonal';
  isPremium: boolean;
}

// Platform-specific types
export interface CallKitCall {
  uuid: string;
  handle: string;
  hasVideo: boolean;
  localizedCallerName: string;
  supportsHolding: boolean;
  supportsDTMF: boolean;
  supportsGrouping: boolean;
  supportsUngrouping: boolean;
}

export interface ConnectionServiceCall {
  callId: string;
  address: string;
  displayName: string;
  videoState: number;
  capabilities: number;
  properties: number;
}

// Real-time communication types
export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-request' | 'call-response' | 'call-end' | 'call-decline';
  callId: string;
  senderId: string;
  recipientId: string;
  data: any;
  timestamp: Date;
}

export interface ICECandidate {
  candidate: string;
  sdpMid?: string;
  sdpMLineIndex?: number;
}

export interface SessionDescription {
  type: 'offer' | 'answer';
  sdp: string;
}