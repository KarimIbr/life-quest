import { User } from '../types';

interface RadarChartProps {
  stats: User;
}

export const RadarChart = ({ stats }: RadarChartProps) => {
  const mainStats = [
    { key: 'Physical', icon: '💪' },
    { key: 'Mental', icon: '🧠' },
    { key: 'Creativity', icon: '🎨' },
    { key: 'Spiritual', icon: '✨' },
    { key: 'Social', icon: '🤝' },
    { key: 'Knowledge', icon: '📚' },
  ];

  // Calculate the maximum value for scaling
  const maxValue = Math.max(...mainStats.map(stat => stats[stat.key as keyof User] as number));

  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      {/* Hexagon background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full border-2 border-gray-700 rounded-lg transform rotate-45"></div>
      </div>

      {/* Stats */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full h-full p-4">
          {mainStats.map((stat, index) => {
            const value = stats[stat.key as keyof User] as number;
            const percentage = (value / maxValue) * 100;
            const angle = (index * 60) - 90; // Start from top (-90 degrees)
            const radius = 40; // Percentage from center

            // Calculate position
            const x = 50 + radius * Math.cos(angle * Math.PI / 180);
            const y = 50 + radius * Math.sin(angle * Math.PI / 180);

            return (
              <div
                key={stat.key}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                }}
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl mb-1">{stat.icon}</span>
                  <span className="text-sm text-gray-300">{value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}; 