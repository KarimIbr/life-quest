import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User, CustomStat } from '../types';
import ThemeSettings from '../components/ThemeSettings';
import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import QuickNavImage from '../components/QuickNavImage';
import AddSubstatModal from '../components/AddSubstatModal';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showQuickNavModal, setShowQuickNavModal] = useState(false);
  const [showAddSubstatModal, setShowAddSubstatModal] = useState(false);

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
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleAddSubstat = (newStat: CustomStat) => {
    if (userData) {
      setUserData({
        ...userData,
        customStats: [...(userData.customStats || []), newStat],
        stats: {
          ...userData.stats,
          [newStat.parentStat]: Math.min(100, (userData.stats[newStat.parentStat.toLowerCase() as keyof typeof userData.stats] || 0) + (newStat.value * (newStat.boostRatio || 1)))
        }
      });
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
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Profile Header */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div 
              className="w-24 sm:w-32 h-24 sm:h-32 rounded-lg overflow-hidden bg-surface-light cursor-pointer"
              onClick={() => setShowAvatarModal(true)}
            >
              {userData?.avatarUrl ? (
                <img 
                  src={userData.avatarUrl} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-primary">
                  {userData?.displayName?.[0].toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Avatar
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              {userData?.displayName}
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Level</span>
                <span className="text-primary font-bold">{userData?.level}</span>
              </div>
              <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                <div className="h-2 bg-surface-light rounded-full flex-1 min-w-[200px]">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${((userData?.experience || 0) / ((userData?.level || 1) * 1000)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-gray-400 text-sm whitespace-nowrap">
                  {userData?.experience}/{(userData?.level || 1) * 1000} XP
                </span>
              </div>
            </div>
            <div className="flex gap-2 justify-center sm:justify-start">
              <button 
                onClick={() => setShowThemeModal(true)}
                className="btn-secondary"
              >
                Change Theme
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Images Section */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Profile Images</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Banner Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Banner Image</h3>
            <div 
              className="relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => setShowBannerModal(true)}
            >
              {userData?.bannerUrl ? (
                <img
                  src={userData.bannerUrl}
                  alt="Banner"
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-surface-light flex items-center justify-center">
                  <span className="text-gray-400">No banner image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Banner
                </span>
              </div>
            </div>
          </div>

          {/* Quick Nav Image */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Quick Nav Image</h3>
            <div 
              className="relative group cursor-pointer rounded-lg overflow-hidden"
              onClick={() => setShowQuickNavModal(true)}
            >
              {userData?.quickImageUrl ? (
                <img
                  src={userData.quickImageUrl}
                  alt="Quick Nav"
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 bg-surface-light flex items-center justify-center">
                  <span className="text-gray-400">No quick nav image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Quick Nav Image
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Management */}
      <div className="card p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Stats Management</h2>
          <button
            onClick={() => setShowAddSubstatModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <span>+</span>
            <span>Add Substat</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Main Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Main Stats</h3>
            <div className="space-y-4">
              {Object.entries(userData?.stats || {}).map(([stat, value]) => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{stat}</span>
                    <span className="text-primary">{Math.floor(value)}</span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Custom Stats</h3>
            <div className="space-y-4">
              {userData?.customStats?.map((stat, index) => (
                <div key={index} className="flex items-center justify-between text-sm group">
                  <div className="flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span className="text-gray-400">{stat.name}</span>
                    <span className="text-xs text-gray-500">({(stat.boostRatio || 1) * 100}%)</span>
                  </div>
                  <span className="text-gray-400">+{stat.value}</span>
                </div>
              ))}
              {(!userData?.customStats || userData.customStats.length === 0) && (
                <div className="text-gray-400 text-sm">No custom stats added yet</div>
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
            if (userData) {
              setUserData({ ...userData, avatarUrl: url });
            }
            setShowAvatarModal(false);
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}

      {showThemeModal && (
        <ThemeSettings
          onClose={() => setShowThemeModal(false)}
        />
      )}

      {showBannerModal && (
        <BannerUpload
          currentBannerUrl={userData?.bannerUrl}
          onBannerUpdate={(url) => {
            if (userData) {
              setUserData({ ...userData, bannerUrl: url });
            }
            setShowBannerModal(false);
          }}
          onClose={() => setShowBannerModal(false)}
        />
      )}

      {showQuickNavModal && (
        <QuickNavImage
          currentImageUrl={userData?.quickImageUrl}
          onImageUpdate={(url) => {
            if (userData) {
              setUserData({ ...userData, quickImageUrl: url });
            }
            setShowQuickNavModal(false);
          }}
          onClose={() => setShowQuickNavModal(false)}
        />
      )}

      {showAddSubstatModal && (
        <AddSubstatModal
          onClose={() => setShowAddSubstatModal(false)}
          onAdd={handleAddSubstat}
        />
      )}
    </div>
  );
};

export default Profile; 