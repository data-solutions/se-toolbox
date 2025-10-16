import { useState, useCallback } from 'react';
import { callbackReceiver, type CallbackData } from '../utils/callbackReceiver';

interface ProgressiveUpdate {
  taskId: string;
  domain: string;
  checkType: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  data?: any;
  error?: string;
  progress?: number; // 0-100
  timestamp: string;
}

interface TaskStatus {
  taskId: string;
  domain: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  progress: number;
  completedChecks: string[];
  totalChecks: number;
  startTime: string;
  endTime?: string;
}

type UpdateHandler = (update: ProgressiveUpdate) => void;

export const useProgressiveDomainChecks = () => {
  const [updateHandlers, setUpdateHandlers] = useState<Set<UpdateHandler>>(new Set());
  const [activeTasks, setActiveTasks] = useState<Map<string, TaskStatus>>(new Map());

  // Simuler la réception de mises à jour (en production, cela viendrait de WebSockets ou polling)
  const simulateProgressiveUpdates = useCallback((taskId: string, domain: string, checks: string[]) => {
    console.log(`🎭 SIMULATION MODE: Generating mock data for task ${taskId}`);
    console.log(`🎭 Domain: ${domain}, Checks: ${checks.join(', ')}`);
    console.log(`🎭 Note: This will be overridden by real N8N callbacks if received`);
    
    let completedCount = 0;
    const totalChecks = checks.length;
    
    // Simuler chaque check avec des délais réalistes
    checks.forEach((checkType, index) => {
      const delay = 1000 + (index * 1200) + Math.random() * 1500; // 1-4 secondes par check
      
      setTimeout(() => {
        completedCount++;
        const progress = Math.round((completedCount / totalChecks) * 100);
        
        // Simuler des données de réponse selon le type de check
        let mockData = {};
        
        switch (checkType) {
          case 'botBlockers':
            const hasBlockers = Math.random() > 0.6;
            const blockers = hasBlockers ? [
              { name: 'Cloudflare', severity: Math.random() > 0.5 ? 'high' : 'medium' },
              ...(Math.random() > 0.7 ? [{ name: 'reCAPTCHA v3', severity: 'medium' }] : []),
              ...(Math.random() > 0.8 ? [{ name: 'Imperva', severity: 'high' }] : []),
              ...(Math.random() > 0.9 ? [{ name: 'DataDome', severity: 'high' }] : [])
            ] : [];
            
            mockData = {
              blockers,
              overallSeverity: blockers.length === 0 ? 'low' : 
                             blockers.some(b => b.severity === 'high') ? 'high' : 'medium'
            };
            break;
          case 'crawlStatus':
            mockData = {
              on360: Math.random() > 0.4,
              onWIT: Math.random() > 0.6,
              onSurf: Math.random() > 0.5,
              lastCrawl: Math.random() > 0.3 ? 
                new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : 
                null
            };
            break;
          case 'clientUsage':
            const clientCount = Math.floor(Math.random() * 15);
            const clientNames = [
              'Carrefour', 'Auchan', 'Leclerc', 'Casino', 'Monoprix', 'Franprix',
              'Darty', 'Fnac', 'Boulanger', 'Cdiscount', 'Amazon France',
              'Zara', 'H&M', 'Zalando', 'La Redoute', 'Galeries Lafayette'
            ];
            mockData = {
              count: clientCount,
              clients: Array.from({ length: clientCount }, () => 
                clientNames[Math.floor(Math.random() * clientNames.length)]
              ).filter((client, index, arr) => arr.indexOf(client) === index) // Remove duplicates
            };
            break;
          case 'ecommercePlatform':
            const platforms = [
              'Shopify', 'WooCommerce', 'Magento', 'PrestaShop', 'Salesforce Commerce Cloud',
              'BigCommerce', 'Drupal Commerce', 'OpenCart', 'Hybris', 'Demandware', null
            ];
            const platform = platforms[Math.floor(Math.random() * platforms.length)];
            mockData = {
              platform,
              confidence: platform ? 60 + Math.random() * 40 : 0,
              version: platform && Math.random() > 0.5 ? `v${Math.floor(Math.random() * 5) + 1}.${Math.floor(Math.random() * 10)}` : null
            };
            break;
          case 'productIdentifiers':
            const eanSupport = Math.random() > 0.3;
            const gtinSupport = Math.random() > 0.4;
            const upcSupport = Math.random() > 0.6;
            const mpnSupport = Math.random() > 0.4;
            const supportCount = [eanSupport, gtinSupport, upcSupport, mpnSupport].filter(Boolean).length;
            
            mockData = {
              ean: eanSupport,
              gtin: gtinSupport,
              upc: upcSupport,
              mpn: mpnSupport,
              coverage: Math.floor((supportCount / 4) * 100) + Math.floor(Math.random() * 20)
            };
            break;
          case 'eanResponsive':
            const responsive = Math.random() > 0.5;
            const searchFormFound = Math.random() > 0.4;
            mockData = {
              responsive,
              searchFormFound,
              testResults: responsive ? [
                'EAN search form detected',
                'Test EAN 3760123456789 submitted',
                'Product results returned successfully',
                `Response time: ${Math.floor(Math.random() * 2000 + 500)}ms`
              ] : [
                searchFormFound ? 'Search form found but no EAN response' : 'No search form detected',
                'EAN functionality not available'
              ]
            };
            break;
          case 'domainProfile':
            const types = ['brand', 'ecommerce', 'marketplace', null];
            const type = types[Math.floor(Math.random() * types.length)];
            const confidence = type ? 60 + Math.random() * 40 : Math.random() * 30;
            
            const brandNames = ['Nike', 'Adidas', 'Apple', 'Samsung', 'Sony', 'LG', 'Canon', 'Nikon'];
            const marketplaceTypes = ['B2C', 'B2B', 'C2C', 'Multi-vendor'];
            
            mockData = {
              type,
              confidence: Math.round(confidence),
              indicators: type ? [
                `${type} website structure detected`,
                ...(type === 'ecommerce' ? ['Shopping cart functionality', 'Product catalog'] : []),
                ...(type === 'brand' ? ['Brand-focused content', 'Corporate information'] : []),
                ...(type === 'marketplace' ? ['Multi-vendor platform', 'Seller registration'] : [])
              ] : ['Unable to determine website type'],
              brandName: type === 'brand' ? brandNames[Math.floor(Math.random() * brandNames.length)] : undefined,
              marketplaceType: type === 'marketplace' ? marketplaceTypes[Math.floor(Math.random() * marketplaceTypes.length)] : undefined
            };
            break;
          default:
            mockData = {
              status: 'completed',
              message: `Mock data for ${checkType}`,
              timestamp: new Date().toISOString()
            };
        }
        
        const update: ProgressiveUpdate = {
          taskId,
          domain,
          checkType,
          status: 'completed',
          data: mockData,
          progress,
          timestamp: new Date().toISOString()
        };
        
        console.log(`📡 Sending progressive update:`, update);
        console.log(`Update details:`, {
          taskId: update.taskId,
          domain: update.domain,
          checkType: update.checkType,
          status: update.status,
          progress: update.progress,
          isMockData: true
        });
        
        // Notifier tous les handlers
        updateHandlers.forEach(handler => {
          try {
            console.log(`Calling update handler for ${checkType}`);
            handler(update);
          } catch (error) {
            console.error(`Error in update handler for ${checkType}:`, error);
          }
        });
        
        // Mettre à jour le statut de la tâche
        setActiveTasks(prev => {
          const newMap = new Map(prev);
          const taskStatus = newMap.get(taskId);
          if (taskStatus) {
            newMap.set(taskId, {
              ...taskStatus,
              progress,
              completedChecks: [...taskStatus.completedChecks, checkType],
              status: progress === 100 ? 'completed' : 'in_progress',
              endTime: progress === 100 ? new Date().toISOString() : undefined
            });
          }
          return newMap;
        });
        
      }, delay);
    });
  }, [updateHandlers]);

  const startProgressiveCheck = useCallback(async (domain: string, checks: string[]): Promise<string> => {
    const webhookUrl = import.meta.env.VITE_DOMAIN_CHECKER_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/domain-check';
    const callbackUrl = import.meta.env.VITE_DOMAIN_CHECKER_CALLBACK_URL || 'https://localhost:5173/api/domain-check-callback';
    const callbackMode = import.meta.env.VITE_CALLBACK_MODE || 'simulation';
    
    // Générer le taskID côté Bolt
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      console.log(`Starting progressive domain check for ${domain}`);
      console.log(`Generated taskId: ${taskId}`);
      console.log(`Checks to perform:`, checks);
      console.log(`Webhook URL:`, webhookUrl);
      console.log(`Callback URL:`, callbackUrl);
      
      // Vérifier que l'URL de callback n'est pas localhost
      if (callbackUrl.includes('localhost') || callbackUrl.includes('127.0.0.1')) {
        console.warn('ATTENTION: Callback URL utilise localhost, N8N ne pourra pas y accéder !');
        console.warn('Utilise ngrok, webhook.site ou une URL publique');
      }
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          domain,
          checks,
          callbackUrl,
          mode: 'progressive',
          timestamp: new Date().toISOString()
        }),
        signal: AbortSignal.timeout(10000) // 10 seconds timeout for initial request
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`N8N webhook error response:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // N8N devrait juste confirmer la réception
      const result = await response.json().catch(() => ({ success: true }));
      
      console.log(`Progressive check started and sent to N8N, taskId: ${taskId}`);
      console.log(`N8N should now send callbacks to: ${callbackUrl}`);
      
      // Créer le statut de la tâche
      const taskStatus: TaskStatus = {
        taskId,
        domain,
        status: 'in_progress',
        progress: 0,
        completedChecks: [],
        totalChecks: checks.length,
        startTime: new Date().toISOString()
      };
      
      setActiveTasks(prev => new Map(prev).set(taskId, taskStatus));
      
      // Simuler les mises à jour seulement si on est en mode simulation pur
      if (callbackMode === 'simulation') {
        console.log(`🎭 Simulation mode: generating mock progressive updates`);
        simulateProgressiveUpdates(taskId, domain, checks);
      } else {
        console.log(`🌐 Real callback mode (${callbackMode}): waiting for N8N callbacks`);
      }
      
      return taskId;
      
    } catch (error) {
      console.error(`Error starting progressive check for ${domain}:`, error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = `Network error: Unable to connect to N8N webhook (${webhookUrl}). `;
        console.error('Network error:', networkError);
        throw new Error(networkError);
      }
      
      throw error;
    }
  }, [simulateProgressiveUpdates]);

  const subscribeToUpdates = useCallback((handler: UpdateHandler) => {
    console.log(`🔔 Subscribing to progressive updates`);
    
    // Convertir le handler pour qu'il soit compatible avec CallbackData
    const callbackHandler = (data: CallbackData) => {
      const progressiveUpdate: ProgressiveUpdate = {
        taskId: data.taskId,
        domain: data.domain,
        checkType: data.checkType,
        status: data.status,
        data: data.data,
        error: data.error,
        timestamp: data.timestamp
      };
      
      console.log('🔄 Converting callback to progressive update:', progressiveUpdate);
      handler(progressiveUpdate);
    };
    
    // Ajouter le handler au système de callbacks
    callbackReceiver.addHandler(callbackHandler);
    
    // Stocker la référence pour pouvoir la supprimer plus tard
    setUpdateHandlers(prev => {
      const newSet = new Set(prev);
      newSet.add(handler);
      return newSet;
    });
  }, []);

  const unsubscribeFromUpdates = useCallback((handler: UpdateHandler) => {
    console.log(`Unsubscribing from progressive updates, remaining handlers: ${updateHandlers.size - 1}`);
    setUpdateHandlers(prev => {
      const newSet = new Set(prev);
      newSet.delete(handler);
      return newSet;
    });
    
    // Note: Pour une vraie désinscription du callbackReceiver, 
    // il faudrait stocker la référence du callbackHandler
  }, []);

  const getTaskStatus = useCallback((taskId: string): TaskStatus | null => {
    return activeTasks.get(taskId) || null;
  }, [activeTasks]);

  const cancelTask = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      // En production, faire un appel pour annuler la tâche côté N8N
      console.log(`Cancelling task ${taskId}`);
      
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
        return newMap;
      });
      
      return true;
    } catch (error) {
      console.error(`Error cancelling task ${taskId}:`, error);
      return false;
    }
  }, []);

  return {
    startProgressiveCheck,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    getTaskStatus,
    cancelTask,
    activeTasks: Array.from(activeTasks.values())
  };
}