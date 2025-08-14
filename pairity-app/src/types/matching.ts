export interface SwipeProfile {
  id: string;
  name: string;
  age: number;
  photos: string[];
  bio: string;
  location: string;
  distance: number;
  interests: string[];
  prompts: ProfilePrompt[];
  isVerified: boolean;
  matchPercentage: number;
  hasInstagram: boolean;
  hasSpotify: boolean;
  instagramPhotos: string[];
  spotifyArtists: string[];
  work?: string;
  education?: string;
  height?: string;
}

export interface ProfilePrompt {
  question: string;
  answer: string;
}

export type SwipeAction = 'like' | 'superlike' | 'pass' | 'maybe';

export interface MatchData {
  id: string;
  user: SwipeProfile;
  matchedAt: Date;
  hasMessaged: boolean;
}

export interface Conversation {
  id: string;
  match: MatchData;
  lastMessage?: Message;
  unreadCount: number;
  isTyping: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'gif' | 'voice';
  url: string;
  thumbnail?: string;
}

export interface SwipeStats {
  totalSwipes: number;
  likes: number;
  superLikes: number;
  passes: number;
  matches: number;
  matchRate: number;
  averageResponseTime: number;
}

export interface DailyLimits {
  swipes: number;
  superLikes: number;
  date: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}