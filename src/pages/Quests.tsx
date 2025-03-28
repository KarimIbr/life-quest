import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { Quest } from '../types';

const Quests = () => {
  const [user] = useAuthState(auth);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuests = async () => {
      if (!user) return;

      try {
        const q = query(
          collection(db, 'quests'),
          where('userId', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const questsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Quest[];

        setQuests(questsData);
      } catch (error) {
        console.error('Error fetching quests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuests();
  }, [user]);

  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;

    try {
      await updateDoc(doc(db, 'quests', questId), {
        completed: true
      });

      setQuests(prevQuests =>
        prevQuests.map(quest =>
          quest.id === questId ? { ...quest, completed: true } : quest
        )
      );
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  const getQuestTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'text-blue-400';
      case 'weekly':
        return 'text-purple-400';
      case 'achievement':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'hard':
        return 'text-orange-400';
      case 'epic':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100">Quests</h1>
        <p className="text-gray-400">Complete quests to gain experience and level up</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Quests */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Daily Quests</h2>
          <div className="space-y-4">
            {quests
              .filter(quest => quest.type === 'daily')
              .map(quest => (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg bg-surface-light ${
                    quest.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-100">{quest.title}</h3>
                      <p className="text-sm text-gray-400">{quest.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs ${getQuestTypeColor(quest.type)}`}>
                          {quest.type}
                        </span>
                        <span className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-xs text-primary">
                          {quest.experience} XP
                        </span>
                      </div>
                    </div>
                    {!quest.completed && (
                      <button
                        onClick={() => handleCompleteQuest(quest.id)}
                        className="btn-primary"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {quests.filter(quest => quest.type === 'daily').length === 0 && (
              <p className="text-gray-400">No daily quests available</p>
            )}
          </div>
        </div>

        {/* Weekly Quests */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Quests</h2>
          <div className="space-y-4">
            {quests
              .filter(quest => quest.type === 'weekly')
              .map(quest => (
                <div
                  key={quest.id}
                  className={`p-4 rounded-lg bg-surface-light ${
                    quest.completed ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-100">{quest.title}</h3>
                      <p className="text-sm text-gray-400">{quest.description}</p>
                      <div className="flex gap-2 mt-2">
                        <span className={`text-xs ${getQuestTypeColor(quest.type)}`}>
                          {quest.type}
                        </span>
                        <span className={`text-xs ${getDifficultyColor(quest.difficulty)}`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-xs text-primary">
                          {quest.experience} XP
                        </span>
                      </div>
                    </div>
                    {!quest.completed && (
                      <button
                        onClick={() => handleCompleteQuest(quest.id)}
                        className="btn-primary"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            {quests.filter(quest => quest.type === 'weekly').length === 0 && (
              <p className="text-gray-400">No weekly quests available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Quests; 