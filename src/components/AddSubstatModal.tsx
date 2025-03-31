import { useState } from 'react';
import { doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { CustomStat, UserStats } from '../types';

const MAIN_STATS: { key: keyof UserStats; label: string; icon: string }[] = [
  { key: 'physical', label: 'Physical', icon: '🏃' },
  { key: 'mental', label: 'Mental', icon: '🧠' },
  { key: 'creativity', label: 'Creativity', icon: '🎨' },
  { key: 'spiritual', label: 'Spiritual', icon: '🌟' },
  { key: 'social', label: 'Social', icon: '👥' },
  { key: 'knowledge', label: 'Knowledge', icon: '📚' },
];

const PRESET_ICONS = ['📈', '⚔️', '🎮', '🎨', '📝', '🎥', '🎭', '🎪', '🎯', '🎲', '📚', '💻', '🎹', '🎸'];

interface AddSubstatModalProps {
  onClose: () => void;
  onAdd: (stat: CustomStat) => void;
}

export const AddSubstatModal = ({ onClose, onAdd }: AddSubstatModalProps) => {
  const [name, setName] = useState('');
  const [selectedParentStat, setSelectedParentStat] = useState<keyof UserStats | ''>('');
  const [selectedIcon, setSelectedIcon] = useState('📈');
  const [boostRatio, setBoostRatio] = useState(0.1);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Please enter a name for your substat');
      return;
    }

    if (!selectedParentStat) {
      setError('Please select a parent stat');
      return;
    }

    if (!auth.currentUser) return;

    const newStat: CustomStat = {
      name: name.trim(),
      value: 10, // Starting value
      icon: selectedIcon,
      parentStat: selectedParentStat,
      boostRatio,
    };

    try {
      // Get current user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const userData = userDoc.data();
      
      if (!userData) {
        throw new Error('User data not found');
      }

      // Ensure stats object exists
      const currentStats = userData.stats || {
        physical: 0,
        mental: 0,
        creativity: 0,
        spiritual: 0,
        social: 0,
        knowledge: 0
      };

      // Calculate initial contribution to parent stat
      const initialContribution = newStat.value * boostRatio;
      const currentParentValue = currentStats[selectedParentStat] || 0;
      const newParentValue = Math.min(100, currentParentValue + initialContribution);

      // Update both customStats array and parent stat value
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        customStats: arrayUnion(newStat),
        stats: {
          ...currentStats,
          [selectedParentStat]: newParentValue
        }
      });

      onAdd(newStat);
      onClose();
    } catch (error) {
      console.error('Error adding custom stat:', error);
      setError('Failed to add custom stat');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Add Custom Stat</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stat Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Content Creation"
              className="input w-full"
            />
          </div>

          {/* Parent Stat Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Parent Stat
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MAIN_STATS.map((stat) => (
                <button
                  key={stat.key}
                  onClick={() => setSelectedParentStat(stat.key)}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    selectedParentStat === stat.key
                      ? 'bg-primary text-white'
                      : 'bg-surface-light hover:bg-surface-light/80 text-gray-300'
                  }`}
                >
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`h-10 rounded-lg flex items-center justify-center text-xl transition-colors ${
                    selectedIcon === icon
                      ? 'bg-primary text-white'
                      : 'bg-surface-light hover:bg-surface-light/80'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Boost Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contribution to Parent Stat
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={boostRatio * 100}
                onChange={(e) => setBoostRatio(parseInt(e.target.value) / 100)}
                className="flex-1"
              />
              <span className="text-primary font-medium w-12 text-right">
                {Math.round(boostRatio * 100)}%
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              How much this substat contributes to its parent stat when improved
            </p>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full"
          >
            Add Custom Stat
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubstatModal; 