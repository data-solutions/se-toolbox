import React from 'react';
import { PerformanceMetrics } from '../../hooks/useTeamPerformance';

interface PerformanceChartProps {
  title: string;
  data: PerformanceMetrics[];
  dataKey: keyof PerformanceMetrics;
  color: string;
  formatter: (value: number) => string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  data,
  dataKey,
  color,
  formatter
}) => {
  const maxValue = Math.max(...data.map(item => item[dataKey] as number));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      <div className="space-y-4">
        {data.map((member, index) => {
          const value = member[dataKey] as number;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={member.user_id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    {member.full_name.split(' ')[0]} {member.full_name.split(' ')[1]?.[0]}.
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {formatter(value)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: color
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};