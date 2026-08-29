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
