import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, DollarSign, Clock, Trophy, Target, Users, Award, Filter, Download } from 'lucide-react';
import { useTeamPerformance, DateRange, PerformanceMetrics } from '../../hooks/useTeamPerformance';
import { DateRangeSelector } from './DateRangeSelector';
import { PerformanceCard } from './PerformanceCard';
import { PerformanceChart } from './PerformanceChart';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

interface TeamPerformanceDashboardProps {
  language?: Language;
}

export const TeamPerformanceDashboard: React.FC<TeamPerformanceDashboardProps> = ({ language = 'en' }) => {
  const { performanceMetrics, loading, error, refreshData } = useTeamPerformance();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | null>(null);
  const [sortBy, setSortBy] = useState<keyof PerformanceMetrics>('revenue_per_day');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleDateRangeChange = (dateRange: DateRange | null) => {
    setSelectedDateRange(dateRange);
    refreshData(dateRange || undefined);
  };

  // Trier les métriques
  const sortedMetrics = useMemo(() => {
    return [...performanceMetrics].sort((a, b) => {
      const aValue = a[sortBy] as number;
      const bValue = b[sortBy] as number;
      return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
    });
  }, [performanceMetrics, sortBy, sortOrder]);

  // Calculer les totaux de l'équipe
  const teamTotals = useMemo(() => {
    return performanceMetrics.reduce((totals, member) => ({
      totalStudies: totals.totalStudies + member.total_studies,
      totalRevenueWon: totals.totalRevenueWon + member.total_revenue_won,
      totalRevenueLost: totals.totalRevenueLost + member.total_revenue_lost,
      avgWinRate: totals.avgWinRate + member.win_rate,
      avgRevenuePerDay: totals.avgRevenuePerDay + member.revenue_per_day
    }), {
      totalStudies: 0,
      totalRevenueWon: 0,
      totalRevenueLost: 0,
      avgWinRate: 0,
      avgRevenuePerDay: 0
    });
  }, [performanceMetrics]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-400 to-yellow-600'; // Or
      case 1: return 'from-gray-300 to-gray-500'; // Argent
      case 2: return 'from-orange-400 to-orange-600'; // Bronze
      default: return 'from-blue-400 to-blue-600'; // Bleu par défaut
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏆';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="text-red-500">⚠️</div>
          <div>
            <h3 className="font-semibold text-red-800">Erreur</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🏆 Team Performance Dashboard</h1>
            <p className="text-blue-100 text-lg">Suivi des performances de l'équipe Sales Engineering</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{performanceMetrics.length}</div>
              <div className="text-blue-100 text-sm">{getTranslation(language, 'activeMembers')}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{teamTotals.totalStudies}</div>
              <div className="text-blue-100 text-sm">{getTranslation(language, 'totalStudies')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <DateRangeSelector
              selectedRange={selectedDateRange}
              onRangeChange={handleDateRangeChange}
              language={language}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as keyof PerformanceMetrics)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="revenue_per_day">CA par jour</option>
                <option value="total_revenue_won">CA total gagné</option>
                <option value="win_rate">Taux de gain</option>
                <option value="avg_time_per_study">Temps moyen</option>
                <option value="total_studies">Nombre d'études</option>
              </select>
            </div>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              {sortOrder === 'desc' ? '↓ ' + (language === 'en' ? 'Desc' : language === 'fr' ? 'Desc' : 'Desc') : 
               '↑ ' + (language === 'en' ? 'Asc' : language === 'fr' ? 'Asc' : 'Asc')}
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="h-4 w-4" />
              {getTranslation(language, 'export')}
            </button>
          </div>
        </div>
      </div>

      {/* Métriques globales de l'équipe */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PerformanceCard
          title={language === 'en' ? 'Total Revenue Won' : 
                 language === 'fr' ? 'CA Total Gagné' : 
                 'Ingresos Totales Ganados'}
          value={formatCurrency(teamTotals.totalRevenueWon)}
          icon={DollarSign}
          color="green"
          trend="+12%"
        />
        <PerformanceCard
          title={language === 'en' ? 'Avg Revenue/Day' : 
                 language === 'fr' ? 'CA Moyen/Jour' : 
                 'Ingresos Promedio/Día'}
          value={formatCurrency(teamTotals.avgRevenuePerDay / performanceMetrics.length)}
          icon={TrendingUp}
          color="blue"
          trend="+8%"
        />
        <PerformanceCard
          title={language === 'en' ? 'Average Win Rate' : 
                 language === 'fr' ? 'Taux de Gain Moyen' : 
                 'Tasa de Ganancia Promedio'}
          value={`${formatNumber(teamTotals.avgWinRate / performanceMetrics.length)}%`}
          icon={Target}
          color="purple"
          trend="+5%"
        />
        <PerformanceCard
          title={language === 'en' ? 'Total Studies' : 
                 language === 'fr' ? 'Études Totales' : 
                 'Estudios Totales'}
          value={teamTotals.totalStudies.toString()}
          icon={Users}
          color="orange"
          trend="+15%"
        />
      </div>

      {/* Graphiques de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceChart
          title={language === 'en' ? 'Revenue per Day - Top Performers' : 
                 language === 'fr' ? 'CA par Jour - Top Performers' : 
                 'Ingresos por Día - Mejores Rendimientos'}
          data={sortedMetrics.slice(0, 5)}
          dataKey="revenue_per_day"
          color="#3b82f6"
          formatter={formatCurrency}
        />
        <PerformanceChart
          title={language === 'en' ? 'Win Rate by Member' : 
                 language === 'fr' ? 'Taux de Gain par Membre' : 
                 'Tasa de Ganancia por Miembro'}
          data={sortedMetrics}
          dataKey="win_rate"
          color="#10b981"
          formatter={(value) => `${formatNumber(value)}%`}
        />
      </div>

      {/* Leaderboard des performances */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="h-6 w-6 text-yellow-500" />
            {language === 'en' ? 'Leaderboard - Team Performance' : 
             language === 'fr' ? 'Leaderboard - Performance Équipe' : 
             'Clasificación - Rendimiento del Equipo'}
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {sortedMetrics.map((member, index) => (
            <div
              key={member.user_id}
              className={`p-6 hover:bg-gray-50 transition-colors ${
                index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Rang et avatar */}
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRankColor(index)} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {index + 1}
                    </div>
                    <div className="text-2xl">{getRankIcon(index)}</div>
                  </div>

                  {/* Informations du membre */}
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{member.full_name}</h3>
                    <p className="text-gray-600 text-sm">{member.email}</p>
                  </div>
                </div>

                {/* Métriques principales */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(member.revenue_per_day)}</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {language === 'en' ? 'Revenue/Day' : 
                       language === 'fr' ? 'CA/Jour' : 
                       'Ingresos/Día'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(member.total_revenue_won)}</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {language === 'en' ? 'Revenue Won' : 
                       language === 'fr' ? 'CA Gagné' : 
                       'Ingresos Ganados'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(member.win_rate)}%</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {language === 'en' ? 'Win Rate' : 
                       language === 'fr' ? 'Taux Gain' : 
                       'Tasa Ganancia'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(member.avg_time_per_study)}d</div>
                    <div className="text-xs text-gray-500 font-medium">
                      {language === 'en' ? 'Avg Time' : 
                       language === 'fr' ? 'Temps Moy.' : 
                       'Tiempo Prom.'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Métriques détaillées */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {language === 'en' ? 'Studies: ' : 
                       language === 'fr' ? 'Études: ' : 
                       'Estudios: '}
                    </span>
                    <span className="font-semibold">{member.total_studies}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {language === 'en' ? 'Won: ' : 
                       language === 'fr' ? 'Gagnées: ' : 
                       'Ganados: '}
                    </span>
                    <span className="font-semibold text-green-600">{member.won_studies}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {language === 'en' ? 'Lost: ' : 
                       language === 'fr' ? 'Perdues: ' : 
                       'Perdidos: '}
                    </span>
                    <span className="font-semibold text-red-600">{member.lost_studies}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {language === 'en' ? 'In progress: ' : 
                       language === 'fr' ? 'En cours: ' : 
                       'En progreso: '}
                    </span>
                    <span className="font-semibold text-yellow-600">{member.in_progress_studies}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600">
                      {language === 'en' ? 'Avg Revenue: ' : 
                       language === 'fr' ? 'CA Moy: ' : 
                       'Ingresos Prom: '}
                    </span>
                    <span className="font-semibold">{formatCurrency(member.avg_revenue_per_study)}</span>
                  </div>
                </div>
              </div>

              {/* Barre de progression du taux de gain */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {language === 'en' ? 'Success rate' : 
                     language === 'fr' ? 'Taux de réussite' : 
                     'Tasa de éxito'}
                  </span>
                  <span className="font-semibold">{formatNumber(member.win_rate)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      member.win_rate >= 70 ? 'bg-green-500' :
                      member.win_rate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(member.win_rate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};