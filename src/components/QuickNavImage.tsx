import { useState } from 'react';
import { convertToDirectImageUrl, validateImage } from '../utils/imageUtils';

interface QuickNavImageProps {
  currentImageUrl?: string;
  onImageUpdate: (url: string) => void;
  onClose: () => void;
}

const QuickNavImage = ({ currentImageUrl, onImageUpdate, onClose }: QuickNavImageProps) => {
  const [imageUrl, setImageUrl] = useState(currentImageUrl || '');
  const [error, setError] = useState<string | null>(null);

  const handleUrlSubmit = async () => {
    try {
      setError(null);
      if (!imageUrl.trim()) {
        setError('Please enter an image URL');
        return;
      }

      // Convert to direct URL first
      const directUrl = convertToDirectImageUrl(imageUrl.trim());
      
      // Validate using Image loading
      const isValid = await validateImage(directUrl);
      if (!isValid) {
        setError('Invalid image URL. Please make sure it\'s a direct link to an image.');
        return;
      }

      onImageUpdate(directUrl);
    } catch (error) {
      console.error('Error setting image:', error);
      setError('Failed to set image. Please try a different URL.');
    }
  };

  const presetImages = [
    'https://i.imgur.com/rqvLd3N.jpg',
    'https://i.imgur.com/Y5wBKXR.jpg',
    'https://i.imgur.com/2Z7vvuJ.jpg',
    'https://i.imgur.com/QxZhBdE.jpg',
    'https://i.imgur.com/W3KwHJz.jpg',
    'https://i.imgur.com/9zxaFdx.jpg'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Change Image</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {/* Current Image Preview */}
          {currentImageUrl && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={currentImageUrl}
                alt="Current"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* URL Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Image URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL..."
                className="flex-1 px-4 py-2 bg-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-primary text-black rounded-lg hover:bg-primary-dark transition-colors"
              >
                Set
              </button>
            </div>
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
          </div>

          {/* Preset Images */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">
              Or choose a preset
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {presetImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => onImageUpdate(url)}
                  className="aspect-video rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                >
                  <img
                    src={url}
                    alt={`Preset ${index + 1}`}
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

export default QuickNavImage; 