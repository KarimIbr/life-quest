import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarUpdate: (url: string) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  '/avatars/default1.png',
  '/avatars/default2.png',
  '/avatars/default3.png',
  '/avatars/default4.png',
];

export const AvatarUpload = ({ currentAvatarUrl, onAvatarUpdate, onClose }: AvatarUploadProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Validate the URL is an image
      const response = await fetch(imageUrl);
      const contentType = response.headers.get('content-type');
      
      if (!contentType?.startsWith('image/')) {
        throw new Error('Please provide a valid image URL');
      }

      // Update user document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        avatarUrl: imageUrl
      });

      onAvatarUpdate(imageUrl);
      onClose();
    } catch (err) {
      console.error('Error setting avatar:', err);
      setError('Failed to set avatar. Please provide a valid image URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = async (avatarUrl: string) => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        avatarUrl
      });
      onAvatarUpdate(avatarUrl);
      onClose();
    } catch (err) {
      console.error('Error setting preset avatar:', err);
      setError('Failed to set avatar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Change Avatar</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Current Avatar */}
          {currentAvatarUrl && (
            <div className="flex justify-center">
              <img
                src={currentAvatarUrl}
                alt="Current avatar"
                className="w-24 h-24 rounded-full object-cover"
              />
            </div>
          )}

          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Image URL
            </label>
            <form onSubmit={handleUrlSubmit} className="space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-2 bg-surface-light rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Setting Avatar...' : 'Set Avatar'}
              </button>
            </form>
          </div>

          {/* Preset Avatars */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Choose a Preset
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  onClick={() => handlePresetSelect(avatar)}
                  className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={avatar}
                    alt="Preset avatar"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload; 