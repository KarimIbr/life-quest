import { useState } from 'react';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { UserStats, CustomStat } from '../types';

interface QuestCreationProps {
  onClose: () => void;
  customStats: CustomStat[];
}

const DIFFICULTY_LEVELS = [
  { label: 'Easy', value: 'easy', xp: 50 },
  { label: 'Medium', value: 'medium', xp: 100 },
  { label: 'Hard', value: 'hard', xp: 200 },
];

const MAIN_STATS = [
  { key: 'physical', name: 'Physical', icon: '🏃' },
  { key: 'mental', name: 'Mental', icon: '🧠' },
  { key: 'creativity', name: 'Creativity', icon: '🎨' },
  { key: 'spiritual', name: 'Spiritual', icon: '🌟' },
  { key: 'social', name: 'Social', icon: '👥' },
  { key: 'knowledge', name: 'Knowledge', icon: '📚' },
] as const;

const QUEST_TYPES = [
  { value: 'daily', label: 'Daily Quest', icon: '📅' },
  { value: 'weekly', label: 'Weekly Quest', icon: '📆' },
  { value: 'achievement', label: 'Achievement', icon: '🏆' },
  { value: 'habit', label: 'Habit', icon: '🔄' },
];

export const QuestCreation = ({ onClose, customStats }: QuestCreationProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState(DIFFICULTY_LEVELS[0].value);
  const [type, setType] = useState(QUEST_TYPES[0].value);
  const [selectedStats, setSelectedStats] = useState<Record<string, number>>({});
  const [selectedSubstats, setSelectedSubstats] = useState<Record<string, number>>({});
  const [error, setError] = useState('');

  const handleStatChange = (statKey: string, value: number) => {
    setSelectedStats(prev => ({
      ...prev,
      [statKey]: value
    }));
  };

  const handleSubstatChange = (substatName: string, value: number) => {
    setSelectedSubstats(prev => ({
      ...prev,
      [substatName]: value
    }));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Please enter a quest title');
      return;
    }

    if (!auth.currentUser) return;

    try {
      const questData = {
        title: title.trim(),
        description: description.trim(),
        difficulty,
        type,
        experience: DIFFICULTY_LEVELS.find(d => d.value === difficulty)?.xp || 50,
        statBoosts: selectedStats,
        substatBoosts: selectedSubstats,
        userId: auth.currentUser.uid,
        completed: false,
        createdAt: serverTimestamp(),
        completedAt: null,
      };

      await addDoc(collection(db, 'quests'), questData);
      onClose();
    } catch (error) {
      console.error('Error creating quest:', error);
      setError('Failed to create quest');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-100">Create New Quest</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quest Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning Workout"
                className="input w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your quest..."
                className="input w-full h-24 resize-none"
              />
            </div>
          </div>

          {/* Quest Type & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quest Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {QUEST_TYPES.map((questType) => (
                  <button
                    key={questType.value}
                    onClick={() => setType(questType.value)}
                    className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                      type === questType.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-light hover:bg-surface-light/80 text-gray-300'
                    }`}
                  >
                    <span>{questType.icon}</span>
                    <span>{questType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setDifficulty(level.value)}
                    className={`p-2 rounded-lg transition-colors ${
                      difficulty === level.value
                        ? 'bg-primary text-white'
                        : 'bg-surface-light hover:bg-surface-light/80 text-gray-300'
                    }`}
                  >
                    {level.label}
                    <div className="text-xs opacity-75">+{level.xp} XP</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stat Boosts */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stat Boosts
            </label>
            <div className="grid grid-cols-2 gap-4">
              {MAIN_STATS.map((stat) => (
                <div key={stat.key} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span>{stat.icon}</span>
                    <span className="text-gray-300">{stat.name}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={selectedStats[stat.key] || 0}
                    onChange={(e) => handleStatChange(stat.key, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-right text-sm text-primary">
                    +{selectedStats[stat.key] || 0}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Substat Boosts */}
          {customStats.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Substat Boosts
              </label>
              <div className="grid grid-cols-2 gap-4">
                {customStats.map((stat) => (
                  <div key={stat.name} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span>{stat.icon}</span>
                      <span className="text-gray-300">{stat.name}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={selectedSubstats[stat.name] || 0}
                      onChange={(e) => handleSubstatChange(stat.name, parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-right text-sm text-primary">
                      +{selectedSubstats[stat.name] || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="btn-primary w-full"
          >
            Create Quest
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestCreation; 