import React from 'react';
import { Globe, Package, Brain, MessageSquare, ArrowRight } from 'lucide-react';
import { WiserLogo } from './WiserLogo';
import { getTranslation } from '../utils/translations';
import { Language } from '../types';

interface HomePageProps {
  onNavigate: (view: 'chat' | 'domain-checker' | 'store-collector' | 'product-knowledge') => void;
  language: Language;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, language }) => {
  const features = [
    {
      id: 'domain-checker',
      title: 'Domain Checker',
      description: 'Analysez les domaines et vérifiez leur compatibilité avec nos systèmes',
      icon: Globe,
      color: 'blue',
      available: true
    },
    {
      id: 'store-collector',
      title: 'Store List Collector',
      description: 'Collectez des listes de magasins par saisie manuelle, scraping web ou recherche par marque',
      icon: Package,
      color: 'green',
      available: true
    },
    {
      id: 'product-knowledge',
      title: 'Product Knowledge',
      description: 'Posez des questions sur les produits Wiser grâce à notre base de connaissances',
      icon: Brain,
      color: 'purple',
      available: false // Sera disponible bientôt
    },
    {
      id: 'chat',
      title: 'AI Assistant',
      description: 'Votre assistant IA spécialisé pour toutes vos questions commerciales',
      icon: MessageSquare,
      color: 'orange',
      available: true
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: {
        bg: 'from-blue-500 to-blue-600',
        hover: 'hover:from-blue-600 hover:to-blue-700',
        icon: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200'
      },
      green: {
        bg: 'from-green-500 to-green-600',
        hover: 'hover:from-green-600 hover:to-green-700',
        icon: 'bg-green-100 text-green-600',
        border: 'border-green-200'
      },
      purple: {
        bg: 'from-purple-500 to-purple-600',
        hover: 'hover:from-purple-600 hover:to-purple-700',
        icon: 'bg-purple-100 text-purple-600',
        border: 'border-purple-200'
      },
      orange: {
        bg: 'from-orange-500 to-orange-600',
        hover: 'hover:from-orange-600 hover:to-orange-700',
        icon: 'bg-orange-100 text-orange-600',
        border: 'border-orange-200'
      }
    };
    return colors[color as keyof typeof colors];
  };

  const handleFeatureClick = (featureId: string, available: boolean) => {
    if (!available) {
      const message = language === 'fr' ? 'Cette fonctionnalité sera bientôt disponible !' : 
                     language === 'es' ? '¡Esta funcionalidad estará disponible pronto!' :
                     'This feature will be available soon!';
      alert(message);
      return;
    }
    onNavigate(featureId as 'chat' | 'domain-checker' | 'store-collector' | 'product-knowledge');
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="flex justify-center">
            <div className="p-6 rounded-2xl bg-white shadow-lg">
              <WiserLogo variant="icon" className="h-20 w-20" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            {getTranslation(language, 'welcomeToWiser')}
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {getTranslation(language, 'specializedRetailAI')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature) => {
            const colors = getColorClasses(feature.color);
            return (
              <button
                key={feature.id}
                onClick={() => handleFeatureClick(feature.id, feature.available)}
                disabled={!feature.available}
                className={`group relative p-8 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                  feature.available
                    ? `${colors.border} bg-white hover:bg-gray-50 cursor-pointer`
                    : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Coming Soon Badge */}
                {!feature.available && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                    {language === 'fr' ? 'Bientôt disponible' : 
                     language === 'es' ? 'Próximamente disponible' :
                     'Coming soon'}
                  </div>
                )}

                <div className="flex items-start gap-6">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-4 rounded-xl transition-colors ${
                    feature.available ? colors.icon : 'bg-gray-200 text-gray-400'
                  }`}>
                    <feature.icon size={32} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-xl font-bold mb-3 ${
                      feature.available ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`text-base leading-relaxed mb-4 ${
                      feature.available ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {feature.description}
                    </p>
                    
                    {feature.available && (
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors">
                        <span>Accéder à l'outil</span>
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Effect */}
                {feature.available && (
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.bg} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-16 bg-white rounded-2xl border border-gray-200 p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Plateforme en un coup d'œil
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">4</div>
              <div className="text-gray-600">Outils disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
              <div className="text-gray-600">Analyses possibles</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Disponibilité</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">AI</div>
              <div className="text-gray-600">Intelligence artificielle</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};