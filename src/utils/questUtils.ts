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
    Object.entries(quest.statBoosts).forEach(([stat, boost]) => {
      newStats[stat as keyof typeof newStats] = Math.min(
        100,
        newStats[stat as keyof typeof newStats] + boost
      );
    });

    const newExperience = userData.experience + quest.experience;
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
      statIncreases: Object.entries(quest.statBoosts).map(([stat, boost]) => ({
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
  // Implementation for creating daily quests
  // This would randomly select from questTemplates and create new quests for the user
}; 