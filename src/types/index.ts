export interface User {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  bannerUrl?: string;
  topImageUrl?: string;
  sideImageUrl?: string;
  quickImageUrl?: string;
  headerImageUrl?: string;
  showAddSubstatModal?: boolean;
  level: number;
  experience: number;
  stats: UserStats;
  createdAt: Date;
  hp: number;
  energy: number;
  themeColor?: string;
  borderColor?: string;
  showBorders?: boolean;
  customStats?: CustomStat[];
  activeQuests: ActiveBasicQuest[];
}

export interface CustomStat {
  name: string;
  value: number;
  parentStat: string;
  icon: string;
  boostRatio?: number;
}

export interface UserStats {
  physical: number;
  mental: number;
  creativity: number;
  spiritual: number;
  social: number;
  knowledge: number;
}

export type QuestType = 'daily' | 'weekly' | 'achievement' | 'habit';
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'epic';

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'achievement';
  difficulty: 'easy' | 'medium' | 'hard' | 'epic';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
  rewards: {
    experience: number;
    stats: Record<string, number>;
  };
}

export interface BasicQuestRewards {
  experience: number;
  stats: {
    [key in keyof UserStats]?: number;
  };
}

export interface BasicQuest {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeToAccept: number; // in minutes
  timeToComplete: number; // in hours
  rewards: BasicQuestRewards;
  type: 'physical' | 'mental' | 'social' | 'creative' | 'knowledge' | 'spiritual';
}

export interface ActiveBasicQuest extends BasicQuest {
  availableUntil: number; // timestamp when quest expires for accepting
  acceptedAt?: number; // timestamp when quest was accepted
  completedAt?: number; // timestamp when quest was completed
  status: 'available' | 'accepted' | 'completed' | 'failed' | 'expired';
} 