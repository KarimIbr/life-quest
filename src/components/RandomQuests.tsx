import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, ActiveBasicQuest, BasicQuest } from '../types';
import { basicQuests } from '../data/basicQuests';
import { formatDistanceToNow } from 'date-fns';

interface RandomQuestsProps {
  user: User | null;
  onUpdate: (updates: Partial<User>) => void;
}

const RandomQuests = ({ user, onUpdate }: RandomQuestsProps) => {
  const [activeQuests, setActiveQuests] = useState<ActiveBasicQuest[]>([]);
  const [loading, setLoading] = useState(false);

  const generateNewQuest = async () => {
    if (!user?.uid || loading) {
      console.log('Cannot generate quest:', { hasUserId: !!user?.uid, loading });
      return;
    }

    try {
      setLoading(true);
      console.log('Starting quest generation');
      const now = Date.now();
      
      // Create a new array instead of mutating the existing one
      const updatedQuests = activeQuests
        .map(quest => ({
          ...quest,
          status: quest.status === 'available' && now > quest.availableUntil 
            ? 'expired' 
            : quest.status
        }))
        .filter(quest => quest.status !== 'expired');

      console.log('Current quests after filtering:', updatedQuests);

      // Only generate new quests if we have less than 3 available quests
      const availableCount = updatedQuests.filter(q => q.status === 'available').length;
      console.log('Available quests count:', availableCount);

      if (availableCount < 3) {
        // 1/50 chance to generate a new quest every 5 minutes
        const shouldGenerate = Math.random() < 0.02; // 2% chance
        if (!shouldGenerate) {
          console.log('Random chance check failed, skipping quest generation');
          return;
        }

        const availableQuestTemplates = basicQuests.filter(template => 
          !updatedQuests.some(active => active.title === template.title)
        );

        console.log('Available quest templates:', availableQuestTemplates.length);

        if (availableQuestTemplates.length === 0) {
          console.log('No more quest templates available');
          return;
        }

        const randomIndex = Math.floor(Math.random() * availableQuestTemplates.length);
        const randomQuest = availableQuestTemplates[randomIndex];

        const newQuest: ActiveBasicQuest = {
          ...randomQuest,
          availableUntil: now + (2 * 60 * 60 * 1000), // 2 hours to accept
          status: 'available'
        };
        updatedQuests.push(newQuest);
        console.log('Added new quest:', newQuest.title);
      }

      console.log('Updating Firestore with quests:', updatedQuests);
      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        activeQuests: updatedQuests
      });
      console.log('Successfully updated Firestore');
    } catch (error) {
      console.error('Error generating new quests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to active quests in Firestore
  useEffect(() => {
    if (!user?.uid) {
      console.log('No user ID available');
      return;
    }

    console.log('Setting up Firestore listener for user:', user.uid);
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), async (docSnapshot) => {
      const userData = docSnapshot.data();
      console.log('Received user data:', userData);
      
      if (!userData) {
        console.log('No user data found');
        return;
      }

      // Initialize activeQuests if it doesn't exist
      if (!userData.activeQuests) {
        console.log('Initializing new quests for user');
        const now = Date.now();
        const initialQuests: ActiveBasicQuest[] = [];
        
        // Add initial quests
        for (let i = 0; i < 3; i++) {
          const availableTemplates = basicQuests.filter(template => 
            !initialQuests.some(q => q.title === template.title)
          );
          
          if (availableTemplates.length === 0) {
            console.log('No more available quest templates');
            break;
          }
          
          const randomQuest = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
          initialQuests.push({
            ...randomQuest,
            availableUntil: now + (2 * 60 * 60 * 1000), // 2 hours to accept
            status: 'available'
          });
        }

        console.log('Generated initial quests:', initialQuests);

        // Update Firestore with initial quests
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            activeQuests: initialQuests
          });
          console.log('Successfully updated Firestore with initial quests');
          setActiveQuests(initialQuests);
        } catch (error) {
          console.error('Error initializing quests:', error);
        }
      } else {
        console.log('Found existing quests:', userData.activeQuests);
        setActiveQuests(userData.activeQuests);
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Generate new random quests periodically
  useEffect(() => {
    if (!user?.uid) {
      console.log('No user ID available for quest generation');
      return;
    }

    console.log('Starting periodic quest generation');
    // Generate initial quests
    generateNewQuest();

    // Check for new quests every 5 minutes
    const interval = setInterval(() => {
      console.log('Checking for new quests...');
      generateNewQuest();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user?.uid]);

  const handleAcceptQuest = async (quest: ActiveBasicQuest) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const now = Date.now();
      const updatedQuests = activeQuests.map(q => 
        q.id === quest.id
          ? { 
              ...q, 
              status: 'accepted', 
              acceptedAt: now,
              availableUntil: now + (24 * 60 * 60 * 1000) // 24 hours to complete
            }
          : q
      );

      await updateDoc(doc(db, 'users', user.uid), {
        activeQuests: updatedQuests
      });
    } catch (error) {
      console.error('Error accepting quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteQuest = async (quest: ActiveBasicQuest) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      const now = Date.now();
      const updatedQuests = activeQuests.map(q => 
        q.id === quest.id
          ? { ...q, status: 'completed', completedAt: now }
          : q
      );

      // Update user stats and experience
      const newExperience = user.experience + quest.rewards.experience;
      const newStats = { ...user.stats };
      Object.entries(quest.rewards.stats).forEach(([stat, value]) => {
        const statKey = stat as keyof typeof user.stats;
        newStats[statKey] = Math.min(100, (newStats[statKey] || 0) + (value || 0));
      });

      await updateDoc(doc(db, 'users', user.uid), {
        activeQuests: updatedQuests,
        experience: newExperience,
        stats: newStats
      });
    } catch (error) {
      console.error('Error completing quest:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeLeft = (quest: ActiveBasicQuest) => {
    if (quest.status === 'available') {
      return `Expires ${formatDistanceToNow(quest.availableUntil, { addSuffix: true })}`;
    } else if (quest.status === 'accepted' && quest.acceptedAt) {
      const completionTime = quest.acceptedAt + (24 * 60 * 60 * 1000); // 24 hours to complete
      return `Expires ${formatDistanceToNow(completionTime, { addSuffix: true })}`;
    }
    return '';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Random Quests</h2>
      <div className="space-y-4">
        {activeQuests.map(quest => (
          <div 
            key={quest.id} 
            className={`p-4 rounded-lg bg-surface-light ${
              quest.status === 'completed' ? 'opacity-50' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-gray-100 font-medium">{quest.title}</h3>
              <span className={`text-sm ${getDifficultyColor(quest.difficulty)}`}>
                {quest.difficulty}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-3">{quest.description}</p>
            
            {/* Rewards */}
            <div className="mb-3">
              <p className="text-sm text-gray-300">Rewards:</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="text-yellow-400">+{quest.rewards.experience} XP</span>
                {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                  <span key={stat} className="text-primary">
                    +{value} {stat}
                  </span>
                ))}
              </div>
            </div>

            {/* Time and Actions */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {getTimeLeft(quest)}
              </span>
              <div className="flex gap-2">
                {quest.status === 'available' && (
                  <button
                    onClick={() => handleAcceptQuest(quest)}
                    disabled={loading}
                    className="btn-primary text-sm"
                  >
                    Accept
                  </button>
                )}
                {quest.status === 'accepted' && (
                  <button
                    onClick={() => handleCompleteQuest(quest)}
                    disabled={loading}
                    className="btn-primary text-sm"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {activeQuests.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            No quests available right now. Check back soon!
          </div>
        )}
      </div>
    </div>
  );
};

export default RandomQuests; 