import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { convertToDirectImageUrl, validateImage } from '../utils/imageUtils';

interface BannerUploadProps {
  currentBannerUrl?: string;
  onBannerUpdate: (url: string) => void;
  onClose: () => void;
}

const PRESET_BANNERS = [
  '/banners/default1.jpg',
  '/banners/default2.jpg',
  '/banners/default3.jpg',
  '/banners/default4.jpg',
];

export const BannerUpload = ({ currentBannerUrl, onBannerUpdate, onClose }: BannerUploadProps) => {
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl || !auth.currentUser) return;

    setLoading(true);
    setError(null);

    try {
      // Convert to direct URL first
      const directUrl = convertToDirectImageUrl(imageUrl.trim());
      
      // Validate using Image loading
      const isValid = await validateImage(directUrl);
      if (!isValid) {
        throw new Error('Please provide a valid image URL');
      }

      // Update user document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        bannerUrl: directUrl
      });

      onBannerUpdate(directUrl);
      onClose();
    } catch (err) {
      console.error('Error setting banner:', err);
      setError('Failed to set banner. Please provide a valid image URL.');
    } finally {
      setLoading(false);
    }
  };

  const handlePresetSelect = async (bannerUrl: string) => {
    if (!auth.currentUser) return;

    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        bannerUrl
      });
      onBannerUpdate(bannerUrl);
      onClose();
    } catch (err) {
      console.error('Error setting preset banner:', err);
      setError('Failed to set banner');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Change Banner</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Current Banner */}
          {currentBannerUrl && (
            <div className="flex justify-center">
              <img
                src={currentBannerUrl}
                alt="Current banner"
                className="w-full h-32 rounded-lg object-cover"
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
                {loading ? 'Setting Banner...' : 'Set Banner'}
              </button>
            </form>
          </div>

          {/* Preset Banners */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Or Choose a Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_BANNERS.map((bannerUrl) => (
                <button
                  key={bannerUrl}
                  onClick={() => handlePresetSelect(bannerUrl)}
                  className="aspect-video rounded-lg overflow-hidden group relative"
                >
                  <img
                    src={bannerUrl}
                    alt="Preset banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all">
                    <span className="text-white opacity-0 group-hover:opacity-100">
                      Select
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerUpload; 