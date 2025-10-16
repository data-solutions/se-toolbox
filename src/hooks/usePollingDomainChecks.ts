import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PollingUpdate {
  taskId: string;
  domain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  results: any;
  progress?: number;
  timestamp: string;
}

interface TaskStatus {
  taskId: string;
  domain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  startTime: string;
  endTime?: string;
  dbRecordId?: string;
}

type UpdateHandler = (update: PollingUpdate) => void;

export const usePollingDomainChecks = () => {
  const [activeTasks, setActiveTasks] = useState<Map<string, TaskStatus>>(new Map());
  const pollingIntervalRef = useRef<number | null>(null);
  const isPollingRef = useRef(false);
  const activeTasksRef = useRef<Map<string, TaskStatus>>(new Map());
  const updateHandlersRef = useRef<Set<UpdateHandler>>(new Set());

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      console.log('🛑 Stopping database polling');
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      isPollingRef.current = false;
    }
  }, []);

  const startProgressiveCheck = useCallback(async (domain: string, checks: string[], taskId?: string): Promise<string> => {
    // Ne plus faire d'appel au webhook ici - c'est fait dans DomainChecker
    // Ce hook gère uniquement le polling de la base de données

    const generatedTaskId = taskId || `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    console.log(`📡 Starting polling for domain check: ${domain}`);
    console.log(`📋 TaskId: ${generatedTaskId}`);
    console.log(`🔍 Checks to monitor:`, checks);

    // Créer le statut de la tâche
    const taskStatus: TaskStatus = {
      taskId: generatedTaskId,
      domain,
      status: 'in_progress',
      progress: 0,
      startTime: new Date().toISOString()
    };

    setActiveTasks(prev => {
      const newMap = new Map(prev).set(generatedTaskId, taskStatus);
      activeTasksRef.current = newMap;
      return newMap;
    });

    // Démarrer le polling si ce n'est pas déjà fait
    if (!isPollingRef.current) {
      console.log('🔄 Starting database polling every 3 seconds');
      isPollingRef.current = true;
      startPollingInternal();
    }

    return generatedTaskId;
  }, []);

  const pollDatabase = async () => {
      const currentTasks = Array.from(activeTasksRef.current.values());
      const activeDomainTasks = currentTasks.filter(task =>
        task.status === 'in_progress' || task.status === 'pending' || task.status === 'checking'
      );

      if (activeDomainTasks.length === 0) {
        console.log('📭 No active tasks, stopping polling');
        stopPolling();
        return;
      }

      console.log(`🔍 Polling for ${activeDomainTasks.length} active tasks`);

      try {
        const domains = activeDomainTasks.map(task => task.domain);

        const { data: domainChecks, error } = await supabase
          .from('domain_checks')
          .select('*')
          .in('domain', domains)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('❌ Error polling domain checks:', error);
          return;
        }

        if (!domainChecks || domainChecks.length === 0) {
          console.log('📭 No domain check records found in database');
          return;
        }

        console.log(`📊 Found ${domainChecks.length} domain check records`);

        const uniqueDomainChecks = new Map<string, typeof domainChecks[0]>();
        domainChecks.forEach(record => {
          if (!uniqueDomainChecks.has(record.domain)) {
            uniqueDomainChecks.set(record.domain, record);
          }
        });

        uniqueDomainChecks.forEach((record, domain) => {
          const task = activeDomainTasks.find(t => t.domain === domain);
          if (!task) return;

          // Parse results if it's a JSON string
          let parsedResults = record.results;
          if (typeof record.results === 'string') {
            try {
              parsedResults = JSON.parse(record.results);
              console.log(`📋 Parsed JSON string results for ${domain}`);
            } catch (e) {
              console.error(`❌ Failed to parse results JSON for ${domain}:`, e);
              parsedResults = {};
            }
          }

          console.log(`🔄 Processing update for ${domain}:`, {
            status: record.status,
            hasResults: !!parsedResults,
            resultKeys: parsedResults ? Object.keys(parsedResults) : []
          });

          const completedChecks = parsedResults && typeof parsedResults === 'object'
            ? Object.values(parsedResults).filter((check: any) => check && check.status === 'completed').length
            : 0;
          const totalChecks = parsedResults && typeof parsedResults === 'object'
            ? Object.keys(parsedResults).length
            : 0;
          const progress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

          const update: PollingUpdate = {
            taskId: task.taskId,
            domain: record.domain,
            status: record.status as any,
            results: parsedResults || {},
            progress,
            timestamp: record.updated_at
          };

          console.log(`📤 Notifying ${updateHandlersRef.current.size} handlers for ${domain}`, {
            completedChecks,
            totalChecks,
            progress
          });

          updateHandlersRef.current.forEach(handler => {
            try {
              handler(update);
            } catch (error) {
              console.error('❌ Error in polling update handler:', error);
            }
          });

          setActiveTasks(prev => {
            const newMap = new Map(prev);
            const currentTask = newMap.get(task.taskId);
            if (currentTask) {
              newMap.set(task.taskId, {
                ...currentTask,
                status: record.status as any,
                progress,
                endTime: record.status === 'completed' ? record.updated_at : undefined,
                dbRecordId: record.id
              });
            }
            activeTasksRef.current = newMap;
            return newMap;
          });

          if (record.status === 'completed' || record.status === 'error') {
            setTimeout(() => {
              setActiveTasks(prev => {
                const newMap = new Map(prev);
                newMap.delete(task.taskId);
                activeTasksRef.current = newMap;
                return newMap;
              });
            }, 10000);
          }
        });

      } catch (error) {
        console.error('💥 Error during polling:', error);
      }
  };

  const startPollingInternal = () => {
    pollDatabase();
    pollingIntervalRef.current = window.setInterval(pollDatabase, 3000);
  };

  const startPolling = useCallback(() => {
    if (isPollingRef.current) {
      console.log('📡 Polling already active');
      return;
    }

    console.log('🔄 Starting database polling every 3 seconds');
    isPollingRef.current = true;
    startPollingInternal();
  }, []);

  const subscribeToUpdates = useCallback((handler: UpdateHandler) => {
    updateHandlersRef.current.add(handler);
  }, []);

  const unsubscribeFromUpdates = useCallback((handler: UpdateHandler) => {
    updateHandlersRef.current.delete(handler);
  }, []);

  const getTaskStatus = useCallback((taskId: string): TaskStatus | null => {
    return activeTasks.get(taskId) || null;
  }, [activeTasks]);

  const cancelTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      console.log(`❌ Cancelling task ${taskId}`);

      setActiveTasks(prev => {
        const newMap = new Map(prev);
        const taskStatus = newMap.get(taskId);
        if (taskStatus) {
          newMap.set(taskId, {
            ...taskStatus,
            status: 'error',
            endTime: new Date().toISOString()
          });
        }
        activeTasksRef.current = newMap;
        return newMap;
      });

      return true;
    } catch (error) {
      console.error(`💥 Error cancelling task ${taskId}:`, error);
      return false;
    }
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    startProgressiveCheck,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    getTaskStatus,
    cancelTask,
    stopPolling,
    activeTasks: Array.from(activeTasks.values())
  };
};