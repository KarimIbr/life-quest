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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Quests</h1>
      {quests.length === 0 ? (
        <div className="text-gray-400">No quests available</div>
      ) : (
        <div className="space-y-6">
          {quests.map((quest) => (
            <div key={quest.id} className="bg-surface p-6 rounded-xl">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-100">{quest.title}</h3>
                    <span className={`text-sm ${getQuestTypeColor(quest.type)}`}>
                      {quest.type}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
                  <div className="flex gap-4 mt-2">
                    {quest.rewards?.experience && (
                      <div className="text-primary text-sm">+{quest.rewards.experience} XP</div>
                    )}
                    {quest.rewards?.stats && (
                      <div className="text-gray-400 text-sm">
                        {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                          <span key={stat} className="mr-2">
                            +{value} {stat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {!quest.completed && (
                  <button 
                    onClick={() => handleCompleteQuest(quest.id)}
                    className="btn-primary text-sm"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quests; 