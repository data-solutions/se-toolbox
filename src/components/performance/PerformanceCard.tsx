import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface PerformanceCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  trend?: string;
  subtitle?: string;
}

export const PerformanceCard: React.FC<PerformanceCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  subtitle
}) => {
  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-600',
        trend: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-600',
        trend: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        text: 'text-purple-600',
        trend: 'text-purple-600'
      },
      orange: {
        bg: 'bg-orange-50',
        icon: 'bg-orange-100 text-orange-600',
        text: 'text-orange-600',
        trend: 'text-orange-600'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-600',
        trend: 'text-red-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className={`${colorClasses.bg} rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses.icon}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`text-sm font-semibold ${colorClasses.trend}`}>
            {trend}
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
        <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
        {subtitle && (
          <p className="text-xs text-gray-500">{subtitle}</p>
        )}
      </div>
    </div>
  );
};