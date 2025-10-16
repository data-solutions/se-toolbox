import React from 'react';
import { User, Bot, FileText, Loader2, Copy, Check } from 'lucide-react';
import { Message as MessageType, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MessageProps {
  message: MessageType;
  theme: 'light' | 'dark';
  language: Language;
}

export const Message: React.FC<MessageProps> = ({ message, theme, language }) => {
  const [copied, setCopied] = React.useState(false);
  const isUser = message.role === 'user';
  
  const handleCopy = async () => {
    if (message.content) {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`w-full px-4 py-6 ${
      isUser 
        ? theme === 'dark' ? 'bg-gray-800/30' : 'bg-blue-50/30'
        : theme === 'dark' ? 'bg-gray-900/50' : 'bg-white'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg' 
              : theme === 'dark' 
                ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg' 
                : 'bg-gradient-to-br from-green-100 to-green-200 text-green-700 shadow-md'
          }`}>
            {isUser ? <User size={18} /> : <Bot size={18} />}
          </div>

          {/* Contenu */}
          <div className={`flex-1 max-w-3xl ${isUser ? 'text-right' : 'text-left'}`}>
            {/* En-tête avec nom et heure */}
            <div className={`flex items-center gap-3 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              <span className={`font-semibold text-sm ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
              }`}>
                {isUser ? getTranslation(language, 'you') : getTranslation(language, 'assistant')}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'es-ES', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
              
              {/* Bouton copier pour l'assistant */}
              {!isUser && !message.isLoading && message.content && (
                <button
                  onClick={handleCopy}
                  title={getTranslation(language, 'copyResponse')}
                  className={`p-1 rounded transition-colors ${
                    theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {copied ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
                  )}
                </button>
              )}
            </div>

            {/* Fichiers attachés */}
            {message.files && message.files.length > 0 && (
              <div className={`flex flex-wrap gap-2 mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
                {message.files.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-gray-200' 
                        : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <FileText size={14} className="text-blue-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs opacity-60">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Bulle de message */}
            <div className={`inline-block max-w-full ${isUser ? 'ml-auto' : 'mr-auto'}`}>
              <div className={`rounded-2xl px-4 py-3 ${
                isUser
                  ? theme === 'dark'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-200 border border-gray-600'
                    : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
              } ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}`}>
                {message.isLoading ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="flex space-x-1">
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '0ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '150ms' }} />
                      <div className={`w-2 h-2 rounded-full animate-bounce ${
                        theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500'
                      }`} style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm opacity-80">
                      {getTranslation(language, 'thinking')}
                    </span>
                  </div>
                ) : (
                  <div className={`whitespace-pre-wrap leading-relaxed ${isUser ? 'text-left' : 'text-left'}`}>
                    {message.content || (isUser ? 'Message vide' : 'Réponse vide')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};