import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

interface DomainCheckRecord {
  id: string;
  domain: string;
  status: string;
  results: any;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export const useDomainChecks = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();

  const getCachedResult = async (domain: string): Promise<DomainCheckRecord | null> => {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const { data, error } = await supabase
        .from('domain_checks')
        .select('*')
        .eq('domain', domain)
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching cached result:', error);
        return null;
      }

      // Parse results if it's a JSON string
      if (data && typeof data.results === 'string') {
        try {
          data.results = JSON.parse(data.results);
        } catch (e) {
          console.error('Failed to parse cached results JSON:', e);
          data.results = {};
        }
      }

      return data;
    } catch (err) {
      console.error('Error in getCachedResult:', err);
      return null;
    }
  };

  const saveResult = async (domain: string, status: string, results: any, batchId?: string): Promise<string | null> => {
    try {
      console.log('💾 Saving domain check result:', { domain, status, batchId });

      const { data, error } = await supabase
        .from('domain_checks')
        .insert({
          domain,
          status,
          results,
          created_by: null,
          batch_id: batchId || null
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving domain check result:', error);
        // Ne pas bloquer l'interface si la sauvegarde échoue
        console.warn('Continuing without database save due to error:', error.message);
        return null;
      }

      console.log('✅ Domain check result saved successfully:', data.id);
      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error saving result';
      console.error('❌ Error in saveResult:', err);
      console.warn('Continuing without database save due to error:', message);
      return null;
    }
  };

  const updateResult = async (id: string, status: string, results: any): Promise<boolean> => {
    if (!id) {
      console.warn('No database ID provided, skipping update');
      return false;
    }

    try {
      console.log('🔄 Updating domain check result:', { id, status });

      const { error } = await supabase
        .from('domain_checks')
        .update({
          status,
          results,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating domain check result:', error);
        console.warn('Continuing without database update due to error:', error.message);
        return false;
      }

      console.log('✅ Domain check result updated successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating result';
      console.error('❌ Error in updateResult:', err);
      console.warn('Continuing without database update due to error:', message);
      return false;
    }
  };

  const getAllResults = async (limit: number = 100): Promise<DomainCheckRecord[]> => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('domain_checks')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching all results:', error);
        setError(error.message);
        return [];
      }

      // Parse results if they're JSON strings
      const parsedData = (data || []).map(record => {
        if (typeof record.results === 'string') {
          try {
            record.results = JSON.parse(record.results);
          } catch (e) {
            console.error('Failed to parse results JSON:', e);
            record.results = {};
          }
        }
        return record;
      });

      return parsedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching results';
      console.error('Error in getAllResults:', err);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getResultHistory = async (domain: string): Promise<DomainCheckRecord[]> => {
    try {
      const { data, error } = await supabase
        .from('domain_checks')
        .select('*')
        .eq('domain', domain)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching result history:', error);
        setError(error.message);
        return [];
      }

      // Parse results if they're JSON strings
      const parsedData = (data || []).map(record => {
        if (typeof record.results === 'string') {
          try {
            record.results = JSON.parse(record.results);
          } catch (e) {
            console.error('Failed to parse results JSON:', e);
            record.results = {};
          }
        }
        return record;
      });

      return parsedData;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching history';
      console.error('Error in getResultHistory:', err);
      setError(message);
      return [];
    }
  };

  const deleteResult = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('domain_checks')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting domain check result:', error);
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting result';
      console.error('Error in deleteResult:', err);
      setError(message);
      return false;
    }
  };

  const clearError = () => setError(null);

  const clearAllCache = async (): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🗑️ Clearing all domain check cache...');
      
      const { error } = await supabase
        .from('domain_checks')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('Error clearing domain check cache:', error);
        setError(error.message);
        return false;
      }

      console.log('✅ Domain check cache cleared successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error clearing cache';
      console.error('Error in clearAllCache:', err);
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  return {
    loading,
    error,
    getCachedResult,
    saveResult,
    updateResult,
    getAllResults,
    getResultHistory,
    deleteResult,
    clearAllCache,
    clearError
  };
};