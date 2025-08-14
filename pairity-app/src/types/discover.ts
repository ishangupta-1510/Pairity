export interface User {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  distance: number;
  bio: string;
  interests: string[];
  isOnline: boolean;
  isVerified: boolean;
  lastActive: Date;
  matchPercentage: number;
  isNew: boolean;
  likes: number;
  height: number;
  bodyType: string;
  education: string;
  relationshipGoal: string;
  hasChildren: boolean;
  wantsChildren: boolean;
  religion: string;
  politics: string;
  languages: string[];
  smoking: string;
  drinking: string;
}

export interface Filter {
  ageRange: [number, number];
  distance: number;
  heightRange: [number, number];
  bodyTypes: string[];
  education: string;
  relationshipGoals: string[];
  lifestyle: {
    smoking: string;
    drinking: string;
    exercise: string;
    diet: string;
  };
  children: string;
  religion: string;
  politics: string;
  languages: string[];
  interests: string[];
}

export type ViewMode = 'grid' | 'list' | 'stack';

export interface QuickFilters {
  online: boolean;
  new: boolean;
  verified: boolean;
  nearby: boolean;
}

export type SortOption = 'recommended' | 'distance' | 'active' | 'newest' | 'match' | 'popular';

export interface SearchHistory {
  id: string;
  query: string;
  timestamp: Date;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: Filter;
  createdAt: Date;
}