import React, { useState } from 'react';
import { Plus, Globe, Search, Building2, MapPin } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../utils/translations';

interface StoreInputProps {
  onStartCollection: (data: { 
    method: 'manual' | 'website' | 'brand'; 
    data: any;
  }) => void;
  isProcessing: boolean;
  language: Language;
}

export const StoreInput: React.FC<StoreInputProps> = ({ 
  onStartCollection, 
  isProcessing, 
  language 
}) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'website' | 'brand'>('manual');
  const [storeText, setStoreText] = useState('');
  const [stores, setStores] = useState<string[]>([]);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [brandName, setBrandName] = useState('');

  const handleAddStore = () => {
    if (storeText.trim()) {
      const newDomains = storeText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
          // Nettoyer chaque ligne et séparer par virgule ou point-virgule
          const separator = line.includes(';') ? ';' : ',';
          const parts = line.split(separator).map(part => part.trim());
          
          // Retourner la ligne nettoyée
          return parts.join(', ');
        })
        .filter(cleanedLine => !stores.includes(cleanedLine));
      
      setStores([...stores, ...newDomains]);
      setStoreText('');
    }
  };

  const handleRemoveStore = (index: number) => {
    setStores(stores.filter((_, i) => i !== index));
  };


  const handleStartCollection = () => {
    let collectionData;
    
    if (inputMethod === 'manual') {
      // Parser chaque ligne de store pour extraire les informations
      const retailers = stores.map(storeText => {
        const separator = storeText.includes(';') ? ';' : ',';
        const parts = storeText.split(separator).map(part => part.trim());
        
        return {
          name: parts[0] || '',
          country: parts[1] || 'FR',
          domain: parts[2] || undefined
        };
      });
      
      collectionData = { retailers };
    } else if (inputMethod === 'website') {
      collectionData = { websiteUrl: websiteUrl };
    } else {
      collectionData = { brandName };
    }

    onStartCollection({
      method: inputMethod,
      data: collectionData
    });
  };

  const isValid = () => {
    switch (inputMethod) {
      case 'manual':
        return stores.length > 0;
      case 'website':
        return websiteUrl.trim() !== '';
      case 'brand':
        return brandName.trim() !== '';
      default:
        return false;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Méthode de collecte</h3>
      <h3 className="text-lg font-semibold text-gray-900">{getTranslation(language, 'collectionMethod')}</h3>

      {/* Method Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setInputMethod('manual')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
            inputMethod === 'manual'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Plus className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Saisie manuelle</div>
            <div className="font-medium">{getTranslation(language, 'manualInput')}</div>
            <div className="text-sm opacity-75">{getTranslation(language, 'retailersCountryCodes')}</div>
          </div>
        </button>
        
        <button
          onClick={() => setInputMethod('website')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
            inputMethod === 'website'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Globe className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Site web</div>
            <div className="font-medium">{getTranslation(language, 'websiteScraping')}</div>
            <div className="text-sm opacity-75">{getTranslation(language, 'automaticScraping')}</div>
          </div>
        </button>
        
        <button
          onClick={() => setInputMethod('brand')}
          className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
            inputMethod === 'brand'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <Building2 className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Par marque</div>
            <div className="font-medium">{getTranslation(language, 'brandSearch')}</div>
            <div className="text-sm opacity-75">{getTranslation(language, 'automaticSearch')}</div>
          </div>
        </button>
      </div>

      {/* Input Forms */}
      {inputMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation(language, 'addRetailers')}
            </label>
            <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Format attendu :</h4>
              <h4 className="text-sm font-semibold text-blue-800 mb-2">{getTranslation(language, 'expectedFormat')}:</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div><code className="bg-white px-2 py-1 rounded">{getTranslation(language, 'retailerFormat')}</code></div>
                <div className="text-xs text-blue-600">
                  {getTranslation(language, 'formatInstructions')}
                </div>
              </div>
            </div>
            
            {/* Bouton d'exemple */}
            <div className="mb-3">
              <button
                type="button"
                onClick={() => setStoreText(`Carrefour, FR, carrefour.fr
Auchan, FR, auchan.fr
Leclerc, FR, leclerc.com
El Corte Inglés, ES, elcorteingles.es
Mercadona, ES, mercadona.es
Esselunga, IT, esselunga.it
Coop, IT, e-coop.it
Rewe, DE, rewe.de
Edeka, DE, edeka.de
Tesco, GB, tesco.com`)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                📋 {getTranslation(language, 'loadExample')}
              </button>
            </div>
            
            <div className="flex gap-3">
              <textarea
                value={storeText}
                onChange={(e) => setStoreText(e.target.value)}
                placeholder={getTranslation(language, 'retailersPlaceholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
              <button
                onClick={handleAddStore}
                disabled={!storeText.trim()}
                className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {stores.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation(language, 'retailersToCollect')} ({stores.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {stores.map((store, index) => (
                  <div
                    key={index}
                    className="flex items-start justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{store}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveStore(index)}
                      className="text-red-500 hover:text-red-700 transition-colors ml-2"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}


      {inputMethod === 'website' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation(language, 'websiteUrl')}
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder={getTranslation(language, 'websiteUrlPlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {getTranslation(language, 'websiteUrlDesc')}
            </p>
          </div>
        </div>
      )}

      {inputMethod === 'brand' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation(language, 'brandName')}
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder={getTranslation(language, 'brandNamePlaceholder')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {getTranslation(language, 'brandNameDesc')}
            </p>
          </div>
        </div>
      )}


      {/* Start Button */}
      <div className="flex justify-end">
        {/* Mock Data Button - Temporary */}
        <button
          onClick={() => {
            const mockData = {
              method: 'manual' as const,
              data: {
                retailers: [
                  { name: "Walmart", country: "US", domain: "walmart.com" },
                  { name: "Target", country: "US", domain: "target.com" },
                  { name: "Best Buy", country: "US", domain: "bestbuy.com" },
                  { name: "Home Depot", country: "US", domain: "homedepot.com" },
                  { name: "Costco", country: "US", domain: "costco.com" }
                ]
              }
            };
            onStartCollection(mockData);
          }}
          className="mr-3 flex items-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
        >
          🎭 Generate Mock Data
        </button>
        
        <button
          onClick={handleStartCollection}
          disabled={!isValid() || isProcessing}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            isValid() && !isProcessing
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {getTranslation(language, 'collectionInProgress')}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              {getTranslation(language, 'startCollection')}
            </>
          )}
        </button>
      </div>
    </div>
  );
};