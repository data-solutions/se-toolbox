// Système de réception des callbacks N8N
// Ce fichier gère la réception des callbacks depuis N8N

export interface CallbackData {
  taskId: string;
  domain: string;
  checkType: string;
  status: 'completed' | 'error';
  data?: any;
  error?: string;
  timestamp: string;
}

// Type pour les handlers de callback
type CallbackHandler = (data: CallbackData) => void;

class CallbackReceiver {
  private handlers: Set<CallbackHandler> = new Set();
  private eventSource: EventSource | null = null;
  private pollingInterval: number | null = null;

  // Méthode 1: Server-Sent Events (SSE) - Recommandé
  startSSEConnection(sseUrl: string) {
    console.log('🔌 Starting SSE connection to:', sseUrl);
    
    this.eventSource = new EventSource(sseUrl);
    
    this.eventSource.onmessage = (event) => {
      try {
        const data: CallbackData = JSON.parse(event.data);
        console.log('📡 SSE callback received:', data);
        this.notifyHandlers(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };
    
    this.eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };
  }

  // Méthode 2: Polling d'un endpoint
  startPolling(pollingUrl: string, intervalMs: number = 2000) {
    console.log('🔄 Attempting to start polling to:', pollingUrl);
    console.warn('⚠️ CORS LIMITATION: Webhook.site polling from browser is blocked by CORS policy');
    console.warn('💡 SOLUTION 1: Use a proxy server or backend endpoint');
    console.warn('💡 SOLUTION 2: Use Server-Sent Events (SSE) if N8N supports it');
    console.warn('💡 SOLUTION 3: Use WebSockets if available');
    console.warn('🎭 Falling back to simulation mode for now');
    
    // CORS bloque les requêtes vers webhook.site depuis le navigateur
    // On ne peut pas faire de polling direct
    console.error('❌ Cannot poll webhook.site from browser due to CORS restrictions');
    return;
  }

  // Méthode 3: WebSocket (si disponible)
  startWebSocketConnection(wsUrl: string) {
    console.log('🔌 Starting WebSocket connection to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
      try {
        const data: CallbackData = JSON.parse(event.data);
        console.log('📡 WebSocket callback received:', data);
        this.notifyHandlers(data);
      } catch (error) {
        console.error('Error parsing WebSocket data:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  // Ajouter un handler pour recevoir les callbacks
  addHandler(handler: CallbackHandler) {
    this.handlers.add(handler);
    console.log(`📝 Callback handler added, total: ${this.handlers.size}`);
  }

  // Supprimer un handler
  removeHandler(handler: CallbackHandler) {
    this.handlers.delete(handler);
    console.log(`🗑️ Callback handler removed, remaining: ${this.handlers.size}`);
  }

  // Notifier tous les handlers
  private notifyHandlers(data: CallbackData) {
    console.log(`📢 REAL CALLBACK: Notifying ${this.handlers.size} handlers with N8N data:`, data);
    this.handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in callback handler:', error);
      }
    });
  }

  // Nettoyer les connexions
  cleanup() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    this.handlers.clear();
    console.log('🧹 Callback receiver cleaned up');
  }
}

// Instance singleton
export const callbackReceiver = new CallbackReceiver();

// Fonction utilitaire pour démarrer la réception selon la configuration
export const startCallbackReception = () => {
  const mode = import.meta.env.VITE_CALLBACK_MODE || 'webhook-site';
  
  console.log('🚀 Starting callback reception with mode:', mode);
  console.log('⚠️ IMPORTANT: Browser CORS limitations prevent direct webhook.site polling');
  console.log('💡 For production, consider using:');
  console.log('   1. Server-Sent Events (SSE) from your backend');
  console.log('   2. WebSockets for real-time communication');
  console.log('   3. A proxy server to bypass CORS');
  console.log('🎭 Using simulation mode for now...');
  
  switch (mode) {
    case 'webhook-site':
      console.warn('❌ Webhook.site polling is not possible from browser due to CORS');
      console.warn('🎭 Falling back to simulation mode');
      // Fallback to simulation since we can't poll webhook.site from browser
      break;
      
    case 'sse':
      const sseUrl = import.meta.env.VITE_SSE_CALLBACK_URL;
      if (sseUrl) {
        callbackReceiver.startSSEConnection(sseUrl);
      }
      break;
      
    case 'polling':
      const pollingUrl = import.meta.env.VITE_POLLING_CALLBACK_URL;
      if (pollingUrl) {
        callbackReceiver.startPolling(pollingUrl);
      }
      break;
      
    case 'websocket':
      const wsUrl = import.meta.env.VITE_WS_CALLBACK_URL;
      if (wsUrl) {
        callbackReceiver.startWebSocketConnection(wsUrl);
      }
      break;
      
    default:
      console.log('🎭 Using simulation mode for callbacks');
  }
};