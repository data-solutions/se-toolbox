import React, { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin, Phone, Mail, Globe, Building, Download, RefreshCw, Eye, Filter, Package, Map } from 'lucide-react';
import { StoreCollectionResult, StoreData } from './StoreCollector';
import { StoreMapView } from './StoreMapView';
import { Language } from '../../types';
import { getTranslation } from '../../utils/translations';

interface StoreResultsProps {
  collections: StoreCollectionResult[];
  language: Language;
  onExport: (collection: StoreCollectionResult) => void;
  onRefresh: (collectionId: string) => void;
}

export const StoreResults: React.FC<StoreResultsProps> = ({ 
  collections, 
  language, 
  onExport, 
  onRefresh 
}) => {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set());
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('cards');
  const [showMap, setShowMap] = useState(false);

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections);
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId);
    } else {
      newExpanded.add(collectionId);
    }
    setExpandedCollections(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case 'processing':
        return <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>;
      case 'error':
        return <div className="w-3 h-3 bg-red-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-400 rounded-full"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          {getTranslation(language, 'collectionResults')} ({collections.length} {getTranslation(language, 'collections')})
        </h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'cards' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslation(language, 'cards')}
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                viewMode === 'list' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {getTranslation(language, 'list')}
            </button>
            <button
              onClick={() => setShowMap(!showMap)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                showMap ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Map className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Map View */}
      {showMap && collections.length > 0 && (
        <div className="mb-6">
          <StoreMapView
            stores={collections.flatMap(c => c.stores)}
            language={language}
            onStoreSelect={(store) => {
              console.log('Store selected:', store);
            }}
          />
        </div>
      )}

      {/* Collections List */}
      <div className="space-y-3">
        {collections.map((collection) => (
          <div key={collection.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Collection Header */}
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCollection(collection.id)}
            >
              <div className="flex items-center gap-4">
                {expandedCollections.has(collection.id) ? (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                )}
                <Package className="h-6 w-6 text-green-500" />
                <div>
                  <h3 className="font-semibold text-gray-900">{collection.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    {getStatusIcon(collection.status)}
                    <span className="text-sm text-gray-600">
                      {collection.processedStores}/{collection.totalStores} {getTranslation(language, 'storesProcessed')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(collection.updatedAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(collection.status)}`}>
                  {collection.status === 'completed' ? getTranslation(language, 'completed') :
                   collection.status === 'processing' ? getTranslation(language, 'processing') :
                   collection.status === 'error' ? getTranslation(language, 'statusError') : getTranslation(language, 'pending')}
                </span>
                
                {collection.status === 'completed' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExport(collection);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    <Download className="h-3 w-3" />
                    {getTranslation(language, 'refresh')}
                  </button>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh(collection.id);
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  <RefreshCw className="h-3 w-3" />
                  Actualiser
                </button>
              </div>
            </div>

            {/* Collection Details */}
            {expandedCollections.has(collection.id) && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collection.stores.map((store) => (
                      <div key={store.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">{store.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                              {store.country}
                            </span>
                            {getStatusIcon(store.status)}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="text-gray-600">
                              <div>{store.address}</div>
                              <div>{store.postalCode} {store.city}</div>
                              <div className="text-xs text-gray-500">{store.country}</div>
                            </div>
                          </div>
                          
                          {store.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{store.phone}</span>
                            </div>
                          )}
                          
                          {store.website && (
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-gray-400" />
                              <a 
                                href={store.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 transition-colors truncate"
                              >
                                {store.website.replace(/^https?:\/\//, '')}
                              </a>
                            </div>
                          )}
                          
                          {store.brand && (
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-gray-600">{store.brand}</span>
                            </div>
                          )}
                        </div>
                        
                        {store.category && (
                          <div className="mt-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                              {store.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="min-w-full">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Nom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Adresse</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Contact</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Marque</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-900 uppercase">Statut</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {collection.stores.map((store) => (
                            <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-3">
                                <div className="font-medium text-gray-900">{store.name}</div>
                                {store.category && (
                                  <div className="text-xs text-gray-500">{store.category}</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">{store.address}</div>
                                <div className="text-xs text-gray-500">{store.postalCode} {store.city}, {store.country}</div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="space-y-1">
                                  {store.phone && (
                                    <div className="text-xs text-gray-600">{store.phone}</div>
                                  )}
                                  {store.email && (
                                    <div className="text-xs text-gray-600">{store.email}</div>
                                  )}
                                  {store.website && (
                                    <a 
                                      href={store.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                                    >
                                      Site web
                                    </a>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900">{store.brand || '-'}</div>
                                {store.chainName && store.chainName !== store.brand && (
                                  <div className="text-xs text-gray-500">{store.chainName}</div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(store.status)}
                                  <span className="text-sm text-gray-600">
                                    {store.status === 'completed' ? 'Traité' :
                                     store.status === 'processing' ? 'En cours' :
                                     store.status === 'error' ? getTranslation(language, 'statusError') : getTranslation(language, 'pending')}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {collection.stores.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun magasin collecté</h3>
                    <p className="text-gray-500">La collecte n'a pas encore commencé ou aucun résultat trouvé.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {collections.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{getTranslation(language, 'noCollectionStarted')}</h3>
          <p className="text-gray-600">{getTranslation(language, 'useOptionsAbove')}</p>
        </div>
      )}
    </div>
  );
};