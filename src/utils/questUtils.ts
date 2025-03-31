import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Quest, User } from '../types';

export const completeQuest = async (quest: Quest, userId: string) => {
  try {
    // Mark quest as completed
    await updateDoc(doc(db, 'quests', quest.id), {
      completed: true
    });

    // Get current user data
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) throw new Error('User not found');
    
    const userData = userDoc.data() as User;
    
    // Calculate new stats and experience
    const newStats = { ...userData.stats };
    Object.entries(quest.rewards.stats).forEach(([stat, boost]) => {
      newStats[stat as keyof typeof newStats] = Math.min(
        100,
        newStats[stat as keyof typeof newStats] + boost
      );
    });

    const newExperience = userData.experience + quest.rewards.experience;
    let newLevel = userData.level;
    const experienceNeeded = userData.level * 1000;

    // Level up if enough experience
    if (newExperience >= experienceNeeded) {
      newLevel += 1;
      // Restore HP and Energy on level up
      await updateDoc(doc(db, 'users', userId), {
        stats: newStats,
        experience: newExperience - experienceNeeded,
        level: newLevel,
        hp: 100,
        energy: 100
      });
    } else {
      // Just update stats and experience
      await updateDoc(doc(db, 'users', userId), {
        stats: newStats,
        experience: newExperience
      });
    }

    return {
      leveledUp: newLevel > userData.level,
      newLevel,
      newExperience: newExperience % experienceNeeded,
      statIncreases: Object.entries(quest.rewards.stats).map(([stat, boost]) => ({
        stat,
        boost,
        newValue: newStats[stat as keyof typeof newStats]
      }))
    };
  } catch (error) {
    console.error('Error completing quest:', error);
    throw error;
  }
};

export const createDailyQuests = async (userId: string) => {
  try {
    const dailyQuests = generateDailyQuests(userId);
    // Here you would typically save these quests to the database
    // For now, we'll just return them
    return dailyQuests;
  } catch (error) {
    console.error('Error creating daily quests:', error);
    throw error;
  }
};

export const generateDailyQuests = (userId: string): Quest[] => {
  return [
    {
      id: 'daily-1',
      userId,
      title: 'Morning Exercise',
      description: 'Start your day with a 15-minute workout',
      type: 'daily',
      difficulty: 'easy',
      completed: false,
      createdAt: new Date(),
      experience: 50,
      statBoosts: {
        strength: 2,
        vitality: 1
      },
      rewards: {
        experience: 50,
        stats: {
          strength: 2,
          vitality: 1
        }
      }
    },
    // ... rest of the daily quests ...
  ];
};

export const generateWeeklyQuests = (userId: string): Quest[] => {
  return [
    {
      id: 'weekly-1',
      userId,
      title: 'Weekly Challenge',
      description: 'Complete a challenging task this week',
      type: 'weekly',
      difficulty: 'medium',
      completed: false,
      createdAt: new Date(),
      experience: 200,
      statBoosts: {
        strength: 5,
        vitality: 3
      },
      rewards: {
        experience: 200,
        stats: {
          strength: 5,
          vitality: 3
        }
      }
    },
    // ... rest of the weekly quests ...
  ];
};

export const generateAchievementQuests = (userId: string): Quest[] => {
  return [
    {
      id: 'achievement-1',
      userId,
      title: 'First Achievement',
      description: 'Complete your first quest',
      type: 'achievement',
      difficulty: 'easy',
      completed: false,
      createdAt: new Date(),
      experience: 100,
      statBoosts: {
        strength: 3,
        vitality: 2
      },
      rewards: {
        experience: 100,
        stats: {
          strength: 3,
          vitality: 2
        }
      }
    },
    // ... rest of the achievement quests ...
  ];
}; 