import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  VideoCallState,
  CallStatus,
  CallParticipant,
  CallSettings,
  NetworkQuality,
  VideoQuality,
  CallHistory,
  CallSchedule,
  IncomingCall,
  CallMessage,
  CallEmoji,
  CallPermissions,
  PremiumCallFeatures,
  AudioRoute,
  VideoFilter,
  VirtualBackground,
} from '@/types/videocall';

const initialCallSettings: CallSettings = {
  video: {
    enabled: true,
    quality: VideoQuality.STANDARD,
    facingMode: 'front',
    backgroundBlur: false,
    beautyFilter: false,
    filters: [],
  },
  audio: {
    enabled: true,
    speakerMode: false,
    noiseSupression: true,
    echoCancellation: true,
    autoGainControl: true,
  },
  screen: {
    recording: false,
    sharing: false,
    recordingConsent: false,
  },
  chat: {
    enabled: true,
    visible: false,
  },
};

const initialNetworkQuality: NetworkQuality = {
  level: 'good',
  bandwidth: 0,
  latency: 0,
  packetLoss: 0,
  jitter: 0,
};

const initialPermissions: CallPermissions = {
  camera: 'undetermined',
  microphone: 'undetermined',
  notifications: 'undetermined',
};

const initialPremiumFeatures: PremiumCallFeatures = {
  unlimitedDuration: false,
  hdVideoQuality: false,
  groupCalls: false,
  internationalCalls: false,
  priorityConnection: false,
  advancedFilters: false,
  callRecording: false,
  customBackgrounds: false,
  noiseReduction: false,
  beautificationEffects: false,
};

const initialState: VideoCallState & {
  callHistory: CallHistory[];
  scheduledCalls: CallSchedule[];
  incomingCall: IncomingCall | null;
  callMessages: CallMessage[];
  callEmojis: CallEmoji[];
  permissions: CallPermissions;
  premiumFeatures: PremiumCallFeatures;
  audioRoutes: AudioRoute[];
  selectedAudioRoute?: AudioRoute;
  availableFilters: VideoFilter[];
  virtualBackgrounds: VirtualBackground[];
  isInitialized: boolean;
  error: string | null;
} = {
  isInCall: false,
  callType: null,
  callStatus: CallStatus.IDLE,
  participants: [],
  localStream: null,
  remoteStream: null,
  callDuration: 0,
  callId: '',
  roomId: '',
  settings: initialCallSettings,
  quality: initialNetworkQuality,
  callHistory: [],
  scheduledCalls: [],
  incomingCall: null,
  callMessages: [],
  callEmojis: [],
  permissions: initialPermissions,
  premiumFeatures: initialPremiumFeatures,
  audioRoutes: [],
  availableFilters: [],
  virtualBackgrounds: [],
  isInitialized: false,
  error: null,
};

const videoCallSlice = createSlice({
  name: 'videoCall',
  initialState,
  reducers: {
    // Call state management
    initializeCall: (state, action: PayloadAction<{ callId: string; roomId: string; type: 'incoming' | 'outgoing' | 'scheduled' }>) => {
      state.callId = action.payload.callId;
      state.roomId = action.payload.roomId;
      state.callType = action.payload.type;
      state.callStatus = CallStatus.CONNECTING;
      state.startTime = new Date();
      state.callDuration = 0;
      state.error = null;
    },

    updateCallStatus: (state, action: PayloadAction<CallStatus>) => {
      state.callStatus = action.payload;
      if (action.payload === CallStatus.IN_PROGRESS && !state.isInCall) {
        state.isInCall = true;
        state.startTime = new Date();
      } else if (action.payload === CallStatus.ENDED) {
        state.isInCall = false;
        state.endTime = new Date();
        state.callType = null;
      }
    },

    updateCallDuration: (state, action: PayloadAction<number>) => {
      state.callDuration = action.payload;
    },

    setLocalStream: (state, action: PayloadAction<any>) => {
      state.localStream = action.payload;
    },

    setRemoteStream: (state, action: PayloadAction<any>) => {
      state.remoteStream = action.payload;
    },

    // Participant management
    addParticipant: (state, action: PayloadAction<CallParticipant>) => {
      const existingIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (existingIndex >= 0) {
        state.participants[existingIndex] = action.payload;
      } else {
        state.participants.push(action.payload);
      }
    },

    removeParticipant: (state, action: PayloadAction<string>) => {
      state.participants = state.participants.filter(p => p.id !== action.payload);
    },

    updateParticipant: (state, action: PayloadAction<{ id: string; updates: Partial<CallParticipant> }>) => {
      const participantIndex = state.participants.findIndex(p => p.id === action.payload.id);
      if (participantIndex >= 0) {
        state.participants[participantIndex] = { 
          ...state.participants[participantIndex], 
          ...action.payload.updates 
        };
      }
    },

    // Settings management
    updateVideoSettings: (state, action: PayloadAction<Partial<CallSettings['video']>>) => {
      state.settings.video = { ...state.settings.video, ...action.payload };
    },

    updateAudioSettings: (state, action: PayloadAction<Partial<CallSettings['audio']>>) => {
      state.settings.audio = { ...state.settings.audio, ...action.payload };
    },

    updateScreenSettings: (state, action: PayloadAction<Partial<CallSettings['screen']>>) => {
      state.settings.screen = { ...state.settings.screen, ...action.payload };
    },

    updateChatSettings: (state, action: PayloadAction<Partial<CallSettings['chat']>>) => {
      state.settings.chat = { ...state.settings.chat, ...action.payload };
    },

    toggleMute: (state) => {
      state.settings.audio.enabled = !state.settings.audio.enabled;
    },

    toggleVideo: (state) => {
      state.settings.video.enabled = !state.settings.video.enabled;
    },

    toggleSpeaker: (state) => {
      state.settings.audio.speakerMode = !state.settings.audio.speakerMode;
    },

    switchCamera: (state) => {
      state.settings.video.facingMode = state.settings.video.facingMode === 'front' ? 'back' : 'front';
    },

    toggleBackgroundBlur: (state) => {
      state.settings.video.backgroundBlur = !state.settings.video.backgroundBlur;
    },

    toggleBeautyFilter: (state) => {
      state.settings.video.beautyFilter = !state.settings.video.beautyFilter;
    },

    applyFilter: (state, action: PayloadAction<string>) => {
      const filterId = action.payload;
      if (state.settings.video.filters.includes(filterId)) {
        state.settings.video.filters = state.settings.video.filters.filter(id => id !== filterId);
      } else {
        state.settings.video.filters.push(filterId);
      }
    },

    setVirtualBackground: (state, action: PayloadAction<string | undefined>) => {
      state.settings.video.virtualBackground = action.payload;
      if (action.payload) {
        state.settings.video.backgroundBlur = false;
      }
    },

    // Quality and network management
    updateNetworkQuality: (state, action: PayloadAction<NetworkQuality>) => {
      state.quality = action.payload;
    },

    setVideoQuality: (state, action: PayloadAction<VideoQuality>) => {
      state.settings.video.quality = action.payload;
    },

    // Call history
    addCallToHistory: (state, action: PayloadAction<CallHistory>) => {
      const existingIndex = state.callHistory.findIndex(call => call.id === action.payload.id);
      if (existingIndex >= 0) {
        state.callHistory[existingIndex] = action.payload;
      } else {
        state.callHistory.unshift(action.payload);
      }
      // Keep only last 100 calls
      if (state.callHistory.length > 100) {
        state.callHistory = state.callHistory.slice(0, 100);
      }
    },

    removeCallFromHistory: (state, action: PayloadAction<string>) => {
      state.callHistory = state.callHistory.filter(call => call.id !== action.payload);
    },

    clearCallHistory: (state) => {
      state.callHistory = [];
    },

    // Scheduled calls
    addScheduledCall: (state, action: PayloadAction<CallSchedule>) => {
      const existingIndex = state.scheduledCalls.findIndex(call => call.id === action.payload.id);
      if (existingIndex >= 0) {
        state.scheduledCalls[existingIndex] = action.payload;
      } else {
        state.scheduledCalls.push(action.payload);
      }
      // Sort by scheduled time
      state.scheduledCalls.sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime());
    },

    updateScheduledCall: (state, action: PayloadAction<{ id: string; updates: Partial<CallSchedule> }>) => {
      const callIndex = state.scheduledCalls.findIndex(call => call.id === action.payload.id);
      if (callIndex >= 0) {
        state.scheduledCalls[callIndex] = { 
          ...state.scheduledCalls[callIndex], 
          ...action.payload.updates,
          updatedAt: new Date(),
        };
      }
    },

    removeScheduledCall: (state, action: PayloadAction<string>) => {
      state.scheduledCalls = state.scheduledCalls.filter(call => call.id !== action.payload);
    },

    // Incoming call
    setIncomingCall: (state, action: PayloadAction<IncomingCall | null>) => {
      state.incomingCall = action.payload;
    },

    // Chat and emojis
    addCallMessage: (state, action: PayloadAction<CallMessage>) => {
      state.callMessages.push(action.payload);
      // Keep only last 50 messages per call
      if (state.callMessages.length > 50) {
        state.callMessages = state.callMessages.slice(-50);
      }
    },

    clearCallMessages: (state) => {
      state.callMessages = [];
    },

    addCallEmoji: (state, action: PayloadAction<CallEmoji>) => {
      state.callEmojis.push(action.payload);
      // Remove emoji after 3 seconds (handled in component)
    },

    removeCallEmoji: (state, action: PayloadAction<string>) => {
      state.callEmojis = state.callEmojis.filter(emoji => emoji.id !== action.payload);
    },

    clearCallEmojis: (state) => {
      state.callEmojis = [];
    },

    // Permissions
    updatePermissions: (state, action: PayloadAction<Partial<CallPermissions>>) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },

    // Premium features
    updatePremiumFeatures: (state, action: PayloadAction<Partial<PremiumCallFeatures>>) => {
      state.premiumFeatures = { ...state.premiumFeatures, ...action.payload };
    },

    // Audio routes
    setAudioRoutes: (state, action: PayloadAction<AudioRoute[]>) => {
      state.audioRoutes = action.payload;
    },

    selectAudioRoute: (state, action: PayloadAction<AudioRoute>) => {
      state.selectedAudioRoute = action.payload;
      state.audioRoutes = state.audioRoutes.map(route => ({
        ...route,
        isSelected: route.type === action.payload.type,
      }));
    },

    // Filters and backgrounds
    setAvailableFilters: (state, action: PayloadAction<VideoFilter[]>) => {
      state.availableFilters = action.payload;
    },

    updateFilter: (state, action: PayloadAction<{ id: string; updates: Partial<VideoFilter> }>) => {
      const filterIndex = state.availableFilters.findIndex(filter => filter.id === action.payload.id);
      if (filterIndex >= 0) {
        state.availableFilters[filterIndex] = { 
          ...state.availableFilters[filterIndex], 
          ...action.payload.updates 
        };
      }
    },

    setVirtualBackgrounds: (state, action: PayloadAction<VirtualBackground[]>) => {
      state.virtualBackgrounds = action.payload;
    },

    // System state
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Reset call state
    resetCallState: (state) => {
      state.isInCall = false;
      state.callType = null;
      state.callStatus = CallStatus.IDLE;
      state.participants = [];
      state.localStream = null;
      state.remoteStream = null;
      state.callDuration = 0;
      state.startTime = undefined;
      state.endTime = undefined;
      state.callId = '';
      state.roomId = '';
      state.callMessages = [];
      state.callEmojis = [];
      state.error = null;
    },

    // End call cleanup
    endCall: (state) => {
      if (state.isInCall || state.callStatus !== CallStatus.IDLE) {
        // Add to history before cleanup
        const callHistoryEntry: CallHistory = {
          id: state.callId,
          participantId: state.participants.find(p => !p.isLocal)?.id || '',
          participantName: state.participants.find(p => !p.isLocal)?.name || '',
          participantAvatar: state.participants.find(p => !p.isLocal)?.avatar || '',
          type: state.callType === 'incoming' ? 'incoming' : 'outgoing',
          status: state.callStatus,
          startTime: state.startTime || new Date(),
          endTime: new Date(),
          duration: state.callDuration,
          quality: state.quality,
        };
        
        state.callHistory.unshift(callHistoryEntry);
        if (state.callHistory.length > 100) {
          state.callHistory = state.callHistory.slice(0, 100);
        }
      }

      // Reset call state
      state.isInCall = false;
      state.callType = null;
      state.callStatus = CallStatus.ENDED;
      state.participants = [];
      state.localStream = null;
      state.remoteStream = null;
      state.callDuration = 0;
      state.endTime = new Date();
      state.callMessages = [];
      state.callEmojis = [];
      
      // Reset to idle after a brief moment
      setTimeout(() => {
        state.callStatus = CallStatus.IDLE;
        state.callId = '';
        state.roomId = '';
        state.startTime = undefined;
        state.endTime = undefined;
      }, 1000);
    },
  },
});

export const {
  initializeCall,
  updateCallStatus,
  updateCallDuration,
  setLocalStream,
  setRemoteStream,
  addParticipant,
  removeParticipant,
  updateParticipant,
  updateVideoSettings,
  updateAudioSettings,
  updateScreenSettings,
  updateChatSettings,
  toggleMute,
  toggleVideo,
  toggleSpeaker,
  switchCamera,
  toggleBackgroundBlur,
  toggleBeautyFilter,
  applyFilter,
  setVirtualBackground,
  updateNetworkQuality,
  setVideoQuality,
  addCallToHistory,
  removeCallFromHistory,
  clearCallHistory,
  addScheduledCall,
  updateScheduledCall,
  removeScheduledCall,
  setIncomingCall,
  addCallMessage,
  clearCallMessages,
  addCallEmoji,
  removeCallEmoji,
  clearCallEmojis,
  updatePermissions,
  updatePremiumFeatures,
  setAudioRoutes,
  selectAudioRoute,
  setAvailableFilters,
  updateFilter,
  setVirtualBackgrounds,
  setInitialized,
  setError,
  resetCallState,
  endCall,
} = videoCallSlice.actions;

export default videoCallSlice.reducer;