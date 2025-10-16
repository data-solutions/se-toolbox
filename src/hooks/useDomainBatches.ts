import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface DomainBatch {
  id: string;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'stopped' | 'error';
  total_domains: number;
  completed_domains: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useDomainBatches = () => {
  const [batches, setBatches] = useState<DomainBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const createBatch = async (name: string, description: string, totalDomains: number): Promise<string | null> => {
    console.log('📦 Attempting to create domain batch:', { name, description, totalDomains, user: user?.id });

    if (!user) {
      console.error('❌ User not authenticated - cannot create batch');
      console.error('❌ User object:', user);
      return null;
    }

    try {
      console.log('✅ User authenticated:', user.id);
      console.log('📦 Creating batch in database...');

      const { data, error } = await supabase
        .from('domain_batches')
        .insert({
          name,
          description,
          status: 'pending',
          total_domains: totalDomains,
          completed_domains: 0,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating batch:', error);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error details:', error.details);
        setError(error.message);
        return null;
      }

      console.log('✅ Batch created successfully:', data.id);
      console.log('✅ Batch data:', data);
      return data.id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating batch';
      console.error('❌ Exception in createBatch:', err);
      setError(message);
      return null;
    }
  };

  const updateBatchStatus = async (
    batchId: string,
    status: DomainBatch['status'],
    completedDomains?: number
  ): Promise<boolean> => {
    try {
      const updateData: any = { status };
      if (completedDomains !== undefined) {
        updateData.completed_domains = completedDomains;
      }

      const { error } = await supabase
        .from('domain_batches')
        .update(updateData)
        .eq('id', batchId);

      if (error) {
        console.error('❌ Error updating batch status:', error);
        return false;
      }

      console.log('✅ Batch status updated:', { batchId, status, completedDomains });
      return true;
    } catch (err) {
      console.error('❌ Error in updateBatchStatus:', err);
      return false;
    }
  };

  const incrementBatchProgress = async (batchId: string): Promise<boolean> => {
    try {
      const { data: batch, error: fetchError } = await supabase
        .from('domain_batches')
        .select('completed_domains, total_domains')
        .eq('id', batchId)
        .single();

      if (fetchError || !batch) {
        console.error('❌ Error fetching batch for increment:', fetchError);
        return false;
      }

      const newCompleted = batch.completed_domains + 1;
      const newStatus = newCompleted >= batch.total_domains ? 'completed' : 'in_progress';

      return await updateBatchStatus(batchId, newStatus, newCompleted);
    } catch (err) {
      console.error('❌ Error in incrementBatchProgress:', err);
      return false;
    }
  };

  const getBatches = async (): Promise<DomainBatch[]> => {
    if (!user) {
      console.warn('User not authenticated, cannot fetch batches');
      return [];
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('domain_batches')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching batches:', error);
        setError(error.message);
        return [];
      }

      setBatches(data || []);
      return data || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching batches';
      console.error('Error in getBatches:', err);
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getBatch = async (batchId: string): Promise<DomainBatch | null> => {
    try {
      const { data, error } = await supabase
        .from('domain_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (error) {
        console.error('Error fetching batch:', error);
        return null;
      }

      return data;
    } catch (err) {
      console.error('Error in getBatch:', err);
      return null;
    }
  };

  const deleteBatch = async (batchId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('domain_batches')
        .delete()
        .eq('id', batchId);

      if (error) {
        console.error('Error deleting batch:', error);
        setError(error.message);
        return false;
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting batch';
      console.error('Error in deleteBatch:', err);
      setError(message);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      getBatches();
    }
  }, [user]);

  return {
    batches,
    loading,
    error,
    createBatch,
    updateBatchStatus,
    incrementBatchProgress,
    getBatches,
    getBatch,
    deleteBatch
  };
};
