import React, { useState } from 'react';
import { Globe, Search, Upload, FileText, AlertCircle, CheckCircle, Clock, Shield, Database, Users, Barcode, Zap, ShoppingCart, Building2, RefreshCw, History } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { usePollingDomainChecks } from '../../hooks/usePollingDomainChecks';
import { DomainInput } from './DomainInput';
import { DomainResults } from './DomainResults';
import { TestSelector, TestConfig } from './TestSelector';
import { BatchHistory } from './BatchHistory';
import { useDomainChecks } from '../../hooks/useDomainChecks';
import { useDomainBatches } from '../../hooks/useDomainBatches';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

export interface DomainCheckResult {
  domain: string;
  status: 'pending' | 'checking' | 'completed' | 'error';
  checks: {
    botBlockers: {
      status: 'pending' | 'completed' | 'error';
      blockers: Array<{
        name: string;
        severity: 'low' | 'medium' | 'high';
        details?: string;
      }>;
      overallSeverity: 'low' | 'medium' | 'high';
    };
    crawlStatus: {
      status: 'pending' | 'completed' | 'error';
      on360: boolean;
      onWIT: boolean;
      onSurf: boolean;
      lastCrawl?: string;
    };
    clientUsage: {
      status: 'pending' | 'completed' | 'error';
      count: number;
      clients: string[];
    };
    domainProfile: {
      status: 'pending' | 'completed' | 'error';
      type: 'brand' | 'ecommerce' | 'marketplace' | null;
      confidence: number;
      indicators: string[];
      brandName?: string;
      marketplaceType?: string;
    };
    ecommercePlatform: {
      status: 'pending' | 'completed' | 'error';
      platform: string | null;
    };
    productIdentifiers: {
      status: 'pending' | 'completed' | 'error';
      ean: boolean;
      gtin: boolean;
      upc: boolean;
      mpn: boolean;
      coverage: number;
    };
    eanResponsive: {
      status: 'pending' | 'completed' | 'error';
      responsive: boolean;
      searchFormFound: boolean;
      testResults: string[];
    };
  };
  error?: string;
  startTime?: Date;
  endTime?: Date;
  id?: string;
  taskId?: string;
  fromCache?: boolean;
  lastChecked?: Date;
}

interface DomainCheckerProps {
  language?: Language;
}

export const DomainChecker: React.FC<DomainCheckerProps> = ({ language = 'en' }) => {
  const [domains, setDomains] = useState<string[]>([]);
  const [salesforceAP, setSalesforceAP] = useState<string>('');
  const [results, setResults] = useState<DomainCheckResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState<Set<string>>(new Set());
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
  const [selectedTests, setSelectedTests] = useState<TestConfig>({
    botBlockers: true,
    crawlStatus: true,
    clientUsage: true,
    domainProfile: true,
    ecommercePlatform: true,
    productIdentifiers: true,
    eanResponsive: true,
  });
  
  // Default structure for all domain checks
  const defaultChecks = {
    botBlockers: { status: 'pending' as const, blockers: [], overallSeverity: 'low' as const },
    crawlStatus: { status: 'pending' as const, on360: false, onWIT: false, onSurf: false },
    clientUsage: { status: 'pending' as const, count: 0, clients: [] },
    domainProfile: { status: 'pending' as const, type: null, confidence: 0, indicators: [] },
    ecommercePlatform: { status: 'pending' as const, platform: null },
    productIdentifiers: { status: 'pending' as const, ean: false, gtin: false, upc: false, mpn: false, coverage: 0 },
    eanResponsive: { status: 'pending' as const, responsive: false, searchFormFound: false, testResults: [] },
  };

  const { getCachedResult, saveResult, updateResult, clearAllCache } = useDomainChecks();
  const { createBatch, updateBatchStatus, incrementBatchProgress } = useDomainBatches();
  const {
    startProgressiveCheck,
    subscribeToUpdates,
    unsubscribeFromUpdates,
    getTaskStatus,
    stopPolling
  } = usePollingDomainChecks();

  // Subscribe to polling updates
  React.useEffect(() => {
    const handleProgressUpdate = (update: any) => {
      const { taskId, domain, status, results, progress, timestamp } = update;

      console.log(`=== POLLING UPDATE RECEIVED ===`);
      console.log(`TaskID: ${taskId}`);
      console.log(`Domain: ${domain}`);
      console.log(`Status: ${status}`);
      console.log(`Progress: ${progress}%`);
      console.log(`Results:`, results);
      console.log(`Timestamp:`, timestamp);

      // Find the domain in results and update with database results
      setResults(prev => prev.map(result => {
        if (result.domain === domain) {
          console.log(`✅ Updating domain ${domain} with polling data from database`);

          // Merge database results with existing checks
          const updatedChecks = {
            ...result.checks,
            ...results
          };

          console.log(`📊 Updated checks:`, updatedChecks);

          // Si un domaine est complété, incrémenter le batch
          if (status === 'completed' && result.status !== 'completed' && currentBatchId) {
            incrementBatchProgress(currentBatchId);
          }

          return {
            ...result,
            status: status,
            checks: updatedChecks,
            endTime: status === 'completed' ? new Date() : result.endTime
          };
        }
        return result;
      }));
    };

    subscribeToUpdates(handleProgressUpdate);

    return () => {
      unsubscribeFromUpdates(handleProgressUpdate);
      stopPolling();
    };
  }, [subscribeToUpdates, unsubscribeFromUpdates, stopPolling, currentBatchId, incrementBatchProgress]);

  const checkSteps = [
    { key: 'botBlockers', label: getTranslation(language, 'botBlockers'), icon: Shield },
    { key: 'crawlStatus', label: getTranslation(language, 'crawlStatus'), icon: Database },
    { key: 'clientUsage', label: getTranslation(language, 'clientUsage'), icon: Users },
    { key: 'domainProfile', label: getTranslation(language, 'domainProfile'), icon: Building2 },
    { key: 'ecommercePlatform', label: getTranslation(language, 'ecommercePlatform'), icon: ShoppingCart },
    { key: 'productIdentifiers', label: getTranslation(language, 'productIdentifiers'), icon: Barcode },
    { key: 'eanResponsive', label: getTranslation(language, 'eanResponsive'), icon: Zap },
  ];

  const handleTestToggle = (testKey: keyof TestConfig) => {
    setSelectedTests(prev => ({
      ...prev,
      [testKey]: !prev[testKey]
    }));
  };

  const handleStartCheck = async (inputDomains: string[], apNumber?: string) => {
    // Vérifier qu'au moins un test est sélectionné
    const hasSelectedTests = Object.values(selectedTests).some(Boolean);
    if (!hasSelectedTests) {
      alert(getTranslation(language, 'pleaseSelectAtLeastOneTest'));
      return;
    }

    setIsChecking(true);
    setResults([]);
    setForceUpdate(new Set());
    setCurrentBatchId(null);

    let domainsToCheck = inputDomains;
    
    // Si un numéro AP Salesforce est fourni, récupérer les domaines associés
    if (apNumber) {
      try {
        setCurrentStep(getTranslation(language, 'retrievingDomains'));
        
        const salesforceWebhookUrl = import.meta.env.VITE_SALESFORCE_AP_WEBHOOK_URL || 'https://gaelmartinez.app.n8n.cloud/webhook/sfdc-ap-check';
        
        // Formater le numéro AP au format standard "AP-XXXXXX"
        const formatAPNumber = (input: string): string => {
          // Nettoyer l'input (supprimer espaces, convertir en majuscules)
          const cleaned = input.trim().toUpperCase();
          
          // Si commence déjà par "AP-", vérifier le format
          if (cleaned.startsWith('AP-')) {
            const numberPart = cleaned.substring(3);
            // Vérifier que c'est bien un nombre
            if (/^\d+$/.test(numberPart)) {
              // Formater avec des zéros à gauche pour avoir 6 chiffres
              return `AP-${numberPart.padStart(6, '0')}`;
            }
          } else {
            // Si c'est juste un nombre, ajouter le préfixe et formater
            if (/^\d+$/.test(cleaned)) {
              return `AP-${cleaned.padStart(6, '0')}`;
            }
          }
          
          // Si le format n'est pas reconnu, retourner tel quel
          return cleaned;
        };
        
        const formattedAPNumber = formatAPNumber(apNumber);
        console.log('Numéro AP original:', apNumber);
        console.log('Numéro AP formaté:', formattedAPNumber);
        console.log('Récupération des domaines depuis Salesforce AP:', formattedAPNumber);
        
        console.log('URL du webhook:', salesforceWebhookUrl);
        
        let response;
        try {
          response = await fetch(salesforceWebhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              apNumber: formattedAPNumber
            }),
            // Ajouter un timeout pour éviter les blocages
            signal: AbortSignal.timeout(30000) // 30 secondes
          });
        } catch (fetchError) {
          console.error('Erreur de connexion au webhook:', fetchError);
          
          if (fetchError instanceof Error) {
            if (fetchError.name === 'AbortError') {
              throw new Error('Timeout: Le webhook Salesforce ne répond pas (30s)');
            } else if (fetchError.message === 'Failed to fetch') {
              throw new Error(`Impossible de se connecter au webhook Salesforce (${salesforceWebhookUrl}). Vérifiez:
1. Que l'URL est correcte dans votre fichier .env
2. Que le service N8N est accessible
3. Les paramètres CORS du webhook
4. Votre connexion réseau`);
            }
          }
          
          throw new Error(`Erreur de connexion: ${fetchError instanceof Error ? fetchError.message : 'Erreur inconnue'}`);
        }

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Pas de détails disponibles');
          console.error('Réponse HTTP non-OK:', response.status, response.statusText, errorText);
          throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
        }

        // Vérifier le content-type avant de parser en JSON
        const contentType = response.headers.get('content-type');
        let responseData;
        
        if (contentType && contentType.includes('application/json')) {
          try {
            responseData = await response.json();
          } catch (jsonError) {
            console.error('Erreur de parsing JSON:', jsonError);
            const textResponse = await response.text();
            console.log('Réponse brute:', textResponse);
            throw new Error(`Réponse invalide du webhook (pas de JSON valide): ${textResponse.substring(0, 200)}...`);
          }
        } else {
          // Si ce n'est pas du JSON, récupérer le texte brut
          const textResponse = await response.text();
          console.log('Réponse non-JSON:', textResponse);
          
          // Essayer de parser quand même au cas où
          try {
            responseData = JSON.parse(textResponse);
          } catch {
            throw new Error(`Le webhook a renvoyé une réponse non-JSON: ${textResponse.substring(0, 200)}...`);
          }
        }
        
        console.log('Réponse Salesforce AP:', responseData);
        
        // Logs de débogage détaillés pour comprendre la structure
        console.log('Type de responseData:', typeof responseData);
        console.log('Est-ce un tableau?', Array.isArray(responseData));
        console.log('Clés disponibles:', responseData && typeof responseData === 'object' ? Object.keys(responseData) : 'N/A');
        console.log('Structure complète:', JSON.stringify(responseData, null, 2));
        
        // Extraire les domaines de la réponse
        let domainsExtracted = false;
        
        // Cas 1: responseData est directement un array d'objets avec propriété Name
        if (responseData && Array.isArray(responseData)) {
          // Vérifier si c'est un array d'objets avec propriété Name (format Salesforce)
          if (responseData.length > 0 && responseData[0] && typeof responseData[0] === 'object' && 'Name' in responseData[0]) {
            domainsToCheck = responseData.map((item: any) => item.Name).filter((name: string) => name && name.trim());
            console.log('Domaines récupérés (Salesforce format avec Name):', domainsToCheck);
          } else {
            // Array direct de strings
            domainsToCheck = responseData;
            console.log('Domaines récupérés (array direct):', domainsToCheck);
          }
          domainsExtracted = true;
        }
        // Cas 2: responseData.domains (array)
        else if (responseData && responseData.domains && Array.isArray(responseData.domains)) {
          domainsToCheck = responseData.domains;
          console.log('Domaines récupérés (responseData.domains):', domainsToCheck);
          domainsExtracted = true;
        }
        // Cas 3: responseData.data.domains
        else if (responseData && responseData.data && responseData.data.domains && Array.isArray(responseData.data.domains)) {
          domainsToCheck = responseData.data.domains;
          console.log('Domaines récupérés (responseData.data.domains):', domainsToCheck);
          domainsExtracted = true;
        }
        // Cas 4: responseData.result (ou autres structures possibles)
        else if (responseData && responseData.result && Array.isArray(responseData.result)) {
          domainsToCheck = responseData.result;
          console.log('Domaines récupérés (responseData.result):', domainsToCheck);
          domainsExtracted = true;
        }
        // Cas 5: Chercher toute propriété qui contient un array
        else if (responseData && typeof responseData === 'object') {
          const keys = Object.keys(responseData);
          for (const key of keys) {
            if (Array.isArray(responseData[key])) {
              domainsToCheck = responseData[key];
              console.log(`Domaines récupérés (responseData.${key}):`, domainsToCheck);
              domainsExtracted = true;
              break;
            }
          }
        }
        
        if (!domainsExtracted) {
          console.warn('Format de réponse inattendu:', responseData);
          console.warn('Structure attendue: { domains: [...] } ou [...] ou { data: { domains: [...] } }');
          throw new Error(`Format de réponse inattendu du webhook Salesforce. Structure reçue: ${JSON.stringify(responseData).substring(0, 200)}...`);
        }
        
        if (domainsToCheck.length === 0) {
          throw new Error('Aucun domaine trouvé pour ce numéro AP');
        }
        
        console.log(`${domainsToCheck.length} domaines récupérés depuis Salesforce AP ${formattedAPNumber}`);
        
      } catch (error) {
        console.error('Erreur lors de la récupération des domaines AP:', error);
        setIsChecking(false);
        setCurrentStep('');
        
        // Afficher l'erreur à l'utilisateur
        alert(`Erreur lors de la récupération des domaines Salesforce: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
        return;
      }
    }

    console.log(`Démarrage de l'analyse pour ${domainsToCheck.length} domaines:`, domainsToCheck);

    // Créer un batch pour cette analyse
    const batchName = apNumber
      ? `Analysis: AP-${apNumber}`
      : `Analysis: ${domainsToCheck.length} domain(s) - ${new Date().toLocaleString()}`;

    const batchDescription = apNumber
      ? `Domains from Salesforce AP ${apNumber}`
      : `Manual domain check`;

    const batchId = await createBatch(batchName, batchDescription, domainsToCheck.length);

    if (batchId) {
      console.log('✅ Batch created:', batchId);
      setCurrentBatchId(batchId);
      await updateBatchStatus(batchId, 'in_progress');
    } else {
      console.warn('⚠️ Could not create batch, continuing without batch tracking');
    }

    // Vérifier le cache pour chaque domaine
    const initialResults: DomainCheckResult[] = [];
    
    for (const domain of domainsToCheck) {
      console.log(`Vérification du cache pour ${domain}...`);
      
      const cachedResult = await getCachedResult(domain);
      
      if (cachedResult && !forceUpdate.has(domain)) {
        console.log(`Résultat en cache trouvé pour ${domain} (${new Date(cachedResult.created_at).toLocaleString()})`);
        
        // Utiliser le résultat en cache
        initialResults.push({
          domain,
          status: 'completed',
          checks: {
            ...defaultChecks,
            ...cachedResult.results
          },
          id: cachedResult.id,
          fromCache: true,
          lastChecked: new Date(cachedResult.created_at),
          startTime: new Date(cachedResult.created_at),
          endTime: new Date(cachedResult.updated_at)
        });
      } else {
        console.log(`Pas de cache récent pour ${domain}, analyse nécessaire`);
        
        // Initialiser pour une nouvelle analyse
        initialResults.push({
          domain,
          status: 'pending',
          startTime: new Date(),
          fromCache: false,
          checks: Object.keys(defaultChecks).reduce((acc, checkType) => {
            const key = checkType as keyof typeof defaultChecks;
            acc[key] = {
              ...defaultChecks[key],
              status: selectedTests[key] ? 'pending' : 'completed'
            };
            return acc;
          }, {} as typeof defaultChecks)
        });
      }
    }

    setResults(initialResults);

    // Paralléliser les vérifications pour les domaines non mis en cache
    const domainsToProcess = initialResults
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => !result.fromCache);

    if (domainsToProcess.length > 0) {
      setCurrentStep(`Analyse de ${domainsToProcess.length} domaine(s) en parallèle...`);
      
      // Exécuter toutes les vérifications en parallèle
      await Promise.all(
        domainsToProcess.map(({ result, index }) =>
          performDomainChecks(result.domain, index, selectedTests, batchId || undefined)
        )
      );
    }

    setIsChecking(false);
    setCurrentStep('');
  };

  const performDomainChecks = async (domain: string, index: number, testsConfig: TestConfig, batchId?: string) => {
    const domainStartTime = new Date();
    let dbRecordId: string | null = null;

    // Marquer le domaine comme en cours de vérification
    setResults(prev => prev.map((result, i) =>
      i === index ? { ...result, status: 'checking', startTime: domainStartTime } : result
    ));

    // Essayer de créer un enregistrement en base de données (optionnel)
    try {
      dbRecordId = await saveResult(domain, 'checking', {}, batchId);
      if (dbRecordId) {
        console.log(`Database record created for ${domain}:`, dbRecordId);
      }
    } catch (error) {
      console.warn(`Could not create database record for ${domain}, continuing without DB:`, error);
    }

    // Appel au webhook check-domain pour chaque domaine
    try {
      await performDomainWebhookCheck(domain, index, testsConfig, dbRecordId, batchId);
      
    } catch (error) {
      console.error(`Error starting progressive analysis for ${domain}:`, error);
      
      // Marquer comme erreur
      setResults(prev => prev.map((result, i) => 
        i === index ? { 
          ...result, 
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
          endTime: new Date()
        } : result
      ));
    }
  };
  
  const performDomainWebhookCheck = async (domain: string, index: number, testsConfig: TestConfig, dbRecordId: string | null, batchId?: string) => {
    const webhookUrl = import.meta.env.VITE_DOMAIN_CHECKER_WEBHOOK_URL || 'https://gaelmartinez.app.n8n.cloud/webhook-test/domain-check';

    // Générer un taskId unique
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Préparer les tests à exécuter
    const enabledChecks = Object.entries(testsConfig)
      .filter(([_, enabled]) => enabled)
      .map(([checkType, _]) => checkType);

    console.log(`🌐 Calling check-domain webhook for ${domain}`);
    console.log(`📋 Enabled checks:`, enabledChecks);
    console.log(`🔗 Webhook URL:`, webhookUrl);
    console.log(`🆔 Task ID:`, taskId);
    console.log(`💾 DB Record ID:`, dbRecordId);
    console.log(`📦 Batch ID:`, batchId);

    const payload = {
      taskId,
      domain,
      checks: enabledChecks,
      mode: 'database_polling',
      timestamp: new Date().toISOString(),
      user: 'Domain Checker User',
      dbRecordId: dbRecordId,
      batchId: batchId || null
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });

      console.log(`📊 Webhook response for ${domain}:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(`❌ Webhook error for ${domain}:`, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json().catch(() => ({ success: true }));
      console.log(`✅ Webhook response data for ${domain}:`, responseData);

      setResults(prev => prev.map((result, i) =>
        i === index ? {
          ...result,
          id: dbRecordId || undefined,
          taskId,
          status: 'checking',
          startTime: new Date()
        } : result
      ));

      console.log(`📡 Domain check sent to N8N, starting polling...`);
      await startProgressiveCheck(domain, enabledChecks, taskId);

    } catch (error) {
      console.error(`💥 Error calling webhook for ${domain}:`, error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = `Network error: Unable to connect to domain check webhook (${webhookUrl})`;
        console.error('🌐 Network error:', networkError);
        throw new Error(networkError);
      }

      throw error;
    }
  };

  const handleLoadMockData = () => {
    console.log('🎭 Loading mockup data for Domain Checker demonstration');
    
    const mockDomains = [
      'carrefour.fr',
      'amazon.fr', 
      'zalando.fr',
      'cdiscount.com',
      'fnac.com',
      'darty.com',
      'leclerc.com',
      'auchan.fr'
    ];
    
    const mockResults: DomainCheckResult[] = mockDomains.map((domain, index) => {
      // Générer des données réalistes pour chaque domaine
      const hasHighSecurity = ['amazon.fr', 'zalando.fr'].includes(domain);
      const isMarketplace = ['amazon.fr', 'cdiscount.com'].includes(domain);
      const isBrand = ['carrefour.fr', 'fnac.com', 'darty.com'].includes(domain);
      
      // Bot Blockers - plus sophistiqués pour certains sites
      const botBlockers = hasHighSecurity ? [
        { name: 'Cloudflare', severity: 'high' as const },
        { name: 'DataDome', severity: 'high' as const },
        { name: 'reCAPTCHA v3', severity: 'medium' as const }
      ] : Math.random() > 0.6 ? [
        { name: 'Cloudflare', severity: Math.random() > 0.5 ? 'medium' as const : 'low' as const }
      ] : [];
      
      // Crawl Status - sites populaires plus susceptibles d'être crawlés
      const popularSites = ['carrefour.fr', 'amazon.fr', 'fnac.com', 'darty.com'];
      const isPopular = popularSites.includes(domain);
      
      // Client Usage - données réalistes selon le type de site
      const clientCounts = {
        'carrefour.fr': { count: 12, clients: ['Carrefour', 'Carrefour Market', 'Carrefour City', 'Carrefour Contact'] },
        'amazon.fr': { count: 8, clients: ['Amazon France', 'Amazon Prime', 'Amazon Business'] },
        'zalando.fr': { count: 6, clients: ['Zalando', 'Zalando Lounge', 'Zalando Plus'] },
        'cdiscount.com': { count: 4, clients: ['Cdiscount', 'Cdiscount Pro'] },
        'fnac.com': { count: 7, clients: ['Fnac', 'Fnac Darty', 'Fnac Spectacles'] },
        'darty.com': { count: 5, clients: ['Darty', 'Fnac Darty'] },
        'leclerc.com': { count: 9, clients: ['E.Leclerc', 'Leclerc Drive', 'Leclerc Auto'] },
        'auchan.fr': { count: 6, clients: ['Auchan', 'Auchan Drive', 'Auchan Retail'] }
      };
      
      const clientData = clientCounts[domain as keyof typeof clientCounts] || { count: 2, clients: ['Client Test'] };
      
      // E-commerce Platform Detection
      const platformData = {
        'carrefour.fr': { platform: 'Salesforce Commerce Cloud', confidence: 85 },
        'amazon.fr': { platform: 'Amazon Webstore', confidence: 95 },
        'zalando.fr': { platform: 'Custom Platform', confidence: 78 },
        'cdiscount.com': { platform: 'Magento Enterprise', confidence: 82 },
        'fnac.com': { platform: 'Hybris', confidence: 88 },
        'darty.com': { platform: 'Demandware', confidence: 79 },
        'leclerc.com': { platform: 'PrestaShop', confidence: 72 },
        'auchan.fr': { platform: 'WooCommerce', confidence: 68 }
      };
      
      const platform = platformData[domain as keyof typeof platformData] || { platform: null, confidence: 0 };
      
      // Domain Profile
      const profileData = {
        'carrefour.fr': { type: 'ecommerce' as const, brandName: 'Carrefour', confidence: 92 },
        'amazon.fr': { type: 'marketplace' as const, marketplaceType: 'B2C', confidence: 98 },
        'zalando.fr': { type: 'ecommerce' as const, brandName: 'Zalando', confidence: 89 },
        'cdiscount.com': { type: 'marketplace' as const, marketplaceType: 'Multi-vendor', confidence: 87 },
        'fnac.com': { type: 'ecommerce' as const, brandName: 'Fnac', confidence: 91 },
        'darty.com': { type: 'ecommerce' as const, brandName: 'Darty', confidence: 88 },
        'leclerc.com': { type: 'ecommerce' as const, brandName: 'E.Leclerc', confidence: 85 },
        'auchan.fr': { type: 'ecommerce' as const, brandName: 'Auchan', confidence: 83 }
      };
      
      const profile = profileData[domain as keyof typeof profileData] || { type: null, confidence: 0 };
      
      return {
        domain,
        status: 'completed' as const,
        startTime: new Date(Date.now() - (index + 1) * 2000),
        endTime: new Date(Date.now() - index * 500),
        fromCache: false,
        checks: {
          botBlockers: {
            status: 'completed' as const,
            blockers: botBlockers,
            overallSeverity: botBlockers.length === 0 ? 'low' as const : 
                           botBlockers.some(b => b.severity === 'high') ? 'high' as const : 'medium' as const
          },
          crawlStatus: {
            status: 'completed' as const,
            on360: isPopular ? Math.random() > 0.3 : Math.random() > 0.7,
            onWIT: isPopular ? Math.random() > 0.4 : Math.random() > 0.8,
            onSurf: isPopular ? Math.random() > 0.5 : Math.random() > 0.9,
            lastCrawl: isPopular ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
          },
          clientUsage: {
            status: 'completed' as const,
            count: clientData.count,
            clients: clientData.clients
          },
          domainProfile: {
            status: 'completed' as const,
            type: profile.type,
            confidence: profile.confidence,
            indicators: profile.type ? [
              `${profile.type} website structure detected`,
              ...(profile.type === 'ecommerce' ? ['Shopping cart functionality', 'Product catalog'] : []),
              ...(profile.type === 'marketplace' ? ['Multi-vendor platform', 'Seller registration'] : []),
              'SSL certificate valid',
              'Mobile responsive design'
            ] : ['Unable to determine website type'],
            brandName: 'brandName' in profile ? profile.brandName : undefined,
            marketplaceType: 'marketplaceType' in profile ? profile.marketplaceType : undefined
          },
          ecommercePlatform: {
            status: 'completed' as const,
            platform: platform.platform
          },
          productIdentifiers: {
            status: 'completed' as const,
            ean: Math.random() > 0.3,
            gtin: Math.random() > 0.4,
            upc: Math.random() > 0.6,
            mpn: Math.random() > 0.5,
            coverage: Math.floor(Math.random() * 40) + 60 // 60-100%
          },
          eanResponsive: {
            status: 'completed' as const,
            responsive: Math.random() > 0.4,
            searchFormFound: Math.random() > 0.3,
            testResults: Math.random() > 0.4 ? [
              'EAN search form detected',
              'Test EAN 3760123456789 submitted',
              'Product results returned successfully',
              `Response time: ${Math.floor(Math.random() * 2000 + 500)}ms`
            ] : [
              'Search form found but no EAN response',
              'EAN functionality not available'
            ]
          }
        }
      };
    });
    
    console.log('🎭 Generated mockup data for', mockResults.length, 'domains');
    setResults(mockResults);
    setIsChecking(false);
    setCurrentStep('');
  };

  const handleForceUpdate = (domain: string) => {
    const newForceUpdate = new Set(forceUpdate);
    newForceUpdate.add(domain);
    setForceUpdate(newForceUpdate);
    
    // Relancer l'analyse pour ce domaine spécifique
    handleStartCheck([domain]);
  };

  const handleClearCache = async () => {
    if (window.confirm('⚠️ Êtes-vous sûr de vouloir vider tout le cache des vérifications de domaines ?\n\nCette action est irréversible et toutes les analyses précédentes seront supprimées.')) {
      try {
        const success = await clearAllCache();
        if (success) {
          alert('✅ Cache vidé avec succès !');
          // Vider aussi les résultats actuels
          setResults([]);
          setForceUpdate(new Set());
        } else {
          alert('❌ Erreur lors du vidage du cache');
        }
      } catch (error) {
        console.error('Error clearing cache:', error);
        alert('❌ Erreur lors du vidage du cache');
      }
    }
  };
  const checkCrawlStatusFromDB = async (domain: string, index: number) => {
    console.log(`Checking database crawl status for ${domain}`);
    
    let onWIT = false;
    let lastCrawl: string | undefined;
    
    try {
      const { data, error } = await supabase
        .from('domain_crawl_status')
        .select('domain, w2p_cp')
        .eq('domain', domain)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') {
        console.error(`Error checking WIT crawl status for ${domain}:`, error);
      } else if (data) {
        onWIT = data.w2p_cp === true || data.w2p_cp === 'true' || data.w2p_cp === 1;
        if (onWIT) {
          lastCrawl = new Date().toISOString();
        }
      }
    } catch (err) {
      console.error(`Exception querying domain_crawl_status for ${domain}:`, err);
    }
    
    // Mock 360 status for now
    const on360 = Math.random() > 0.5;
    if (on360 && !lastCrawl) {
      lastCrawl = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
    }
    
    console.log(`Final crawl status for ${domain}: WIT=${onWIT}, 360=${on360}`);

    setResults(prev => prev.map((result, i) => 
      i === index ? {
        ...result,
        checks: {
          ...result.checks,
          crawlStatus: { status: 'completed', on360, onWIT, lastCrawl }
        }
      } : result
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-100 rounded-xl">
            <Globe className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{getTranslation(language, 'domainChecker')}</h1>
            <p className="text-gray-600">{getTranslation(language, 'domainCheckerDesc')}</p>
          </div>
          {/* Development Tools */}
          {import.meta.env.DEV && (
            <div className="ml-auto">
              <button
                onClick={handleClearCache}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                title="Vider le cache des vérifications (mode développement)"
              >
                <History className="h-4 w-4" />
                Clear Cache
              </button>
            </div>
          )}
          
          {/* Mockup Data Button */}
          <div className="ml-auto">
            <button
              onClick={handleLoadMockData}
              className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              title="Charger des données fictives pour démonstration"
            >
              🎭 Mockup Data
            </button>
          </div>
        </div>
      </div>

      {/* Test Selection */}
      <TestSelector
        selectedTests={selectedTests}
        onTestToggle={handleTestToggle}
        language={language}
      />

      {/* Input Section */}
      <DomainInput
        onStartCheck={handleStartCheck}
        isChecking={isChecking}
        language={language}
        hasSelectedTests={Object.values(selectedTests).some(Boolean)}
      />

      {/* Progress */}
      {isChecking && currentStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">{currentStep}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <DomainResults
          results={results}
          language={language}
          isChecking={isChecking}
          onForceUpdate={handleForceUpdate}
        />
      )}

      {/* Batch History */}
      <BatchHistory />
    </div>
  );
};