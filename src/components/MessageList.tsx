import React, { useEffect, useRef } from 'react';
import { Message } from './Message';
import { SuggestedPrompts } from './SuggestedPrompts';
import { WiserLogo } from './WiserLogo';
import { Message as MessageType, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MessageListProps {
  messages: MessageType[];
  theme: 'light' | 'dark';
  language: Language;
  onSelectPrompt?: (prompt: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  theme, 
  language,
  onSelectPrompt 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={`flex-1 overflow-y-auto ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}>
        <div className="min-h-full flex flex-col items-center justify-center p-8">
          <div className="text-center space-y-6 max-w-2xl mx-auto mb-12">
            <div className="mb-6 flex justify-center">
              <div className={`p-6 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'
              }`}>
                <WiserLogo variant="icon" className="h-16 w-16" />
              </div>
            </div>
            <h2 className={`text-3xl font-bold ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
            }`}>
              {getTranslation(language, 'welcomeToWiser')}
            </h2>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {getTranslation(language, 'specializedRetailAI')}
            </p>
          </div>

          {/* Suggested Prompts */}
          {onSelectPrompt && (
            <SuggestedPrompts 
              onSelectPrompt={onSelectPrompt} 
              theme={theme}
              language={language}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto scroll-smooth ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-white'
    }`}>
      <div className="w-full">
        {messages.map((message) => (
          <Message 
            key={message.id} 
            message={message} 
            theme={theme} 
            language={language}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};