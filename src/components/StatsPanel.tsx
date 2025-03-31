import { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import type { User, UserStats, CustomStat } from '../types';

interface StatsPanelProps {
  user: User | null;
  onUpdate: (updates: Partial<User>) => void;
}

const StatsPanel = ({ user, onUpdate }: StatsPanelProps) => {
  const calculateTotalStats = (baseStats: UserStats, customStats?: CustomStat[]) => {
    const totalStats = { ...baseStats };
    
    if (!customStats) return totalStats;

    customStats.forEach(substat => {
      const parentStat = substat.parentStat.toLowerCase() as keyof UserStats;
      if (parentStat in totalStats) {
        const boostValue = substat.value * (substat.boostRatio || 1);
        totalStats[parentStat] += boostValue;
      }
    });

    // Cap stats at 100
    Object.keys(totalStats).forEach(key => {
      totalStats[key as keyof UserStats] = Math.min(totalStats[key as keyof UserStats], 100);
    });

    return totalStats;
  };

  const handleDeleteSubstat = async (substatToDelete: CustomStat) => {
    if (!user) return;
    
    const updatedCustomStats = user.customStats?.filter(
      stat => stat.name !== substatToDelete.name || stat.parentStat !== substatToDelete.parentStat
    ) || [];
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        customStats: updatedCustomStats
      });
      onUpdate({ customStats: updatedCustomStats });
    } catch (error) {
      console.error('Error deleting substat:', error);
    }
  };

  const totalStats = user ? calculateTotalStats(user.stats, user.customStats) : null;

  // Group custom stats by their parent stat
  const groupedSubstats = user?.customStats?.reduce((acc, stat) => {
    const parentStat = stat.parentStat.toLowerCase();
    if (!acc[parentStat]) {
      acc[parentStat] = [];
    }
    acc[parentStat].push(stat);
    return acc;
  }, {} as Record<string, CustomStat[]>) || {};

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-100">Stats</h2>
        <button
          onClick={() => onUpdate({ showAddSubstatModal: true })}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <span>+</span>
          <span>Add Substat</span>
        </button>
      </div>
      <div className="space-y-6">
        {/* Physical */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Physical</span>
            <span className="text-primary">{Math.floor(totalStats?.physical || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.physical || 0}%` }}
            />
          </div>
          {/* Physical Substats */}
          {groupedSubstats['physical']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mental */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Mental</span>
            <span className="text-primary">{Math.floor(totalStats?.mental || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.mental || 0}%` }}
            />
          </div>
          {/* Mental Substats */}
          {groupedSubstats['mental']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Creativity */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Creativity</span>
            <span className="text-primary">{Math.floor(totalStats?.creativity || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.creativity || 0}%` }}
            />
          </div>
          {/* Creativity Substats */}
          {groupedSubstats['creativity']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Spiritual */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Spiritual</span>
            <span className="text-primary">{Math.floor(totalStats?.spiritual || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.spiritual || 0}%` }}
            />
          </div>
          {/* Spiritual Substats */}
          {groupedSubstats['spiritual']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Social */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Social</span>
            <span className="text-primary">{Math.floor(totalStats?.social || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.social || 0}%` }}
            />
          </div>
          {/* Social Substats */}
          {groupedSubstats['social']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Knowledge */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-300">Knowledge</span>
            <span className="text-primary">{Math.floor(totalStats?.knowledge || 0)}</span>
          </div>
          <div className="h-2 bg-surface-light rounded-full mb-2">
            <div 
              className="h-full bg-primary rounded-full" 
              style={{ width: `${totalStats?.knowledge || 0}%` }}
            />
          </div>
          {/* Knowledge Substats */}
          {groupedSubstats['knowledge']?.map((substat) => (
            <div key={substat.name} className="ml-4 flex items-center justify-between text-sm group">
              <div className="flex items-center gap-2">
                <span>{substat.icon}</span>
                <span className="text-gray-400">{substat.name}</span>
                <span className="text-xs text-gray-500">({(substat.boostRatio || 1) * 100}%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">+{substat.value}</span>
                <button
                  onClick={() => handleDeleteSubstat(substat)}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 transition-opacity"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsPanel; 