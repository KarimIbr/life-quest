import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, Quest } from '../types';
import { useQuests } from '../hooks/useQuests';
import RandomQuests from '../components/RandomQuests';
import QuestCreation from '../components/QuestCreation';
import StatsPanel from '../components/StatsPanel';
import AvatarUpload from '../components/AvatarUpload';
import AddSubstatModal from '../components/AddSubstatModal';
import QuickImage from '../components/QuickImage';
import { RadarChart } from '../components/RadarChart';

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

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddSubstatModal, setShowAddSubstatModal] = useState(false);
  const [showQuestCreation, setShowQuestCreation] = useState(false);
  const [showQuickImageModal, setShowQuickImageModal] = useState(false);
  const [showHeaderImageModal, setShowHeaderImageModal] = useState(false);

  const { 
    completeQuest,
    getDailyQuests,
    getWeeklyQuests,
    getAchievementQuests
  } = useQuests();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data() as User);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleCompleteQuest = async (questId: string) => {
    if (!user) return;

    try {
      await completeQuest(questId);
      // Refresh user data after completing quest
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
      }
    } catch (error) {
      console.error('Error completing quest:', error);
      setError('Failed to complete quest');
    }
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div className="text-gray-400">No user data found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <button 
          onClick={() => setShowQuestCreation(true)}
          className="btn-primary flex items-center gap-2"
        >
          <span>Create Quest</span>
          <span>+</span>
        </button>
      </div>

      <div className="flex gap-6">
        {/* Side Panel */}
        <div className="w-80 space-y-6">
          {/* Avatar Card */}
          <div className="card">
            <div className="aspect-square rounded-lg overflow-hidden bg-surface-light mb-4 relative group cursor-pointer"
                 onClick={() => setShowAvatarModal(true)}>
              {userData.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl font-bold text-primary">
                  {userData.displayName ? userData.displayName[0].toUpperCase() : '?'}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Avatar
                </span>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-100 text-center mb-2">
              {userData.displayName || 'User'}
            </h2>
            <div className="flex items-center justify-center gap-2">
              <div className="text-sm text-gray-400">Level {userData?.level}</div>
              <div className="h-2 bg-surface-light rounded-full w-32">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${((userData?.experience || 0) / ((userData?.level || 1) * 1000)) * 100}%`
                  }}
                />
              </div>
              <div className="text-sm text-gray-400">
                {userData?.experience}/{(userData?.level || 1) * 1000} XP
              </div>
            </div>
          </div>

          {/* Quick Image Panel */}
          <div className="bg-surface-dark rounded-xl p-4">
            <div 
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video"
              onClick={() => setShowQuickImageModal(true)}
            >
              {userData?.quickImageUrl ? (
                <img
                  src={userData.quickImageUrl}
                  alt="Quick Image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-light flex items-center justify-center">
                  <span className="text-gray-400">Add Quick Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Image
                </span>
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <StatsPanel 
            user={userData} 
            onUpdate={(updates) => {
              if (updates.showAddSubstatModal) {
                setShowAddSubstatModal(true);
              } else {
                setUserData(prev => prev ? { ...prev, ...updates } : null);
              }
            }}
          />

          {/* Random Quests */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Random Quests</h3>
            <RandomQuests user={userData} />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Header with Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Energy & Status */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-100 mb-4">Daily Energy</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">HP</span>
                    <span className="text-primary">{userData?.hp}%</span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full">
                    <div 
                      className="h-full bg-red-500 rounded-full" 
                      style={{ width: `${userData?.hp}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">Energy</span>
                    <span className="text-primary">{userData?.energy}%</span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${userData?.energy}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Header Image Panel */}
            <div className="card">
              <div 
                className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video"
                onClick={() => setShowHeaderImageModal(true)}
              >
                {userData?.headerImageUrl ? (
                  <img
                    src={userData.headerImageUrl}
                    alt="Header Image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-light flex items-center justify-center">
                    <span className="text-gray-400">Add Header Image</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                  <span className="text-white opacity-0 group-hover:opacity-100">
                    Change Image
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Hexagon */}
          <div className="card bg-[#1E2024] border border-gray-800 mb-6">
            <h2 className="text-2xl font-semibold text-gray-100 mb-8">Stats Overview</h2>
            <div className="aspect-square max-w-2xl mx-auto p-4">
              <RadarChart userStats={userData} />
            </div>
          </div>

          {/* Quests */}
          <div className="space-y-6">
            {/* Daily Quests */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Daily Quests</h2>
              {getDailyQuests().length === 0 ? (
                <div className="text-gray-400">No daily quests available</div>
              ) : (
                <div className="space-y-4">
                  {getDailyQuests().map((quest: Quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-sm text-gray-400">{quest.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs ${getQuestTypeColor(quest.type)}`}>
                              {quest.type}
                            </span>
                            <span className="text-xs text-primary">
                              +{quest.rewards.experience} XP
                            </span>
                            {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                              <span key={stat} className="text-xs text-gray-400">
                                +{value} {stat}
                              </span>
                            ))}
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
                </div>
              )}
            </div>

            {/* Weekly Quests */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Quests</h2>
              {getWeeklyQuests().length === 0 ? (
                <div className="text-gray-400">No weekly quests available</div>
              ) : (
                <div className="space-y-4">
                  {getWeeklyQuests().map((quest: Quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-sm text-gray-400">{quest.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs ${getQuestTypeColor(quest.type)}`}>
                              {quest.type}
                            </span>
                            <span className="text-xs text-primary">
                              +{quest.rewards.experience} XP
                            </span>
                            {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                              <span key={stat} className="text-xs text-gray-400">
                                +{value} {stat}
                              </span>
                            ))}
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
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Achievements</h2>
              {getAchievementQuests().length === 0 ? (
                <div className="text-gray-400">No achievements available</div>
              ) : (
                <div className="space-y-4">
                  {getAchievementQuests().map((quest: Quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-sm text-gray-400">{quest.description}</p>
                          <div className="flex gap-2 mt-2">
                            <span className={`text-xs ${getQuestTypeColor(quest.type)}`}>
                              {quest.type}
                            </span>
                            <span className="text-xs text-primary">
                              +{quest.rewards.experience} XP
                            </span>
                            {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                              <span key={stat} className="text-xs text-gray-400">
                                +{value} {stat}
                              </span>
                            ))}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAvatarModal && (
        <AvatarUpload
          currentAvatarUrl={userData?.avatarUrl}
          onAvatarUpdate={(url) => {
            setUserData(prev => prev ? { ...prev, avatarUrl: url } : null);
            setShowAvatarModal(false);
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
      {showAddSubstatModal && (
        <AddSubstatModal
          onClose={() => setShowAddSubstatModal(false)}
          onAdd={() => {
            setShowAddSubstatModal(false);
            // Refresh user data after adding substat
            if (user) {
              getDoc(doc(db, 'users', user.uid)).then(userDoc => {
                if (userDoc.exists()) {
                  setUserData(userDoc.data() as User);
                }
              });
            }
          }}
        />
      )}
      {showQuestCreation && (
        <QuestCreation
          onClose={() => setShowQuestCreation(false)}
          customStats={userData?.customStats || []}
        />
      )}
      {showQuickImageModal && (
        <QuickImage
          currentImageUrl={userData?.quickImageUrl}
          onImageUpdate={(url) => {
            setUserData(prev => prev ? { ...prev, quickImageUrl: url } : null);
            setShowQuickImageModal(false);
          }}
          onClose={() => setShowQuickImageModal(false)}
        />
      )}
      {showHeaderImageModal && (
        <QuickImage
          currentImageUrl={userData?.headerImageUrl}
          onImageUpdate={(url) => {
            setUserData(prev => prev ? { ...prev, headerImageUrl: url } : null);
            setShowHeaderImageModal(false);
          }}
          onClose={() => setShowHeaderImageModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 