import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, Timestamp, increment, getDoc, FieldValue } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Quest, UserStats, CustomStat } from '../types';

export const useQuests = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) return;

    const questsRef = collection(db, 'quests');
    const q = query(
      questsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const questsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quest[];
        setQuests(questsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching quests:', err);
        setError('Failed to fetch quests');
        setLoading(false);
      }
    }, (err) => {
      console.error('Error in quests subscription:', err);
      setError('Failed to subscribe to quests');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const completeQuest = async (questId: string) => {
    if (!auth.currentUser) return;

    try {
      const questRef = doc(db, 'quests', questId);
      const quest = quests.find(q => q.id === questId);
      
      if (!quest) {
        throw new Error('Quest not found');
      }

      // Update quest completion status
      await updateDoc(questRef, {
        completed: true,
        completedAt: Timestamp.now()
      });

      // Get current user data
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Calculate main stat updates
      const mainStatUpdates: Record<string, FieldValue> = {};
      Object.entries(quest.rewards.stats).forEach(([stat, boost]) => {
        mainStatUpdates[`stats.${stat}`] = increment(boost);
      });

      // Calculate substat updates and their contributions to main stats
      if (quest.substatBoosts && Object.keys(quest.substatBoosts || {}).length > 0 && userData.customStats) {
        const updatedCustomStats = userData.customStats.map((stat: CustomStat) => {
          const boost = quest.substatBoosts?.[stat.name] || 0;
          if (boost > 0) {
            // Add the boost to the substat value
            const newValue = Math.min(100, stat.value + boost);
            // Calculate the additional contribution to the main stat
            const oldContribution = stat.value * (stat.boostRatio || 0.1);
            const newContribution = newValue * (stat.boostRatio || 0.1);
            const contributionDiff = newContribution - oldContribution;
            
            // Add the contribution difference to the main stat updates
            const currentIncrement = mainStatUpdates[`stats.${stat.parentStat}`] || increment(0);
            mainStatUpdates[`stats.${stat.parentStat}`] = increment(
              (currentIncrement as any).operand + contributionDiff
            );

            return {
              ...stat,
              value: newValue
            };
          }
          return stat;
        });

        // Update customStats and main stats in a single operation
        await updateDoc(userRef, {
          customStats: updatedCustomStats,
          ...mainStatUpdates,
          experience: increment(quest.rewards.experience)
        });
      } else {
        // Only update main stats and experience
        await updateDoc(userRef, {
          ...mainStatUpdates,
          experience: increment(quest.rewards.experience)
        });
      }

    } catch (err) {
      console.error('Error completing quest:', err);
      throw new Error('Failed to complete quest');
    }
  };

  const getDailyQuests = () => quests.filter(q => q.type === 'daily' && !q.completed);
  const getWeeklyQuests = () => quests.filter(q => q.type === 'weekly' && !q.completed);
  const getAchievementQuests = () => quests.filter(q => q.type === 'achievement' && !q.completed);

  return {
    quests,
    loading,
    error,
    completeQuest,
    getDailyQuests,
    getWeeklyQuests,
    getAchievementQuests
  };
};

export default useQuests; 