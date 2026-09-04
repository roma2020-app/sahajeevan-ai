export type DurationOption = "10 min" | "15 min" | "30 min";
export type LocationType = "outdoor" | "indoor";

export interface MomentActivity {
  title: string;
  tagline: string;
  steps: string[];
  natureLesson: string;
  parentPrompt?: string;
  ecoBenefit?: string;
  quickTip?: string;
  rawAiResponse?: string;
  isFallback?: boolean;
}

export type MemoryFilter = "all" | "1_year_ago" | "2_years_ago" | "3_plus_years_ago" | "favorites";

export interface MomentRecord {
  id?: string;
  activity: MomentActivity;
  childAge: string;
  duration: string;
  locationType: LocationType;
  interest?: string;
  createdAt: string; // ISO string
  completedAt: string; // ISO string
  reflection?: string;
  rating?: number;
  userId: string;
  // Memory Map, Photo, Location & Favorite fields
  latitude?: number;
  longitude?: number;
  locationName?: string;
  photoUrl?: string;
  description?: string;
  isFavorite?: boolean;
}

export interface UserStats {
  totalMoments: number;
  outdoorMoments: number;
  indoorMoments: number;
  currentStreak: number;
  totalMinutes: number;
  lastCompletedDate?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}
