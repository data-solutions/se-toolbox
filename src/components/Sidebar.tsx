import React from 'react';
import { Plus, MessageSquare, Settings, Moon, Sun } from 'lucide-react';
import { Conversation, Language } from '../types';
import { LanguageSelector } from './LanguageSelector';
import { getTranslation } from '../utils/translations';
import { WiserLogo } from './WiserLogo';

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  language: Language;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  theme,
  onToggleTheme,
  language,
}) => {
  return (
    <div className={`w-64 h-full flex flex-col ${
      theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
    } border-r border-gray-200 dark:border-gray-700`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Wiser Logo */}
        <div className="flex items-center gap-3 mb-4">
          <WiserLogo variant="icon" className="h-8 w-8" />
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">The SE toolbox</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Sales Engineer Tools</p>
          </div>
        </div>
        
        <button
          onClick={onNewConversation}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
            theme === 'dark' 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
          }`}
        >
          <Plus size={18} />
          <span className="font-semibold">
            {getTranslation(language, 'newConversation')}
          </span>
        </button>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation.id)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl mb-2 text-left transition-colors ${
              currentConversationId === conversation.id
                ? theme === 'dark'
                  ? 'bg-gray-700 text-white'
                  : 'bg-blue-50 text-blue-900 border border-blue-200'
                : theme === 'dark'
                  ? 'hover:bg-gray-700 text-gray-300'
                  : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <MessageSquare size={16} className="flex-shrink-0" />
            <span className="truncate text-sm">{conversation.title}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Theme and Settings */}
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            }`}
            title={getTranslation(language, 'switchTheme', { 
              theme: theme === 'dark' ? 'light' : 'dark' 
            })}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className={`p-2 rounded-lg transition-colors ${
              theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-200'
            }`}
            title={getTranslation(language, 'settings')}
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};