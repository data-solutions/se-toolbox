import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRange } from '../../hooks/useTeamPerformance';
import { Language } from '../../types';

interface DateRangeSelectorProps {
  selectedRange: DateRange | null;
  onRangeChange: (range: DateRange | null) => void;
  language: Language;
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  selectedRange,
  onRangeChange,
  language
}) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const predefinedRanges = [
    {
      label: 'Mois en cours',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Mois dernier',
      getValue: () => {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    },
    {
      label: 'Q1 2024',
      getValue: () => ({
        start: '2024-01-01',
        end: '2024-03-31'
      })
    },
    {
      label: 'Q2 2024',
      getValue: () => ({
        start: '2024-04-01',
        end: '2024-06-30'
      })
    },
    {
      label: 'Q3 2024',
      getValue: () => ({
        start: '2024-07-01',
        end: '2024-09-30'
      })
    },
    {
      label: 'Q4 2024',
      getValue: () => ({
        start: '2024-10-01',
        end: '2024-12-31'
      })
    },
    {
      label: '2024',
      getValue: () => ({
        start: '2024-01-01',
        end: '2024-12-31'
      })
    },
    {
      label: language === 'en' ? 'Last 6 months' : language === 'fr' ? '6 derniers mois' : 'Últimos 6 meses',
      getValue: () => {
        const end = new Date();
        const start = new Date();
        start.setMonth(start.getMonth() - 6);
        return {
          start: start.toISOString().split('T')[0],
          end: end.toISOString().split('T')[0]
        };
      }
    }
  ];

  const handlePredefinedRange = (range: typeof predefinedRanges[0]) => {
    const dateRange = range.getValue();
    onRangeChange(dateRange);
    setShowCustom(false);
  };

  const handleCustomRange = () => {
    if (customStart && customEnd) {
      onRangeChange({
        start: customStart,
        end: customEnd
      });
      setShowCustom(false);
    }
  };

  const clearRange = () => {
    onRangeChange(null);
    setCustomStart('');
    setCustomEnd('');
    setShowCustom(false);
  };

  const formatDateRange = (range: DateRange) => {
    const start = new Date(range.start).toLocaleDateString('fr-FR');
    const end = new Date(range.end).toLocaleDateString('fr-FR');
    return `${start} - ${end}`;
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setShowCustom(!showCustom)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">
              {selectedRange ? formatDateRange(selectedRange) : 
               language === 'en' ? 'Select a period' : 
               language === 'fr' ? 'Sélectionner une période' : 
               'Seleccionar un período'}
            </span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
          </button>

          {showCustom && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {language === 'en' ? 'Select a period' : 
                   language === 'fr' ? 'Sélectionner une période' : 
                   'Seleccionar un período'}
                </h3>
                
                {/* Périodes prédéfinies */}
                <div className="space-y-2 mb-4">
                  {predefinedRanges.map((range, index) => (
                    <button
                      key={index}
                      onClick={() => handlePredefinedRange(range)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Période personnalisée */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {language === 'en' ? 'Custom period' : 
                     language === 'fr' ? 'Période personnalisée' : 
                     'Período personalizado'}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {language === 'en' ? 'Start date' : 
                         language === 'fr' ? 'Date de début' : 
                         'Fecha de inicio'}
                      </label>
                      <input
                        type="date"
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {language === 'en' ? 'End date' : 
                         language === 'fr' ? 'Date de fin' : 
                         'Fecha de fin'}
                      </label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomRange}
                      disabled={!customStart || !customEnd}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      {language === 'en' ? 'Apply' : 
                       language === 'fr' ? 'Appliquer' : 
                       'Aplicar'}
                    </button>
                    <button
                      onClick={clearRange}
                      className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    >
                      {language === 'en' ? 'Clear' : 
                       language === 'fr' ? 'Effacer' : 
                       'Limpiar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};