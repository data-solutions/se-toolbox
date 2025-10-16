import React, { useState } from 'react';
import { Settings, LogOut, User, Shield, Bell, Search, Menu, X, Home, ChevronDown, BarChart3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { HomePage } from '../HomePage';
import { ChatInterface } from '../ChatInterface';
import { AdminDashboard } from '../admin/AdminDashboard';
import { DomainChecker } from '../domain-checker/DomainChecker';
import { TeamPerformanceDashboard } from '../performance/TeamPerformanceDashboard';
import { StoreCollector } from '../store-collector/StoreCollector';
import { WiserLogo } from '../WiserLogo';
import { LanguageSelector } from '../LanguageSelector';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

export const AppLayout: React.FC = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const [currentView, setCurrentView] = useState<'home' | 'chat' | 'admin' | 'domain-checker' | 'team-performance' | 'store-collector' | 'product-knowledge'>('home');
  const [userLanguage, setUserLanguage] = useState<Language>('en'); // Default to English
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load user language preference from localStorage
  React.useEffect(() => {
    const savedLanguage = localStorage.getItem('user_language') as Language;
    if (savedLanguage && ['en', 'fr', 'es'].includes(savedLanguage)) {
      setUserLanguage(savedLanguage);
    }
  }, []);

  // Save language preference
  const handleLanguageChange = (newLanguage: Language) => {
    setUserLanguage(newLanguage);
    localStorage.setItem('user_language', newLanguage);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const handleNavigate = (view: 'chat' | 'domain-checker' | 'store-collector' | 'product-knowledge') => {
    setCurrentView(view);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <WiserLogo variant="icon" className="h-8 w-8" />
                <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
                  The SE toolbox
                </h1>
              </div>
              
              {/* Home Button */}
              <button
                onClick={() => setCurrentView('home')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentView === 'home'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Search - Desktop */}
              <div className="hidden lg:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={getTranslation(userLanguage, 'search')}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-64"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                title={getTranslation(userLanguage, 'notifications')}
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Tools Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowToolsMenu(!showToolsMenu)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${showToolsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showToolsMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <button 
                      onClick={() => {
                        setCurrentView('team-performance');
                        setShowToolsMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Team Performance
                    </button>
                    
                    {isAdmin && (
                      <button 
                        onClick={() => {
                          setCurrentView('admin');
                          setShowToolsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Shield className="h-4 w-4" />
                        {getTranslation(userLanguage, 'administration')}
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {profile?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {profile?.full_name || profile?.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile?.role?.name}
                    </div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">{profile?.full_name || profile?.username}</div>
                      <div className="text-sm text-gray-500">{user?.email}</div>
                      <div className="text-xs text-blue-600 mt-1">{profile?.role?.name}</div>
                    </div>
                    
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                      <User className="h-4 w-4" />
                      {getTranslation(userLanguage, 'myProfile')}
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowSettings(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      {getTranslation(userLanguage, 'settings')}
                    </button>
                    
                    <div className="border-t border-gray-100 mt-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        {getTranslation(userLanguage, 'logout')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'home' ? (
          <HomePage onNavigate={handleNavigate} language={userLanguage} />
        ) : currentView === 'chat' ? (
          <ChatInterface language={userLanguage} />
        ) : currentView === 'domain-checker' ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <DomainChecker language={userLanguage} />
            </div>
          </div>
        ) : currentView === 'store-collector' ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <StoreCollector language={userLanguage} />
            </div>
          </div>
        ) : currentView === 'product-knowledge' ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Knowledge</h2>
                <p className="text-gray-600">Cette fonctionnalité sera bientôt disponible !</p>
              </div>
            </div>
          </div>
        ) : currentView === 'team-performance' ? (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <TeamPerformanceDashboard language={userLanguage} />
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <AdminDashboard language={userLanguage} />
            </div>
          </div>
        )}
      </main>

      {/* Click outside to close menus */}
      {(showUserMenu || showToolsMenu || showSettings) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowToolsMenu(false);
            setShowSettings(false);
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">{getTranslation(userLanguage, 'settings')}</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Language / Langue / Idioma
                </label>
                <LanguageSelector
                  currentLanguage={userLanguage}
                  onLanguageChange={handleLanguageChange}
                  theme="light"
                />
              </div>
            </div>
            
            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setShowSettings(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                {getTranslation(userLanguage, 'close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};