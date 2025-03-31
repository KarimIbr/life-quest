import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import type { User, CustomStat, UserStats } from '../types';
import AvatarUpload from '../components/AvatarUpload';
import StatsPanel from '../components/StatsPanel';
import AddSubstatModal from '../components/AddSubstatModal';
import QuestCreation from '../components/QuestCreation';
import useQuests from '../hooks/useQuests';
import QuickImage from '../components/QuickImage';
import RandomQuests from '../components/RandomQuests';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showAddSubstatModal, setShowAddSubstatModal] = useState(false);
  const [showQuestCreation, setShowQuestCreation] = useState(false);
  const [showQuickImageModal, setShowQuickImageModal] = useState(false);
  const [showHeaderImageModal, setShowHeaderImageModal] = useState(false);

  const { 
    quests,
    loading: questsLoading,
    error: questsError,
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
          const data = userDoc.data();
          // Ensure all required fields exist
          const userData: User = {
            id: user.uid,
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            avatarUrl: data.avatarUrl || '',
            bannerUrl: data.bannerUrl || '',
            topImageUrl: data.topImageUrl || '',
            sideImageUrl: data.sideImageUrl || '',
            quickImageUrl: data.quickImageUrl || '',
            headerImageUrl: data.headerImageUrl || '',
            showAddSubstatModal: data.showAddSubstatModal || false,
            stats: data.stats || {
              physical: 0,
              mental: 0,
              creativity: 0,
              spiritual: 0,
              social: 0,
              knowledge: 0
            },
            customStats: data.customStats || [],
            activeQuests: data.activeQuests || [],
            experience: data.experience || 0,
            level: data.level || 1,
            createdAt: data.createdAt?.toDate() || new Date(),
            hp: data.hp || 100,
            energy: data.energy || 100,
            themeColor: data.themeColor || '',
            borderColor: data.borderColor || '',
            showBorders: data.showBorders || false
          };
          setUserData(userData);
        } else {
          // Create new user document if it doesn't exist
          const newUserData: User = {
            id: user.uid,
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            avatarUrl: '',
            bannerUrl: '',
            topImageUrl: '',
            sideImageUrl: '',
            quickImageUrl: '',
            headerImageUrl: '',
            showAddSubstatModal: false,
            stats: {
              physical: 0,
              mental: 0,
              creativity: 0,
              spiritual: 0,
              social: 0,
              knowledge: 0
            },
            customStats: [],
            activeQuests: [],
            experience: 0,
            level: 1,
            createdAt: new Date(),
            hp: 100,
            energy: 100,
            themeColor: '',
            borderColor: '',
            showBorders: false
          };
          // Convert User object to plain object for Firestore
          const firestoreData = {
            ...newUserData,
            createdAt: new Date()
          };
          await updateDoc(doc(db, 'users', user.uid), firestoreData);
          setUserData(newUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const calculateTotalStats = (baseStats: UserStats, customStats?: CustomStat[]) => {
    const totalStats = { ...baseStats };
    
    if (!customStats) return totalStats;

    customStats.forEach(substat => {
      const parentStat = substat.parentStat.toLowerCase() as keyof UserStats;
      if (parentStat in totalStats) {
        const boostValue = substat.value * (substat.boostRatio || 1);
        totalStats[parentStat] += boostValue;
      }
    });

    // Cap stats at 100
    Object.keys(totalStats).forEach(key => {
      totalStats[key as keyof UserStats] = Math.min(totalStats[key as keyof UserStats], 100);
    });

    return totalStats;
  };

  const statsData = {
    labels: ['Physical', 'Mental', 'Creativity', 'Spiritual', 'Social', 'Knowledge'],
    datasets: [
      {
        label: 'Current Stats',
        data: userData ? (() => {
          const totalStats = calculateTotalStats(userData.stats, userData.customStats);
          return [
            totalStats.physical,
            totalStats.mental,
            totalStats.creativity,
            totalStats.spiritual,
            totalStats.social,
            totalStats.knowledge,
          ];
        })() : [],
        backgroundColor: 'rgba(74, 222, 128, 0.1)',
        borderColor: 'rgba(74, 222, 128, 0.5)',
        borderWidth: 1,
        pointBackgroundColor: '#4ADE80',
        pointBorderColor: '#4ADE80',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#4ADE80',
        pointRadius: 4,
        fill: true,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        beginAtZero: true,
        min: 0,
        max: 100,
        angleLines: {
          color: 'rgba(255, 255, 255, 0.05)',
          lineWidth: 1,
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          circular: true,
        },
        pointLabels: {
          color: 'rgb(156, 163, 175)',
          font: {
            size: 16,
            family: "'Inter var', sans-serif",
            weight: 'normal'
          },
          padding: 20
        },
        ticks: {
          display: false,
          stepSize: 20,
        },
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgb(17, 24, 39)',
        titleFont: {
          size: 14,
          family: "'Inter var', sans-serif",
        },
        bodyFont: {
          size: 12,
          family: "'Inter var', sans-serif",
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    elements: {
      line: {
        tension: 0.2
      }
    },
    layout: {
      padding: 20
    }
  } as const;

  const handleAddSubstat = (newStat: CustomStat) => {
    setUserData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        customStats: [...(prev.customStats || []), newStat]
      };
    });
  };

  const handleQuickImageUpdate = async (url: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      quickImageUrl: url
    });
    setUserData(prev => prev ? { ...prev, quickImageUrl: url } : null);
    setShowQuickImageModal(false);
  };

  const handleHeaderImageUpdate = async (url: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      headerImageUrl: url
    });
    setUserData(prev => prev ? { ...prev, headerImageUrl: url } : null);
    setShowHeaderImageModal(false);
  };

  const handleUserUpdate = (updates: Partial<User>) => {
    if (!userData) return;
    setUserData({ ...userData, ...updates });
  };

  if (loading || !userData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
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
              <Radar data={statsData} options={options} />
            </div>
          </div>

          {/* Quests */}
          <div className="space-y-6">
            {/* Daily Quests */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Daily Quests</h2>
              {questsLoading ? (
                <div className="text-gray-400">Loading quests...</div>
              ) : questsError ? (
                <div className="text-red-500">{questsError}</div>
              ) : getDailyQuests().length === 0 ? (
                <div className="text-gray-400">No daily quests available</div>
              ) : (
                <div className="space-y-4">
                  {getDailyQuests().map((quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="text-primary text-sm">+{quest.rewards.experience} XP</div>
                            <div className="text-gray-400 text-sm">
                              {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                                <span key={stat} className="mr-2">
                                  +{value} {stat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => quest.id && completeQuest(quest.id)}
                          className="btn-primary text-sm"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Weekly Quests */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Quests</h2>
              {questsLoading ? (
                <div className="text-gray-400">Loading quests...</div>
              ) : questsError ? (
                <div className="text-red-500">{questsError}</div>
              ) : getWeeklyQuests().length === 0 ? (
                <div className="text-gray-400">No weekly quests available</div>
              ) : (
                <div className="space-y-4">
                  {getWeeklyQuests().map((quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="text-primary text-sm">+{quest.rewards.experience} XP</div>
                            <div className="text-gray-400 text-sm">
                              {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                                <span key={stat} className="mr-2">
                                  +{value} {stat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => quest.id && completeQuest(quest.id)}
                          className="btn-primary text-sm"
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div className="bg-surface p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-gray-100 mb-4">Achievements</h2>
              {questsLoading ? (
                <div className="text-gray-400">Loading achievements...</div>
              ) : questsError ? (
                <div className="text-red-500">{questsError}</div>
              ) : getAchievementQuests().length === 0 ? (
                <div className="text-gray-400">No achievements available</div>
              ) : (
                <div className="space-y-4">
                  {getAchievementQuests().map((quest) => (
                    <div key={quest.id} className="bg-surface-light p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-gray-100">{quest.title}</h3>
                          <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
                          <div className="flex gap-4 mt-2">
                            <div className="text-primary text-sm">+{quest.rewards.experience} XP</div>
                            <div className="text-gray-400 text-sm">
                              {Object.entries(quest.rewards.stats).map(([stat, value]) => (
                                <span key={stat} className="mr-2">
                                  +{value} {stat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        {!quest.completed && (
                          <button 
                            onClick={() => quest.id && completeQuest(quest.id)}
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
          onAdd={handleAddSubstat}
          onClose={() => setShowAddSubstatModal(false)}
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
          onImageUpdate={handleQuickImageUpdate}
          onClose={() => setShowQuickImageModal(false)}
        />
      )}
      {showHeaderImageModal && (
        <QuickImage
          currentImageUrl={userData?.headerImageUrl}
          onImageUpdate={handleHeaderImageUpdate}
          onClose={() => setShowHeaderImageModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard; 