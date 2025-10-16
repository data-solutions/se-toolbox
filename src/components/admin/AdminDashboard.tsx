import React from 'react';
import { useState } from 'react';
import { Users, Shield, Activity, Database, TrendingUp, UserCheck, AlertTriangle, Clock } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { UserManagement } from './UserManagement';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

interface AdminDashboardProps {
  language?: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ language = 'en' }) => {
  const { users, roles, loading } = useUsers();

  const stats = [
    {
      name: getTranslation(language, 'totalUsers'),
      value: users.length,
      icon: Users,
      color: 'blue',
      change: '+12%',
      changeType: 'increase',
    },
    {
      name: getTranslation(language, 'activeUsers'),
      value: users.filter(u => u.is_active).length,
      icon: UserCheck,
      color: 'green',
      change: '+5%',
      changeType: 'increase',
    },
    {
      name: getTranslation(language, 'availableRoles'),
      value: roles.length,
      icon: Shield,
      color: 'purple',
      change: '0%',
      changeType: 'neutral',
    },
    {
      name: getTranslation(language, 'administrators'),
      value: users.filter(u => u.role_name === 'Administrator').length,
      icon: Database,
      color: 'red',
      change: '0%',
      changeType: 'neutral',
    },
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'bg-blue-50',
        icon: 'bg-blue-100 text-blue-600',
        text: 'text-blue-600'
      },
      green: {
        bg: 'bg-green-50',
        icon: 'bg-green-100 text-green-600',
        text: 'text-green-600'
      },
      purple: {
        bg: 'bg-purple-50',
        icon: 'bg-purple-100 text-purple-600',
        text: 'text-purple-600'
      },
      red: {
        bg: 'bg-red-50',
        icon: 'bg-red-100 text-red-600',
        text: 'text-red-600'
      }
    };
    return colors[color as keyof typeof colors];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{getTranslation(language, 'dashboard')}</h1>
          <p className="text-gray-600 mt-1">{getTranslation(language, 'platformOverview')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
            {getTranslation(language, 'export')}
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {getTranslation(language, 'newReport')}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const colors = getColorClasses(stat.color);
          return (
            <div key={stat.name} className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'increase' ? 'text-green-600' : 
                      stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">{getTranslation(language, 'vsLastMonth')}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${colors.icon}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{getTranslation(language, 'recentActivity')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">3 {getTranslation(language, 'newUsersThisWeek')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">15 {getTranslation(language, 'connectionsToday')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-gray-600">2 {getTranslation(language, 'rolesUpdated')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{getTranslation(language, 'alerts')}</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">2 {getTranslation(language, 'inactiveAccounts30Days')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">1 {getTranslation(language, 'expiredSession')}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">{getTranslation(language, 'quickActions')}</h3>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              {getTranslation(language, 'createUser')}
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              {getTranslation(language, 'exportData')}
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
              {getTranslation(language, 'managePermissions')}
            </button>
          </div>
        </div>
      </div>

      {/* User Management */}
      <UserManagement />
    </div>
  );
};