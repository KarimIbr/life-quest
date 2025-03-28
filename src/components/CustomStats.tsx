import { useState, useEffect } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

interface CustomStat {
  name: string;
  value: number;
  icon?: string;
}

interface CustomStatsProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const CustomStats = ({ onClose, isModal = false }: CustomStatsProps) => {
  const [customStats, setCustomStats] = useState<CustomStat[]>([]);
  const [newStatName, setNewStatName] = useState('');

  useEffect(() => {
    loadCustomStats();
  }, []);

  const loadCustomStats = async () => {
    if (!auth.currentUser) return;
    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
    if (userDoc.exists() && userDoc.data().customStats) {
      setCustomStats(userDoc.data().customStats);
    }
  };

  const addCustomStat = async () => {
    if (!newStatName.trim() || !auth.currentUser) return;

    const newStat: CustomStat = {
      name: newStatName.trim(),
      value: 10,
    };

    const updatedStats = [...customStats, newStat];
    setCustomStats(updatedStats);
    setNewStatName('');

    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      customStats: updatedStats
    });
  };

  const updateStatValue = async (index: number, newValue: number) => {
    if (!auth.currentUser) return;

    const updatedStats = [...customStats];
    updatedStats[index].value = Math.min(100, Math.max(0, newValue));
    setCustomStats(updatedStats);

    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      customStats: updatedStats
    });
  };

  const deleteStat = async (index: number) => {
    if (!auth.currentUser) return;

    const updatedStats = customStats.filter((_, i) => i !== index);
    setCustomStats(updatedStats);

    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      customStats: updatedStats
    });
  };

  const content = (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={newStatName}
          onChange={(e) => setNewStatName(e.target.value)}
          placeholder="New stat name"
          className="input flex-1"
        />
        <button
          onClick={addCustomStat}
          className="btn-primary px-4 py-2"
        >
          Add
        </button>
      </div>

      <div className="space-y-4">
        {customStats.map((stat, index) => (
          <div key={index} className="bg-surface-light rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-100 font-medium">{stat.name}</span>
              <button
                onClick={() => deleteStat(index)}
                className="text-red-500 hover:text-red-400"
              >
                Delete
              </button>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={stat.value}
                onChange={(e) => updateStatValue(index, parseInt(e.target.value))}
                className="flex-1"
              />
              <span className="text-primary font-medium w-12 text-right">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-surface rounded-xl p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-100">Custom Stats</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-300">✕</button>
          </div>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-100 mb-6">Custom Stats</h2>
      {content}
    </div>
  );
};

export default CustomStats; 