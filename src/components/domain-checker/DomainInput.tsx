import React, { useState } from 'react';
import { Plus, Upload, FileText, Search, Globe, Database } from 'lucide-react';
import { Language } from '../../types';
import { getTranslation } from '../../utils/translations';

interface DomainInputProps {
  onStartCheck: (domains: string[], apNumber?: string) => void;
  isChecking: boolean;
  language: Language;
  hasSelectedTests?: boolean;
}

export const DomainInput: React.FC<DomainInputProps> = ({ 
  onStartCheck, 
  isChecking, 
  language, 
  hasSelectedTests = true 
}) => {
  const [inputMethod, setInputMethod] = useState<'manual' | 'salesforce'>('manual');
  const [domainText, setDomainText] = useState('');
  const [salesforceAP, setSalesforceAP] = useState('');
  const [domains, setDomains] = useState<string[]>([]);

  const handleAddDomain = () => {
    if (domainText.trim()) {
      const newDomains = domainText
        .split('\n')
        .map(d => d.trim())
        .filter(d => d.length > 0)
        .filter(d => !domains.includes(d));
      
      setDomains([...domains, ...newDomains]);
      setDomainText('');
    }
  };

  const handleRemoveDomain = (index: number) => {
    setDomains(domains.filter((_, i) => i !== index));
  };

  const handleStartCheck = () => {
    if (inputMethod === 'manual' && domains.length > 0) {
      onStartCheck(domains);
    } else if (inputMethod === 'salesforce' && salesforceAP.trim()) {
      onStartCheck([], salesforceAP.trim());
    }
  };

  const isValid = (inputMethod === 'manual' && domains.length > 0) || 
                  (inputMethod === 'salesforce' && salesforceAP.trim());

  const canStart = isValid && hasSelectedTests && !isChecking;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
      {/* Input Method Selection */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{getTranslation(language, 'inputMethod')}</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setInputMethod('manual')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
              inputMethod === 'manual'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Globe className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">{getTranslation(language, 'manualInput')}</div>
              <div className="text-sm opacity-75">{getTranslation(language, 'domainList')}</div>
            </div>
          </button>
          
          <button
            onClick={() => setInputMethod('salesforce')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-colors ${
              inputMethod === 'salesforce'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Database className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium">{getTranslation(language, 'salesforceAP')}</div>
              <div className="text-sm opacity-75">{getTranslation(language, 'apNumber')}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Manual Input */}
      {inputMethod === 'manual' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation(language, 'addDomains')}
            </label>
            <div className="flex gap-3">
              <textarea
                value={domainText}
                onChange={(e) => setDomainText(e.target.value)}
                placeholder="Saisissez les domaines (un par ligne)&#10;exemple.com&#10;autresite.fr&#10;boutique.net"
                placeholder={getTranslation(language, 'domainsPlaceholder')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
              />
              <button
                onClick={handleAddDomain}
                disabled={!domainText.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Domain List */}
          {domains.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation(language, 'domainsToCheck')} ({domains.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {domains.map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900">{domain}</span>
                    <button
                      onClick={() => handleRemoveDomain(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
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

      {/* Salesforce AP Input */}
      {inputMethod === 'salesforce' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {getTranslation(language, 'salesforceAPNumber')}
          </label>
          <input
            type="text"
            value={salesforceAP}
            onChange={(e) => setSalesforceAP(e.target.value)}
            placeholder={getTranslation(language, 'salesforceAPPlaceholder')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-sm text-gray-500 mt-2">
            {getTranslation(language, 'salesforceAPDesc')}
          </p>
        </div>
      )}

      {/* Start Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStartCheck}
          disabled={!canStart}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
            canStart
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              {getTranslation(language, 'verificationInProgress')}
            </>
          ) : (
            <>
              <Search className="h-5 w-5" />
              {getTranslation(language, 'startVerification')}
            </>
          )}
        </button>
      </div>
      
      {!hasSelectedTests && (
        <div className="mt-3 text-sm text-red-600 text-right">
          {getTranslation(language, 'pleaseSelectAtLeastOneTest')}
        </div>
      )}
    </div>
  );
};