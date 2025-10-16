import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  username: string;
}

interface APStudy {
  id: string;
  ap_number: string;
  assigned_to: string;
  status: 'pending' | 'in_progress' | 'completed' | 'won' | 'lost';
  start_date: string;
  end_date: string;
  time_spent_days: number;
  opportunity_value: number;
  client_name: string;
  description: string;
  created_at: string;
  updated_at: string;
  assigned_user?: TeamMember;
}

export interface PerformanceMetrics {
  user_id: string;
  full_name: string;
  email: string;
  total_studies: number;
  avg_time_per_study: number;
  won_studies: number;
  lost_studies: number;
  in_progress_studies: number;
  total_revenue_won: number;
  total_revenue_lost: number;
  avg_revenue_per_study: number;
  revenue_per_day: number; // Chiffre d'affaire généré par jour pour les opportunités gagnées
  win_rate: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export const useTeamPerformance = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [apStudies, setApStudies] = useState<APStudy[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('id, full_name, email, username')
        .eq('is_active', true)
        .eq('role_name', 'Sales Engineer')
        .order('full_name');

      if (error) throw error;
      console.log('Sales Engineers loaded:', data?.length);
      setTeamMembers(data || []);
    } catch (err) {
      console.error('Error fetching Sales Engineers:', err);
      setError(err instanceof Error ? err.message : 'Error fetching team members');
    }
  };

  const fetchAPStudies = async (dateRange?: DateRange) => {
    try {
      // Vérifier si la table ap_studies existe
      const { data: tableExists, error: tableError } = await supabase
        .from('ap_studies')
        .select('id')
        .limit(1);

      if (tableError && tableError.code === 'PGRST106') {
        // Table n'existe pas, utiliser des données vides
        console.warn('Table ap_studies does not exist yet. Using empty data.');
        setApStudies([]);
        return;
      }

      if (tableError) {
        throw tableError;
      }

      // La table existe, faire la requête normale
      try {
        let query = supabase
          .from('ap_studies')
          .select(`
            *,
            assigned_user:app_users!assigned_to(id, full_name, email, username)
          `)
          .order('created_at', { ascending: false });

        if (dateRange) {
          query = query
            .gte('start_date', dateRange.start)
            .lte('start_date', dateRange.end);
        }

        const { data, error } = await query;

        if (error) throw error;
        console.log('📊 AP Studies loaded:', data?.length, 'studies');
        setApStudies(data || []);
      } catch (relationError) {
        // Si erreur de relation, faire une requête simple sans jointure
        console.warn('Foreign key relationship not found, fetching without join:', relationError);
        
        let simpleQuery = supabase
          .from('ap_studies')
          .select('*')
          .order('created_at', { ascending: false });

        if (dateRange) {
          simpleQuery = simpleQuery
            .gte('start_date', dateRange.start)
            .lte('start_date', dateRange.end);
        }

        const { data: simpleData, error: simpleError } = await simpleQuery;
        
        if (simpleError) throw simpleError;
        console.log('📊 AP Studies loaded (simple):', simpleData?.length, 'studies');
        setApStudies(simpleData || []);
      }
    } catch (err) {
      console.error('❌ Error fetching AP studies:', err);
      setError(err instanceof Error ? err.message : 'Error fetching AP studies');
    }
  };

  const calculatePerformanceMetrics = (studies: APStudy[], members: TeamMember[]): PerformanceMetrics[] => {
    return members.map(member => {
      const memberStudies = studies.filter(study => study.assigned_to === member.id);
      
      const totalStudies = memberStudies.length;
      const wonStudies = memberStudies.filter(s => s.status === 'won').length;
      const lostStudies = memberStudies.filter(s => s.status === 'lost').length;
      const inProgressStudies = memberStudies.filter(s => s.status === 'in_progress').length;
      
      const totalTimeSpent = memberStudies.reduce((sum, study) => sum + study.time_spent_days, 0);
      const avgTimePerStudy = totalStudies > 0 ? totalTimeSpent / totalStudies : 0;
      
      const wonStudiesData = memberStudies.filter(s => s.status === 'won');
      const lostStudiesData = memberStudies.filter(s => s.status === 'lost');
      
      const totalRevenueWon = wonStudiesData.reduce((sum, study) => sum + study.opportunity_value, 0);
      const totalRevenueLost = lostStudiesData.reduce((sum, study) => sum + study.opportunity_value, 0);
      const avgRevenuePerStudy = totalStudies > 0 ? 
        memberStudies.reduce((sum, study) => sum + study.opportunity_value, 0) / totalStudies : 0;
      
      // Calcul du chiffre d'affaire généré par jour (seulement pour les opportunités gagnées)
      const totalTimeWonStudies = wonStudiesData.reduce((sum, study) => sum + study.time_spent_days, 0);
      const revenuePerDay = totalTimeWonStudies > 0 ? totalRevenueWon / totalTimeWonStudies : 0;
      
      const winRate = (wonStudies + lostStudies) > 0 ? (wonStudies / (wonStudies + lostStudies)) * 100 : 0;

      return {
        user_id: member.id,
        full_name: member.full_name,
        email: member.email,
        total_studies: totalStudies,
        avg_time_per_study: avgTimePerStudy,
        won_studies: wonStudies,
        lost_studies: lostStudies,
        in_progress_studies: inProgressStudies,
        total_revenue_won: totalRevenueWon,
        total_revenue_lost: totalRevenueLost,
        avg_revenue_per_study: avgRevenuePerStudy,
        revenue_per_day: revenuePerDay,
        win_rate: winRate
      };
    });
  };

  const loadData = async (dateRange?: DateRange) => {
    setLoading(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchTeamMembers(),
        fetchAPStudies(dateRange)
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  // Calculer les métriques quand les données changent
  useEffect(() => {
    if (teamMembers.length > 0 && apStudies.length >= 0) {
      const metrics = calculatePerformanceMetrics(apStudies, teamMembers);
      console.log('📊 Performance metrics calculated:', metrics.length, 'members');
      console.log('📊 Sample metrics:', metrics.slice(0, 2));
      setPerformanceMetrics(metrics);
    }
  }, [teamMembers, apStudies]);

  // Charger les données initiales
  useEffect(() => {
    loadData();
  }, []);

  const refreshData = (dateRange?: DateRange) => {
    loadData(dateRange);
  };

  const createAPStudy = async (studyData: Omit<APStudy, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ap_studies')
        .insert(studyData)
        .select()
        .single();

      if (error) throw error;
      
      // Rafraîchir les données
      await fetchAPStudies();
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating AP study';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateAPStudy = async (id: string, updates: Partial<APStudy>) => {
    try {
      const { data, error } = await supabase
        .from('ap_studies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Rafraîchir les données
      await fetchAPStudies();
      return { success: true, data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating AP study';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteAPStudy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ap_studies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Rafraîchir les données
      await fetchAPStudies();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting AP study';
      setError(message);
      return { success: false, error: message };
    }
  };

  return {
    teamMembers,
    apStudies,
    performanceMetrics,
    loading,
    error,
    refreshData,
    createAPStudy,
    updateAPStudy,
    deleteAPStudy,
    clearError: () => setError(null)
  };
};