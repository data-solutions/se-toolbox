import React, { useState } from 'react';
import { Package, Search, Download, MapPin, Globe, Building, Users, FileText, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { sendStoreCollectionToN8N, generateCollectionTitle } from '../../utils/storeCollectorApi';
import { StoreInput } from './StoreInput';
import { StoreResults } from './StoreResults';
import { StoreFilters } from './StoreFilters';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

export interface StoreData {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone?: string;
  email?: string;
  website?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  category?: string;
  brand?: string;
  chainName?: string;
  openingHours?: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  enrichedData?: {
    socialMedia?: {
      facebook?: string;
      instagram?: string;
      linkedin?: string;
    };
    businessInfo?: {
      employeeCount?: number;
      revenue?: string;
      industry?: string;
    };
    contactInfo?: {
      manager?: string;
      decisionMaker?: string;
    };
  };
  lastUpdated: Date;
  source: 'manual' | 'file' | 'api' | 'web-scraping';
}

export interface StoreCollectionResult {
  id: string;
  name: string;
  totalStores: number;
  processedStores: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  stores: StoreData[];
  createdAt: Date;
  updatedAt: Date;
}

interface StoreCollectorProps {
  language?: Language;
}

export const StoreCollector: React.FC<StoreCollectorProps> = ({ language = 'en' }) => {
  const [collections, setCollections] = useState<StoreCollectionResult[]>([]);
  const [currentCollection, setCurrentCollection] = useState<StoreCollectionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  const handleStartCollection = async (
    inputData: { 
      method: 'manual' | 'website' | 'brand'; 
      data: any;
    }
  ) => {
    setIsProcessing(true);
    
    const collectionId = `collection_${Date.now()}`;
    const collectionName = generateCollectionTitle(inputData.method, inputData.data);

    const newCollection: StoreCollectionResult = {
      id: collectionId,
      name: collectionName,
      totalStores: 0,
      processedStores: 0,
      status: 'pending',
      stores: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setCurrentCollection(newCollection);
    setCollections(prev => [newCollection, ...prev]);

    try {
      setCurrentStep('Envoi vers N8N...');
      
      const payload = {
        collectionId,
        method: inputData.method,
        timestamp: new Date().toISOString(),
        user: 'Store Collector User', // TODO: Récupérer l'utilisateur connecté
        data: inputData.data
      };


      console.log('📤 Envoi payload vers N8N:', payload);
      
      // Envoyer vers N8N
      const response = await sendStoreCollectionToN8N(payload);
      
      console.log('✅ Réponse N8N reçue:', response);
      
      // Mettre à jour la collection avec la réponse N8N
      updateCollection(collectionId, {
        status: 'processing',
        totalStores: response.estimatedStores || 0
      });
      
      setCurrentStep(`Collection démarrée - TaskID: ${response.taskId}`);
      
      // Simuler la progression (en attendant les vrais callbacks)
      setTimeout(() => {
        simulateStoreCollection(collectionId, inputData.method, inputData.data.retailers || inputData.data);
      }, 2000);
      
    } catch (error) {
      console.error('Error in store collection:', error);
      
      let errorMessage = 'Erreur inconnue';
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Impossible de se connecter au webhook N8N. Vérifiez votre connexion réseau et que l\'URL du webhook est correcte.';
        } else if (error.message.includes('non configurée')) {
          errorMessage = 'URL du webhook non configurée. Vérifiez votre fichier .env';
        } else {
          errorMessage = error.message;
        }
      }
      
      updateCollection(collectionId, { 
        status: 'error',
        stores: []
      });
      setCurrentStep(`Erreur: ${errorMessage}`);
      
      // Afficher l'erreur à l'utilisateur
      alert(`❌ Erreur de collecte:\n\n${errorMessage}`);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStep('');
      }, 3000);
    }
  };

  // Fonction de simulation en attendant les vrais callbacks N8N
  const simulateStoreCollection = async (collectionId: string, method: string, retailers: any) => {
    console.log('🎭 SIMULATION: Génération de données de test pour la collection', collectionId);
    
    let mockStores: StoreData[] = [];
    
    switch (method) {
      case 'manual':
        // Simuler l'enrichissement des retailers saisis manuellement avec 10-12 magasins par enseigne
        mockStores = [];
        retailers.forEach((retailer: any, retailerIndex: number) => {
          const brandName = retailer.name || `Retailer ${retailerIndex + 1}`;
          const countryCode = retailer.country || 'FR';
          const domain = retailer.domain || '';
          const storeCount = 10 + Math.floor(Math.random() * 3); // 10 à 12 magasins
          
          // Generate realistic data based on country
          let cities, coordinates, phonePrefix, addressFormat;
          if (countryCode === 'US') {
            cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Washington'];
            phonePrefix = '+1';
            addressFormat = ['Main St', 'Broadway', 'First Ave', 'Oak St', 'Park Ave', 'Elm St', 'Maple Ave', 'Cedar St'];
          } else if (countryCode === 'FR') {
            cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille', 'Strasbourg', 'Montpellier', 'Rennes', 'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'];
            phonePrefix = '+33';
            addressFormat = ['Rue de la Paix', 'Avenue des Champs', 'Boulevard Saint-Michel', 'Rue de Rivoli', 'Place de la République', 'Rue du Commerce', 'Avenue de la Liberté', 'Rue Victor Hugo'];
          } else if (countryCode === 'ES') {
            cities = ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Zaragoza', 'Málaga', 'Murcia', 'Palma', 'Las Palmas', 'Bilbao', 'Alicante', 'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Hospitalet', 'Vitoria', 'Granada', 'Elche', 'Oviedo'];
            phonePrefix = '+34';
            addressFormat = ['Calle Mayor', 'Avenida Principal', 'Plaza Central', 'Calle Real', 'Paseo de Gracia', 'Gran Vía', 'Calle de Alcalá', 'Rambla'];
          } else {
            cities = ['London', 'Birmingham', 'Manchester', 'Glasgow', 'Liverpool', 'Leeds', 'Sheffield', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Coventry', 'Bradford', 'Belfast', 'Nottingham', 'Kingston', 'Plymouth', 'Stoke', 'Wolverhampton', 'Derby'];
            phonePrefix = '+44';
            addressFormat = ['High Street', 'King Street', 'Queen Street', 'Church Street', 'Market Street', 'Victoria Street', 'Station Road', 'Mill Lane'];
          }
          
          // Générer 10-12 magasins pour cette enseigne
          for (let i = 0; i < storeCount; i++) {
            const randomCity = cities[Math.floor(Math.random() * cities.length)];
            const randomAddress = addressFormat[Math.floor(Math.random() * addressFormat.length)];
            
            // Coordonnées réalistes selon le pays
            let storeCoordinates;
            if (countryCode === 'US') {
              storeCoordinates = {
                lat: 39.8283 + (Math.random() - 0.5) * 20,
                lng: -98.5795 + (Math.random() - 0.5) * 40
              };
            } else if (countryCode === 'FR') {
              storeCoordinates = {
                lat: 46.2276 + (Math.random() - 0.5) * 6,
                lng: 2.2137 + (Math.random() - 0.5) * 8
              };
            } else if (countryCode === 'ES') {
              storeCoordinates = {
                lat: 40.4637 + (Math.random() - 0.5) * 8,
                lng: -3.7492 + (Math.random() - 0.5) * 12
              };
            } else {
              storeCoordinates = {
                lat: 54.7023 + (Math.random() - 0.5) * 8,
                lng: -3.2765 + (Math.random() - 0.5) * 6
              };
            }
            
            // Types de magasins variés
            const storeTypes = ['Centre Commercial', 'Centre-Ville', 'Retail Park', 'Gare', 'Aéroport', 'Drive', 'Express', 'Hypermarché', 'Supermarché', 'Proximité'];
            const storeType = storeTypes[Math.floor(Math.random() * storeTypes.length)];
            
            mockStores.push({
              id: `store_${Date.now()}_${retailerIndex}_${i}`,
              name: `${brandName} ${randomCity} ${storeType}`,
              address: `${Math.floor(Math.random() * 200) + 1} ${randomAddress}`,
              city: randomCity,
              country: getCountryName(countryCode),
              postalCode: countryCode === 'US' ? 
                `${Math.floor(Math.random() * 90000) + 10000}` : 
                countryCode === 'FR' ?
                `${Math.floor(Math.random() * 90000) + 10000}` :
                `${Math.floor(Math.random() * 90000) + 10000}`,
              phone: countryCode === 'US' ? 
                `${phonePrefix} ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}` :
                countryCode === 'FR' ?
                `${phonePrefix} ${Math.floor(Math.random() * 9) + 1} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 90) + 10}` :
                `${phonePrefix} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 900000) + 100000}`,
              website: domain ? (domain.startsWith('http') ? domain : `https://${domain}`) : undefined,
              brand: brandName,
              category: 'Retail',
              coordinates: storeCoordinates,
              status: 'completed',
              lastUpdated: new Date(),
              source: 'manual',
              brandColor: getBrandColor(brandName) // Nouvelle propriété pour la couleur
            });
          }
        });
        break;
        
      case 'website':
        // Simuler l'extraction depuis un site web
        mockStores = Array.from({ length: 8 }, (_, index) => ({
          id: `store_${Date.now()}_${index}`,
          name: `Store ${['Downtown', 'Shopping Center', 'Retail Park', 'Station'][index % 4]}`,
          address: `${Math.floor(Math.random() * 200) + 1} ${['Main St', 'Commerce Ave', 'Broadway'][index % 3]}`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston'][index % 4],
          country: 'United States',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          website: retailers.websiteUrl,
          coordinates: { 
            lat: 39.8283 + (Math.random() - 0.5) * 20, 
            lng: -98.5795 + (Math.random() - 0.5) * 40 
          },
          status: 'completed',
          lastUpdated: new Date(),
          source: 'web-scraping'
        }));
        break;
        
      case 'brand':
        // Simuler la recherche par marque
        mockStores = Array.from({ length: 12 }, (_, index) => ({
          id: `store_${Date.now()}_${index}`,
          name: `${retailers.brandName} ${['Downtown', 'Mall', 'Outlet', 'Station', 'Airport'][index % 5]}`,
          address: `${Math.floor(Math.random() * 200) + 1} ${['Main St', 'Broadway', 'First Ave', 'Park Ave', 'Oak St'][index % 5]}`,
          city: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'Austin'][index % 10],
          country: 'United States',
          postalCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          phone: `+1 ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
          brand: retailers.brandName,
          chainName: retailers.brandName,
          category: 'Retail',
          coordinates: { 
            lat: 39.8283 + (Math.random() - 0.5) * 20, 
            lng: -98.5795 + (Math.random() - 0.5) * 40 
          },
          status: 'completed',
          lastUpdated: new Date(),
          source: 'api'
        }));
        break;
    }
    
    // Simuler la progression
    setCurrentStep('Collecte en cours...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    updateCollection(collectionId, {
      stores: mockStores,
      totalStores: mockStores.length,
      processedStores: mockStores.length,
      status: 'completed'
    });
    
  };

  // Fonction pour attribuer une couleur à chaque enseigne
  const getBrandColor = (brandName: string): string => {
    const colors = [
      '#e74c3c', // Rouge
      '#3498db', // Bleu
      '#2ecc71', // Vert
      '#f39c12', // Orange
      '#9b59b6', // Violet
      '#1abc9c', // Turquoise
      '#e67e22', // Orange foncé
      '#34495e', // Gris bleu
      '#f1c40f', // Jaune
      '#e91e63', // Rose
      '#00bcd4', // Cyan
      '#ff5722', // Rouge orange
      '#795548', // Marron
      '#607d8b', // Bleu gris
      '#ff9800', // Orange ambré
      '#4caf50', // Vert clair
      '#673ab7', // Violet foncé
      '#009688', // Teal
      '#ff6f00', // Orange vif
      '#8bc34a'  // Vert lime
    ];
    
    // Utiliser un hash simple du nom de marque pour assigner une couleur consistante
    let hash = 0;
    for (let i = 0; i < brandName.length; i++) {
      hash = brandName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Fonction utilitaire pour convertir les codes pays en noms
  const getCountryName = (countryCode: string): string => {
    const countries: Record<string, string> = {
      'FR': 'France',
      'ES': 'Spain', 
      'IT': 'Italy',
      'DE': 'Germany',
      'GB': 'United Kingdom',
      'US': 'United States',
      'CA': 'Canada',
      'BE': 'Belgium',
      'NL': 'Netherlands',
      'CH': 'Switzerland',
      'PT': 'Portugal'
    };
    return countries[countryCode.toUpperCase()] || countryCode;
  };

  const updateCollection = (collectionId: string, updates: Partial<StoreCollectionResult>) => {
    setCollections(prev => prev.map(collection => 
      collection.id === collectionId 
        ? { ...collection, ...updates, updatedAt: new Date() }
        : collection
    ));
    
    if (currentCollection && currentCollection.id === collectionId) {
      setCurrentCollection(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
    }
  };

  const handleExportStores = (collection: StoreCollectionResult) => {
    const csvContent = [
      ['Name', 'Address', 'City', 'Country', 'Postal Code', 'Phone', 'Email', 'Website', 'Brand', 'Category', 'Latitude', 'Longitude'].join(','),
      ...collection.stores.map(store => [
        store.name,
        store.address,
        store.city,
        store.country,
        store.postalCode,
        store.phone || '',
        store.email || '',
        store.website || '',
        store.brand || '',
        store.category || '',
        store.coordinates?.lat || '',
        store.coordinates?.lng || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stores-${collection.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-green-100 rounded-xl">
            <Package className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Store List Collector</h1>
            <p className="text-gray-600">{getTranslation(language, 'storeCollectorDesc')}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Building className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{collections.reduce((sum, c) => sum + c.totalStores, 0)}</div>
                <div className="text-sm text-blue-700">{getTranslation(language, 'storesCollected')}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{collections.filter(c => c.status === 'completed').length}</div>
                <div className="text-sm text-green-700">{getTranslation(language, 'completedCollections')}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{collections.filter(c => c.status === 'processing').length}</div>
                <div className="text-sm text-yellow-700">{getTranslation(language, 'inProgress')}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{new Set(collections.flatMap(c => c.stores.map(s => s.city))).size}</div>
                <div className="text-sm text-purple-700">{getTranslation(language, 'citiesCovered')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Section */}
      <StoreInput
        onStartCollection={handleStartCollection}
        isProcessing={isProcessing}
        language={language}
      />

      {/* Progress */}
      {isProcessing && currentStep && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-blue-800 font-medium">{currentStep}</span>
          </div>
        </div>
      )}

      {/* Results */}
      {collections.length > 0 && (
        <StoreResults
          collections={collections}
          language={language}
          onExport={handleExportStores}
          onRefresh={(collectionId) => {
            // Handle refresh logic here
            console.log('Refreshing collection:', collectionId);
          }}
        />
      )}
    </div>
  );
};