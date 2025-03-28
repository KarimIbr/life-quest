import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';
import QuickNavImage from './QuickNavImage';

const Layout = () => {
  const [user] = useAuthState(auth);
  const [userData, setUserData] = useState<User | null>(null);
  const [showTopImageModal, setShowTopImageModal] = useState(false);
  const [showSideImageModal, setShowSideImageModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as User);
      }
    };
    fetchUserData();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  const handleTopImageUpdate = async (url: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      topImageUrl: url
    });
    setUserData(prev => prev ? { ...prev, topImageUrl: url } : null);
    setShowTopImageModal(false);
  };

  const handleSideImageUpdate = async (url: string) => {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), {
      sideImageUrl: url
    });
    setUserData(prev => prev ? { ...prev, sideImageUrl: url } : null);
    setShowSideImageModal(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Image */}
      {userData?.bannerUrl && (
        <div className="w-full h-48 relative">
          <img
            src={userData.bannerUrl}
            alt="Banner"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-surface-dark">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4">
            <Link to="/" className="text-2xl font-bold text-primary">
              Life Quest
            </Link>
          </div>

          {/* Top Image Panel */}
          <div className="px-4 mb-4">
            <div 
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-video"
              onClick={() => setShowTopImageModal(true)}
            >
              {userData?.topImageUrl ? (
                <img
                  src={userData.topImageUrl}
                  alt="Top Image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-light flex items-center justify-center">
                  <span className="text-gray-400">Add Top Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Image
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/') ? 'bg-primary text-black' : 'text-gray-300 hover:bg-surface'
                  }`}
                >
                  <span>🏠</span>
                  <span>Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/quests"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/quests') ? 'bg-primary text-black' : 'text-gray-300 hover:bg-surface'
                  }`}
                >
                  <span>⚔️</span>
                  <span>Quests</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    isActive('/profile') ? 'bg-primary text-black' : 'text-gray-300 hover:bg-surface'
                  }`}
                >
                  <span>👤</span>
                  <span>Profile</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Side Image */}
          <div className="px-4 mb-4">
            <div 
              className="relative group cursor-pointer rounded-lg overflow-hidden aspect-[3/4]"
              onClick={() => setShowSideImageModal(true)}
            >
              {userData?.sideImageUrl ? (
                <img
                  src={userData.sideImageUrl}
                  alt="Side Image"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-surface-light flex items-center justify-center">
                  <span className="text-gray-400">Add Side Image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                <span className="text-white opacity-0 group-hover:opacity-100">
                  Change Image
                </span>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="p-4 bg-surface-dark">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-black font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-200">
                  {user?.email}
                </p>
                <button
                  onClick={() => auth.signOut()}
                  className="text-xs text-gray-400 hover:text-primary"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="p-8">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      {showTopImageModal && (
        <QuickNavImage
          currentImageUrl={userData?.topImageUrl}
          onImageUpdate={handleTopImageUpdate}
          onClose={() => setShowTopImageModal(false)}
        />
      )}
      {showSideImageModal && (
        <QuickNavImage
          currentImageUrl={userData?.sideImageUrl}
          onImageUpdate={handleSideImageUpdate}
          onClose={() => setShowSideImageModal(false)}
        />
      )}
    </div>
  );
};

export default Layout; 