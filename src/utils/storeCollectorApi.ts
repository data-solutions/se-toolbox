// Store Collector API Configuration
const STORE_COLLECTOR_WEBHOOK_URL = import.meta.env.VITE_STORE_COLLECTOR_WEBHOOK_URL || 'https://gaelmartinez.app.n8n.cloud/webhook/retailers/ingest';

interface StoreCollectionPayload {
  collectionId: string;
  method: 'manual' | 'website' | 'brand';
  data: {
    retailers?: Array<{
      name: string;
      country: string;
      domain?: string;
    }>;
    websiteUrl?: string;
    brandName?: string;
    brandCountry?: string;
  };
  timestamp: string;
  user?: string;
  callbackUrl?: string;
}

interface StoreCollectionResponse {
  success: boolean;
  collectionId: string;
  message?: string;
  estimatedStores?: number;
  taskId?: string;
}

export const sendStoreCollectionToN8N = async (payload: StoreCollectionPayload): Promise<StoreCollectionResponse> => {
  console.log('🏪 === DÉBUT APPEL API STORE COLLECTOR N8N ===');
  console.log('🔗 URL Webhook:', STORE_COLLECTOR_WEBHOOK_URL);
  
  // Vérifier que l'URL est configurée
  if (!STORE_COLLECTOR_WEBHOOK_URL || STORE_COLLECTOR_WEBHOOK_URL.includes('your-n8n-instance')) {
    throw new Error('URL du webhook Store Collector non configurée. Vérifiez votre fichier .env');
  }
  
  console.log('📤 Payload envoyé:', {
    collectionId: payload.collectionId,
    method: payload.method,
    dataType: typeof payload.data,
    retailersCount: payload.data.retailers?.length || 0,
    websiteUrl: payload.data.websiteUrl,
    brandName: payload.data.brandName,
    user: payload.user
  });

  try {
    console.log('📡 Envoi de la requête vers N8N...');
    
    const response = await fetch(STORE_COLLECTOR_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15000) // 15 seconds timeout
    });

    console.log('📊 === RÉPONSE HTTP STORE COLLECTOR ===');
    console.log('🔢 Status:', response.status);
    console.log('📝 Status Text:', response.statusText);
    console.log('✅ OK:', response.ok);
    
    // Log des headers de réponse
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });
    console.log('📋 Headers réponse:', responseHeaders);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur HTTP Store Collector:', errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}\nDétails: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    console.log('🏷️ Content-Type:', contentType);
    
    // Récupérer le texte brut de la réponse
    const rawResponseText = await response.text();
    console.log('🔍 === RÉPONSE BRUTE STORE COLLECTOR ===');
    console.log('📏 Longueur réponse brute:', rawResponseText.length);
    console.log('📄 Contenu brut complet:', rawResponseText);

    // Vérifier si c'est vide
    if (!rawResponseText || rawResponseText.trim() === '') {
      console.error('❌ PROBLÈME: Réponse complètement vide');
      throw new Error('Le webhook Store Collector N8N a renvoyé une réponse vide');
    }

    // Essayer de parser en JSON
    let responseData: any;
    try {
      console.log('🔄 Tentative de parsing JSON...');
      responseData = JSON.parse(rawResponseText);
      console.log('✅ JSON parsé avec succès');
      console.log('🔍 === ANALYSE STRUCTURE JSON ===');
      console.log('📦 Type de responseData:', typeof responseData);
      console.log('📋 Est un tableau:', Array.isArray(responseData));
      console.log('🔍 Contenu responseData:', responseData);
    } catch (jsonError) {
      console.log('⚠️ Échec du parsing JSON, traitement comme texte brut');
      console.log('🔍 Erreur JSON:', jsonError);
      
      // Si ce n'est pas du JSON, créer une réponse par défaut
      responseData = {
        success: true,
        collectionId: payload.collectionId,
        message: rawResponseText,
        taskId: `task_${Date.now()}`
      };
    }

    // Valider la structure de la réponse
    const finalResponse: StoreCollectionResponse = {
      success: responseData.success !== false, // Par défaut true sauf si explicitement false
      collectionId: responseData.collectionId || payload.collectionId,
      message: responseData.message || 'Collection démarrée avec succès',
      estimatedStores: responseData.estimatedStores || responseData.estimated_stores,
      taskId: responseData.taskId || responseData.task_id || `task_${Date.now()}`
    };

    console.log('✅ === SUCCÈS API STORE COLLECTOR N8N ===');
    console.log('🎉 Réponse finale validée:', finalResponse);
    return finalResponse;
    
  } catch (error) {
    console.error('💥 === ERREUR API STORE COLLECTOR N8N ===');
    console.error('🔥 Type d\'erreur:', error?.constructor?.name);
    console.error('📝 Message:', error instanceof Error ? error.message : String(error));
    console.error('📚 Stack:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = `Impossible de se connecter au webhook Store Collector N8N (${STORE_COLLECTOR_WEBHOOK_URL}). Vérifiez:
1. L'URL du webhook dans votre fichier .env
2. Que votre instance N8N est accessible
3. Votre connexion réseau`;
      console.error('🌐 Erreur réseau:', networkError);
      throw new Error(networkError);
    }
    
    throw new Error(`Erreur webhook Store Collector N8N: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// Fonction pour générer un payload d'exemple avec plusieurs retailers
const generateExamplePayload = (): StoreCollectionPayload => {
  const collectionId = `collection_${Date.now()}`;
  
  return {
    collectionId,
    method: 'manual',
    data: {
      retailers: [
        {
          name: "Carrefour",
          country: "FR",
          domain: "carrefour.fr"
        },
        {
          name: "Auchan",
          country: "FR",
          domain: "auchan.fr"
        },
        {
          name: "Leclerc",
          country: "FR",
          domain: "leclerc.com"
        },
        {
          name: "El Corte Inglés",
          country: "ES",
          domain: "elcorteingles.es"
        },
        {
          name: "Mercadona",
          country: "ES",
          domain: "mercadona.es"
        },
        {
          name: "Esselunga",
          country: "IT",
          domain: "esselunga.it"
        },
        {
          name: "Coop",
          country: "IT",
          domain: "e-coop.it"
        },
        {
          name: "Rewe",
          country: "DE",
          domain: "rewe.de"
        },
        {
          name: "Edeka",
          country: "DE",
          domain: "edeka.de"
        },
        {
          name: "Tesco",
          country: "GB",
          domain: "tesco.com"
        }
      ]
    },
    timestamp: new Date().toISOString(),
    user: "Gaël MARTINEZ",
    callbackUrl: "https://webhook.site/your-callback-url"
  };
};

// Fonction pour tester l'envoi vers N8N
const testStoreCollectorWebhook = async (): Promise<void> => {
  console.log('🧪 === TEST WEBHOOK STORE COLLECTOR ===');
  
  const examplePayload = generateExamplePayload();
  
  console.log('📤 Payload de test généré:');
  console.log(JSON.stringify(examplePayload, null, 2));
  
  try {
    const response = await sendStoreCollectionToN8N(examplePayload);
    console.log('✅ Test réussi:', response);
    return response;
  } catch (error) {
    console.error('❌ Test échoué:', error);
    throw error;
  }
};

export const generateCollectionTitle = (method: string, data: any): string => {
  const timestamp = new Date().toLocaleDateString('fr-FR');
  
  switch (method) {
    case 'manual':
      const count = data.retailers?.length || 0;
      return `Saisie manuelle - ${count} retailer${count > 1 ? 's' : ''} (${timestamp})`;
    case 'website':
      const domain = data.websiteUrl ? new URL(data.websiteUrl).hostname : 'site web';
      return `Scraping ${domain} (${timestamp})`;
    case 'brand':
      return `Marque ${data.brandName} (${timestamp})`;
    default:
      return `Collection ${timestamp}`;
  }
};