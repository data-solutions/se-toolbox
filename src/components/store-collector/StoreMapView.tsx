import React, { useEffect, useRef } from 'react';
import { MapPin, Navigation, Maximize2 } from 'lucide-react';
import { StoreData } from './StoreCollector';
import { Language } from '../../types';

interface StoreMapViewProps {
  stores: StoreData[];
  language: Language;
  onStoreSelect?: (store: StoreData) => void;
}

export const StoreMapView: React.FC<StoreMapViewProps> = ({ 
  stores, 
  language, 
  onStoreSelect 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize Leaflet map
    const initMap = async () => {
      // Dynamically import Leaflet
      const L = await import('leaflet');
      
      // Fix for default markers in Leaflet
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Create map centered on Europe/US based on stores
      const defaultCenter: [number, number] = stores.length > 0 && stores[0].coordinates 
        ? [stores[0].coordinates.lat, stores[0].coordinates.lng]
        : [39.8283, -98.5795]; // Center of US

      mapInstanceRef.current = L.map(mapRef.current).setView(defaultCenter, 6);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(mapInstanceRef.current);

      // Add stores as markers
      updateMarkers(L);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const updateMarkers = async (L: any) => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => {
      mapInstanceRef.current.removeLayer(marker);
    });
    markersRef.current = [];

    // Créer des icônes personnalisées pour chaque marque
    const createCustomIcon = (color: string) => {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 25px;
            height: 25px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            color: white;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.5);
          ">
            🏪
          </div>
        `,
        iconSize: [25, 25],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12]
      });
    };

    // Add new markers
    const bounds = L.latLngBounds([]);
    
    stores.forEach((store) => {
      if (store.coordinates) {
        const customIcon = store.brandColor ? createCustomIcon(store.brandColor) : undefined;
        const marker = L.marker([store.coordinates.lat, store.coordinates.lng], {
          icon: customIcon
        })
          .addTo(mapInstanceRef.current);

        // Create popup content
        const popupContent = `
          <div class="p-3 min-w-[250px]">
            <div class="flex items-center gap-3 mb-3">
              ${store.brandColor ? `<div style="width: 16px; height: 16px; background-color: ${store.brandColor}; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>` : ''}
              <h3 class="font-bold text-lg text-gray-900">${store.name}</h3>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex items-start gap-2">
                <span class="text-gray-500">📍</span>
                <div>
                  <div class="text-gray-900">${store.address}</div>
                  <div class="text-gray-600">${store.postalCode} ${store.city}</div>
                  <div class="text-gray-500">${store.country}</div>
                </div>
              </div>
              ${store.phone ? `
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">📞</span>
                  <span class="text-gray-900">${store.phone}</span>
                </div>
              ` : ''}
              ${store.website ? `
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">🌐</span>
                  <a href="${store.website}" target="_blank" class="text-blue-600 hover:text-blue-700">${store.website.replace(/^https?:\/\//, '')}</a>
                </div>
              ` : ''}
              ${store.brand ? `
                <div class="flex items-center gap-2">
                  <span class="text-gray-500">🏢</span>
                  <span class="text-gray-900">${store.brand}</span>
                </div>
              ` : ''}
              ${store.category ? `
                <div class="mt-2">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">${store.category}</span>
                </div>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        
        // Add click handler
        marker.on('click', () => {
          if (onStoreSelect) {
            onStoreSelect(store);
          }
        });

        markersRef.current.push(marker);
        bounds.extend([store.coordinates.lat, store.coordinates.lng]);
      }
    });

    // Fit map to show all markers
    if (stores.length > 0 && bounds.isValid()) {
      mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
    }
  };

  // Update markers when stores change
  useEffect(() => {
    if (mapInstanceRef.current) {
      import('leaflet').then(L => updateMarkers(L));
    }
  }, [stores]);

  const centerOnStores = () => {
    if (mapInstanceRef.current && stores.length > 0) {
      import('leaflet').then(L => {
        const bounds = L.latLngBounds([]);
        stores.forEach(store => {
          if (store.coordinates) {
            bounds.extend([store.coordinates.lat, store.coordinates.lng]);
          }
        });
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Map Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              Store Locations ({stores.filter(s => s.coordinates).length} mapped)
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={centerOnStores}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
            >
              <Navigation className="h-4 w-4" />
              Center Map
            </button>
            <button
              onClick={() => {
                if (mapRef.current) {
                  mapRef.current.requestFullscreen?.();
                }
              }}
              className="flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              <Maximize2 className="h-4 w-4" />
              Fullscreen
            </button>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96"
          style={{ minHeight: '400px' }}
        />
        
        {stores.filter(s => s.coordinates).length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No locations to display</h3>
              <p className="text-gray-600">Stores need coordinates to be displayed on the map</p>
            </div>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            {/* Légende des couleurs par marque */}
            {stores.length > 0 && (
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-gray-600 font-medium">Enseignes:</span>
                {Array.from(new Set(stores.map(s => s.brand).filter(Boolean))).slice(0, 8).map(brand => {
                  const brandColor = stores.find(s => s.brand === brand)?.brandColor;
                  return (
                    <div key={brand} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: brandColor || '#3b82f6' }}
                      ></div>
                      <span className="text-gray-600 text-xs">{brand}</span>
                    </div>
                  );
                })}
                {Array.from(new Set(stores.map(s => s.brand).filter(Boolean))).length > 8 && (
                  <span className="text-gray-500 text-xs">+{Array.from(new Set(stores.map(s => s.brand).filter(Boolean))).length - 8} autres</span>
                )}
              </div>
            )}
            <div className="text-gray-500">
              Click markers for details
            </div>
          </div>
          <div className="text-gray-500">
            Powered by OpenStreetMap
          </div>
        </div>
      </div>
    </div>
  );
};