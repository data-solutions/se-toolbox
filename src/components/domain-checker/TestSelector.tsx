import React from 'react';
import { Shield, Database, Users, Barcode, Zap, ShoppingCart, Building2 } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../utils/translations';

export interface TestConfig {
  botBlockers: boolean;
  crawlStatus: boolean;
  clientUsage: boolean;
  domainProfile: boolean;
  ecommercePlatform: boolean;
  productIdentifiers: boolean;
  eanResponsive: boolean;
}

interface TestSelectorProps {
  selectedTests: TestConfig;
  onTestToggle: (testKey: keyof TestConfig) => void;
  language: Language;
}

export const TestSelector: React.FC<TestSelectorProps> = ({ 
  selectedTests, 
  onTestToggle, 
  language 
}) => {
  const tests = [
    { 
      key: 'botBlockers' as keyof TestConfig, 
      label: getTranslation(language, 'botBlockers'), 
      icon: Shield,
      color: 'red'
    },
    { 
      key: 'crawlStatus' as keyof TestConfig, 
      label: getTranslation(language, 'crawlStatus'), 
      icon: Database,
      color: 'blue'
    },
    { 
      key: 'clientUsage' as keyof TestConfig, 
      label: getTranslation(language, 'clientUsage'), 
      icon: Users,
      color: 'green'
    },
    { 
      key: 'domainProfile' as keyof TestConfig, 
      label: getTranslation(language, 'domainProfile'), 
      icon: Building2,
      color: 'indigo'
    },
    { 
      key: 'ecommercePlatform' as keyof TestConfig, 
      label: getTranslation(language, 'ecommercePlatform'), 
      icon: ShoppingCart,
      color: 'purple'
    },
    { 
      key: 'productIdentifiers' as keyof TestConfig, 
      label: getTranslation(language, 'productIdentifiers'), 
      icon: Barcode,
      color: 'pink'
    },
    { 
      key: 'eanResponsive' as keyof TestConfig, 
      label: getTranslation(language, 'eanResponsive'), 
      icon: Zap,
      color: 'yellow'
    },
  ];

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors = {
      red: isSelected 
        ? 'bg-red-100 border-red-500 text-red-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-red-300',
      blue: isSelected 
        ? 'bg-blue-100 border-blue-500 text-blue-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-blue-300',
      green: isSelected 
        ? 'bg-green-100 border-green-500 text-green-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-green-300',
      indigo: isSelected 
        ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-indigo-300',
      purple: isSelected 
        ? 'bg-purple-100 border-purple-500 text-purple-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-purple-300',
      pink: isSelected 
        ? 'bg-pink-100 border-pink-500 text-pink-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-pink-300',
      yellow: isSelected 
        ? 'bg-yellow-100 border-yellow-500 text-yellow-700' 
        : 'bg-gray-50 border-gray-300 text-gray-500 hover:border-yellow-300',
    };
    return colors[color as keyof typeof colors];
  };

  const selectedCount = Object.values(selectedTests).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tests à exécuter
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedCount} test{selectedCount !== 1 ? 's' : ''} sélectionné{selectedCount !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => {
              const allSelected = selectedCount === tests.length;
              tests.forEach(test => {
                if (allSelected && selectedTests[test.key]) {
                  onTestToggle(test.key);
                } else if (!allSelected && !selectedTests[test.key]) {
                  onTestToggle(test.key);
                }
              });
            }}
            className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {selectedCount === tests.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {tests.map((test) => {
          const isSelected = selectedTests[test.key];
          return (
            <button
              key={test.key}
              onClick={() => onTestToggle(test.key)}
              className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all duration-200 ${
                getColorClasses(test.color, isSelected)
              } ${isSelected ? 'shadow-sm' : 'hover:shadow-sm'}`}
            >
              <div className={`p-2 rounded-lg ${
                isSelected 
                  ? 'bg-white shadow-sm' 
                  : 'bg-gray-100'
              }`}>
                <test.icon className="h-4 w-4" />
              </div>
              <div className="text-left flex-1">
                <div className="font-medium text-sm">{test.label}</div>
                <div className={`text-xs mt-1 ${
                  isSelected ? 'opacity-75' : 'opacity-60'
                }`}>
                  {isSelected ? 'Activé' : 'Désactivé'}
                </div>
              </div>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                isSelected 
                  ? 'border-current bg-current' 
                  : 'border-gray-300'
              }`}>
                {isSelected && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedCount === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getTranslation(language, 'noTestSelected')}
            </span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            {getTranslation(language, 'selectAtLeastOneTest')}
          </p>
        </div>
      )}
    </div>
  );
};