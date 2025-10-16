// N8N Configuration
const N8N_WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL || 'https://your-n8n-instance.com/webhook/chat';

interface N8NPayload {
  chatInput: string;
  files?: File[];
  conversationId: string;
  timestamp: string;
  language?: string;
  user?: string;
}

export const sendMessageToN8N = async (payload: N8NPayload): Promise<string> => {
  console.log('🌐 === DÉBUT APPEL API N8N ===');
  console.log('🔗 URL Webhook:', N8N_WEBHOOK_URL);
  console.log('📤 Payload envoyé:', {
    chatInput: payload.chatInput,
    conversationId: payload.conversationId,
    fileCount: payload.files?.length || 0,
    language: payload.language,
    user: payload.user
  });

  try {
    const formData = new FormData();
    formData.append('chatInput', payload.chatInput);
    formData.append('conversationId', payload.conversationId);
    formData.append('timestamp', payload.timestamp);
    formData.append('language', payload.language || 'fr');
    formData.append('user', payload.user || 'Gael');
    
    // Add files if present
    if (payload.files && payload.files.length > 0) {
      payload.files.forEach((file, index) => {
        formData.append(`file_${index}`, file);
        console.log(`📎 Fichier ${index}:`, file.name, `(${file.size} bytes)`);
      });
      formData.append('fileCount', payload.files.length.toString());
    }

    console.log('📡 Envoi de la requête...');
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      // Ne pas définir Content-Type, laissons le navigateur le faire pour FormData
    });

    console.log('📊 === RÉPONSE HTTP ===');
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
      console.error('❌ Erreur HTTP:', errorText);
      throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}\nDétails: ${errorText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    console.log('🏷️ Content-Type:', contentType);
    
    // ÉTAPE 1: Récupérer le texte brut de la réponse
    const rawResponseText = await response.text();
    console.log('🔍 === RÉPONSE BRUTE ===');
    console.log('📏 Longueur réponse brute:', rawResponseText.length);
    console.log('📄 Contenu brut complet:', rawResponseText);
    console.log('🔤 Type de la réponse brute:', typeof rawResponseText);

    // ÉTAPE 2: Vérifier si c'est vide
    if (!rawResponseText || rawResponseText.trim() === '') {
      console.error('❌ PROBLÈME: Réponse complètement vide');
      throw new Error('Le webhook N8N a renvoyé une réponse vide');
    }

    // ÉTAPE 3: Essayer de parser en JSON
    let responseData: any;
    let finalResponse: string;

    try {
      console.log('🔄 Tentative de parsing JSON...');
      responseData = JSON.parse(rawResponseText);
      console.log('✅ JSON parsé avec succès');
      console.log('🔍 === ANALYSE STRUCTURE JSON ===');
      console.log('📦 Type de responseData:', typeof responseData);
      console.log('📋 Est un tableau:', Array.isArray(responseData));
      console.log('🔍 Contenu responseData:', responseData);
      
      if (Array.isArray(responseData)) {
        console.log('📊 Longueur du tableau:', responseData.length);
        if (responseData.length > 0) {
          console.log('🔍 Premier élément du tableau:', responseData[0]);
          console.log('🔍 Type du premier élément:', typeof responseData[0]);
          console.log('🔍 Clés du premier élément:', Object.keys(responseData[0] || {}));
        }
      } else if (typeof responseData === 'object' && responseData !== null) {
        console.log('🔍 Clés de l\'objet:', Object.keys(responseData));
      }

      // ÉTAPE 4: Traitement selon la structure
      if (Array.isArray(responseData) && responseData.length > 0) {
        console.log('📋 === TRAITEMENT FORMAT TABLEAU ===');
        const firstItem = responseData[0];
        console.log('🔍 Premier élément détaillé:', JSON.stringify(firstItem, null, 2));
        
        if (firstItem && typeof firstItem === 'object') {
          // Vérifier toutes les propriétés possibles
          const possibleKeys = ['output', 'message', 'text', 'content', 'response', 'result'];
          let foundKey = null;
          
          for (const key of possibleKeys) {
            if (firstItem.hasOwnProperty(key) && firstItem[key]) {
              console.log(`✅ Trouvé propriété "${key}":`, firstItem[key]);
              finalResponse = firstItem[key];
              foundKey = key;
              break;
            }
          }
          
          if (!foundKey) {
            console.warn('⚠️ Aucune propriété connue trouvée, utilisation de JSON.stringify');
            console.log('🔍 Toutes les propriétés disponibles:', Object.keys(firstItem));
            finalResponse = JSON.stringify(firstItem);
          } else {
            console.log(`🎯 Utilisation de la propriété "${foundKey}"`);
          }
        } else {
          console.warn('⚠️ Premier élément n\'est pas un objet valide');
          finalResponse = JSON.stringify(firstItem);
        }
      } else if (typeof responseData === 'object' && !Array.isArray(responseData)) {
        console.log('📋 === TRAITEMENT FORMAT OBJET ===');
        const possibleKeys = ['output', 'message', 'text', 'content', 'response', 'result'];
        let foundKey = null;
        
        for (const key of possibleKeys) {
          if (responseData.hasOwnProperty(key) && responseData[key]) {
            console.log(`✅ Trouvé propriété "${key}":`, responseData[key]);
            finalResponse = responseData[key];
            foundKey = key;
            break;
          }
        }
        
        if (!foundKey) {
          console.warn('⚠️ Aucune propriété connue trouvée dans l\'objet');
          console.log('🔍 Toutes les propriétés disponibles:', Object.keys(responseData));
          finalResponse = JSON.stringify(responseData);
        }
      } else if (typeof responseData === 'string') {
        console.log('📋 Réponse JSON est une string directe');
        finalResponse = responseData;
      } else {
        console.warn('⚠️ Format JSON non reconnu');
        finalResponse = JSON.stringify(responseData);
      }
      
    } catch (jsonError) {
      console.log('⚠️ Échec du parsing JSON, traitement comme texte brut');
      console.log('🔍 Erreur JSON:', jsonError);
      finalResponse = rawResponseText;
    }

    console.log('🎯 === RÉPONSE FINALE EXTRAITE ===');
    console.log('📏 Longueur finale:', finalResponse?.length || 0);
    console.log('🔤 Type final:', typeof finalResponse);
    console.log('📄 Contenu final complet:', finalResponse);

    // ÉTAPE 5: Validation finale
    if (!finalResponse || finalResponse.trim() === '') {
      console.error('❌ PROBLÈME: Réponse finale vide après traitement');
      console.error('🔍 Réponse brute était:', rawResponseText);
      console.error('🔍 responseData était:', responseData);
      throw new Error('Impossible d\'extraire une réponse valide du webhook N8N');
    }

    if (finalResponse.trim() === 'null' || finalResponse.trim() === 'undefined') {
      console.error('❌ PROBLÈME: Réponse finale invalide:', finalResponse);
      throw new Error('Le webhook N8N a renvoyé une réponse invalide');
    }

    console.log('✅ === SUCCÈS API N8N ===');
    console.log('🎉 Réponse finale validée:', finalResponse.substring(0, 100) + '...');
    return finalResponse.trim();
    
  } catch (error) {
    console.error('💥 === ERREUR API N8N ===');
    console.error('🔥 Type d\'erreur:', error?.constructor?.name);
    console.error('📝 Message:', error instanceof Error ? error.message : String(error));
    console.error('📚 Stack:', error instanceof Error ? error.stack : 'Pas de stack trace');
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      const networkError = `Impossible de se connecter au webhook N8N (${N8N_WEBHOOK_URL}). Vérifiez:
1. L'URL du webhook dans votre fichier .env
2. Que votre instance N8N est accessible
3. Votre connexion réseau`;
      console.error('🌐 Erreur réseau:', networkError);
      throw new Error(networkError);
    }
    
    throw new Error(`Erreur webhook N8N: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

export const generateConversationTitle = (firstMessage: string): string => {
  // Vérifier si firstMessage est valide
  if (!firstMessage || typeof firstMessage !== 'string' || firstMessage.trim() === '') {
    return 'Nouvelle conversation';
  }
  
  const words = firstMessage.split(' ').slice(0, 5);
  return words.join(' ') + (firstMessage.split(' ').length > 5 ? '...' : '');
};