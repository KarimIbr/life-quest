import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const THEME_COLORS = [
  { name: 'Emerald', value: '#4ADE80', hoverValue: '#22C55E' },
  { name: 'Purple', value: '#A855F7', hoverValue: '#9333EA' },
  { name: 'Gold', value: '#F59E0B', hoverValue: '#D97706' },
  { name: 'Blue', value: '#3B82F6', hoverValue: '#2563EB' },
  { name: 'Rose', value: '#F43F5E', hoverValue: '#E11D48' },
  { name: 'Cyan', value: '#06B6D4', hoverValue: '#0891B2' }
];

interface ThemeSettingsProps {
  onClose: () => void;
}

export const ThemeSettings = ({ onClose }: ThemeSettingsProps) => {
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].value);
  const [customColor, setCustomColor] = useState('');
  const [selectedBorderColor, setSelectedBorderColor] = useState(THEME_COLORS[0].value);
  const [customBorderColor, setCustomBorderColor] = useState('');
  const [showBorders, setShowBorders] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [borderError, setBorderError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserTheme = async () => {
      if (!auth.currentUser) return;
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.themeColor) {
          setSelectedColor(data.themeColor);
          setCustomColor(data.themeColor);
        }
        if (data.borderColor) {
          setSelectedBorderColor(data.borderColor);
          setCustomBorderColor(data.borderColor);
        }
        if (data.showBorders !== undefined) {
          setShowBorders(data.showBorders);
        }
        applyThemeColor(data.themeColor || THEME_COLORS[0].value, data.borderColor || THEME_COLORS[0].value, data.showBorders ?? true);
      }
    };
    loadUserTheme();
  }, []);

  const applyThemeColor = (color: string, borderColor: string, bordersEnabled: boolean) => {
    const root = document.documentElement;
    
    // Calculate hover color (slightly darker)
    const darkerColor = adjustColor(color, -20);
    
    root.style.setProperty('--color-primary', color);
    root.style.setProperty('--color-primary-hover', darkerColor);
    
    // Update button styles
    const style = document.createElement('style');
    style.textContent = `
      .btn-primary {
        background-color: ${color};
      }
      .btn-primary:hover {
        background-color: ${darkerColor};
      }
      .text-primary {
        color: ${color};
      }
      .bg-primary {
        background-color: ${color};
      }
      .border-primary {
        border-color: ${borderColor};
      }
      .card {
        border: ${bordersEnabled ? `2px solid ${borderColor}` : 'none'};
      }
      .panel {
        border: ${bordersEnabled ? `2px solid ${borderColor}` : 'none'};
      }
      .section {
        border: ${bordersEnabled ? `2px solid ${borderColor}` : 'none'};
      }
    `;
    
    // Remove any previous dynamic styles
    const existingStyle = document.getElementById('theme-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'theme-styles';
    document.head.appendChild(style);
  };

  const handleColorChange = async (color: string) => {
    if (!auth.currentUser) return;
    setSelectedColor(color);
    setCustomColor(color);
    applyThemeColor(color, selectedBorderColor, showBorders);
    
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      themeColor: color
    });
  };

  const handleBorderColorChange = async (color: string) => {
    if (!auth.currentUser) return;
    setSelectedBorderColor(color);
    setCustomBorderColor(color);
    applyThemeColor(selectedColor, color, showBorders);
    
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      borderColor: color
    });
  };

  const handleBorderToggle = async () => {
    if (!auth.currentUser) return;
    const newShowBorders = !showBorders;
    setShowBorders(newShowBorders);
    applyThemeColor(selectedColor, selectedBorderColor, newShowBorders);
    
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      showBorders: newShowBorders
    });
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomColor(color);
    if (isValidHexColor(color)) {
      setError(null);
      handleColorChange(color);
    } else {
      setError('Please enter a valid hex color (e.g., #FF0000)');
    }
  };

  const handleCustomBorderColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value;
    setCustomBorderColor(color);
    if (isValidHexColor(color)) {
      setBorderError(null);
      handleBorderColorChange(color);
    } else {
      setBorderError('Please enter a valid hex color (e.g., #FF0000)');
    }
  };

  const isValidHexColor = (color: string): boolean => {
    return /^#[0-9A-F]{6}$/i.test(color);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Theme Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {/* Accent Color Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-3">Accent Color</h3>
            <div className="grid grid-cols-3 gap-3">
              {THEME_COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.value)}
                  className={`h-12 rounded-lg flex items-center justify-center transition-all ${
                    selectedColor === color.value ? 'ring-2 ring-offset-2 ring-offset-surface ring-white' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                >
                  {selectedColor === color.value && (
                    <span className="text-white text-lg">✓</span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-3">
              <input
                type="color"
                value={customColor}
                onChange={handleCustomColorChange}
                className="h-12 w-12 rounded-lg cursor-pointer"
              />
              <input
                type="text"
                value={customColor}
                onChange={handleCustomColorChange}
                placeholder="#000000"
                className="flex-1 px-4 py-2 bg-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Border Settings Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Border Settings</h3>
              <button
                onClick={handleBorderToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showBorders ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showBorders ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {showBorders && (
              <>
                <div className="grid grid-cols-3 gap-3">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={`border-${color.name}`}
                      onClick={() => handleBorderColorChange(color.value)}
                      className={`h-12 rounded-lg flex items-center justify-center transition-all ${
                        selectedBorderColor === color.value ? 'ring-2 ring-offset-2 ring-offset-surface ring-white' : ''
                      }`}
                      style={{ backgroundColor: color.value }}
                    >
                      {selectedBorderColor === color.value && (
                        <span className="text-white text-lg">✓</span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3 mt-3">
                  <input
                    type="color"
                    value={customBorderColor}
                    onChange={handleCustomBorderColorChange}
                    className="h-12 w-12 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customBorderColor}
                    onChange={handleCustomBorderColorChange}
                    placeholder="#000000"
                    className="flex-1 px-4 py-2 bg-surface-light rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {borderError && (
                  <p className="mt-2 text-sm text-red-500">{borderError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
  const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
  const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export default ThemeSettings; 