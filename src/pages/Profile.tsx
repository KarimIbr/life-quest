import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';
import ThemeSettings from '../components/ThemeSettings';
import AvatarUpload from '../components/AvatarUpload';
import BannerUpload from '../components/BannerUpload';
import QuickNavImage from '../components/QuickNavImage';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showQuickNavModal, setShowQuickNavModal] = useState(false);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="card">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="relative group">
            <div 
              className="w-32 h-32 rounded-lg overflow-hidden bg-surface-light cursor-pointer"
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
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-100 mb-2">
              {userData?.displayName}
            </h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Level</span>
                <span className="text-primary font-bold">{userData?.level}</span>
              </div>
              <div className="flex items-center gap-2 flex-1">
                <div className="h-2 bg-surface-light rounded-full flex-1">
                  <div 
                    className="h-full bg-primary rounded-full"
                    style={{
                      width: `${((userData?.experience || 0) / ((userData?.level || 1) * 1000)) * 100}%`
                    }}
                  />
                </div>
                <span className="text-gray-400 text-sm">
                  {userData?.experience}/{(userData?.level || 1) * 1000} XP
                </span>
              </div>
            </div>
            <div className="flex gap-2">
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
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Profile Images</h2>
        <div className="grid grid-cols-2 gap-6">
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
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Stats Management</h2>
        <div className="grid grid-cols-2 gap-6">
          {/* Main Stats */}
          <div>
            <h3 className="text-lg font-medium text-gray-300 mb-4">Main Stats</h3>
            <div className="space-y-4">
              {Object.entries(userData?.stats || {}).map(([stat, value]) => (
                <div key={stat} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300 capitalize">{stat}</span>
                    <span className="text-primary">{value}</span>
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
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{stat.name}</span>
                    <span className="text-primary">{stat.value}</span>
                  </div>
                  <div className="h-2 bg-surface-light rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${stat.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <button className="btn-secondary w-full">Add Custom Stat</button>
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
      {showThemeModal && (
        <ThemeSettings onClose={() => setShowThemeModal(false)} />
      )}
      {showBannerModal && (
        <BannerUpload
          currentBannerUrl={userData?.bannerUrl}
          onBannerUpdate={(url) => {
            setUserData(prev => prev ? { ...prev, bannerUrl: url } : null);
            setShowBannerModal(false);
          }}
          onClose={() => setShowBannerModal(false)}
        />
      )}
      {showQuickNavModal && (
        <QuickNavImage
          currentImageUrl={userData?.quickImageUrl}
          onImageUpdate={(url) => {
            setUserData(prev => prev ? { ...prev, quickImageUrl: url } : null);
            setShowQuickNavModal(false);
          }}
          onClose={() => setShowQuickNavModal(false)}
        />
      )}
    </div>
  );
};

export default Profile; 