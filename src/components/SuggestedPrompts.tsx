import React from 'react';
import { Search, Package, Globe, Map } from 'lucide-react';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  theme: 'light' | 'dark';
  language: Language;
}

const iconMap = {
  Search,
  Package,
  Globe,
  Map,
};

interface SuggestedPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  category: 'analysis' | 'strategy' | 'prospecting' | 'reporting';
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({ 
  onSelectPrompt, 
  theme,
  language
}) => {
  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent ? <IconComponent size={24} /> : <Search size={24} />;
  };

  const prompts: SuggestedPrompt[] = [
    {
      id: '1',
      title: getTranslation(language, 'analyzeDomainsCrawling'),
      description: getTranslation(language, 'analyzeDomainsCrawlingDesc'),
      prompt: getTranslation(language, 'analyzeDomainsCrawlingPrompt'),
      icon: 'Globe',
      category: 'analysis'
    },
    {
      id: '2',
      title: getTranslation(language, 'analyzeTender'),
      description: getTranslation(language, 'analyzeTenderDesc'),
      prompt: getTranslation(language, 'analyzeTenderPrompt'),
      icon: 'Search',
      category: 'analysis'
    },
    {
      id: '3',
      title: getTranslation(language, 'productQuestion'),
      description: getTranslation(language, 'productQuestionDesc'),
      prompt: getTranslation(language, 'productQuestionPrompt'),
      icon: 'Package',
      category: 'strategy'
    },
    {
      id: '4',
      title: getTranslation(language, 'riCoverage'),
      description: getTranslation(language, 'riCoverageDesc'),
      prompt: getTranslation(language, 'riCoveragePrompt'),
      icon: 'Map',
      category: 'reporting'
    }
  ];

  const handlePromptClick = (prompt: SuggestedPrompt) => {
    console.log('🎯 Suggestion cliquée:', prompt.title);
    onSelectPrompt(prompt.prompt);
  };

  console.log('🔍 Rendu SuggestedPrompts:', { 
    promptsCount: prompts.length, 
    language, 
    theme 
  });

  return (
    <div className="space-y-6">
      <h3 className={`text-lg font-semibold text-center ${
        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
      }`}>
        {getTranslation(language, 'suggestionsStart')}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {prompts.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => handlePromptClick(prompt)}
            className={`p-5 rounded-xl border-2 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg group ${
              theme === 'dark'
                ? 'bg-gray-800 border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-blue-400 group-hover:bg-gray-600' 
                  : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
              }`}>
                {getIcon(prompt.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`font-semibold text-base mb-2 ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                }`}>
                  {prompt.title}
                </h4>
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {prompt.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};