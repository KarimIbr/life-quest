import { Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import type { User, UserStats } from '../types';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  userStats: User;
}

type StatKey = keyof UserStats;

export const RadarChart = ({ userStats }: RadarChartProps) => {
  const mainStats = [
    { key: 'physical' as StatKey, icon: '💪' },
    { key: 'mental' as StatKey, icon: '🧠' },
    { key: 'creativity' as StatKey, icon: '🎨' },
    { key: 'spiritual' as StatKey, icon: '✨' },
    { key: 'social' as StatKey, icon: '👥' },
    { key: 'knowledge' as StatKey, icon: '📚' },
  ];

  const calculateTotalStats = (baseStats: UserStats, customStats?: Array<{ parentStat: string; value: number; boostRatio?: number }>) => {
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

  const totalStats = calculateTotalStats(userStats.stats, userStats.customStats);

  const chartData = {
    labels: mainStats.map(stat => `${stat.icon} ${stat.key.charAt(0).toUpperCase() + stat.key.slice(1)}`),
    datasets: [
      {
        label: 'Stats',
        data: mainStats.map(stat => totalStats[stat.key]),
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(54, 162, 235, 1)',
        pointRadius: 4,
      },
    ],
  };

  const options = {
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.9)',
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 10,
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.6)',
        },
        beginAtZero: true,
        min: 0,
        max: 100,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'rgba(255, 255, 255, 1)',
        bodyColor: 'rgba(255, 255, 255, 1)',
        padding: 12,
        displayColors: false,
      },
    },
    elements: {
      line: {
        borderWidth: 2,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-[#1E2024] p-6 rounded-xl">
      <div className="h-[500px] flex items-center justify-center">
        <Radar data={chartData} options={options} />
      </div>
    </div>
  );
}; 