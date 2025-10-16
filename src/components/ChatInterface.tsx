import React, { useState, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Sidebar } from './Sidebar';
import { Message, Conversation, ChatState, UploadedFile, Language } from '../types';
import { sendMessageToN8N, generateConversationTitle, testN8NConnection } from '../utils/api';
import { getTranslation } from '../utils/translations';

interface ChatInterfaceProps {
  language: Language;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ language }) => {
  const [chatState, setChatState] = useState<ChatState>({
    conversations: [],
    currentConversationId: null,
    isLoading: false,
    theme: 'light',
    language: language,
  });

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('chatState');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        // Convert date strings back to Date objects
        const conversations = parsed.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));
        setChatState({ 
          ...parsed, 
          conversations,
          language: language
        });
      } catch (error) {
        console.error('Error loading saved state:', error);
      }
    }
  }, []);

  // Update language when prop changes
  React.useEffect(() => {
    setChatState(prev => ({ ...prev, language }));
  }, [language]);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('chatState', JSON.stringify(chatState));
  }, [chatState]);

  const createNewConversation = (): string => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: getTranslation(chatState.language, 'newConversation'),
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      conversations: [newConversation, ...prev.conversations],
      currentConversationId: newConversation.id,
    }));

    return newConversation.id;
  };

  const getCurrentConversation = (conversationId?: string): Conversation | undefined => {
    const targetId = conversationId || chatState.currentConversationId;
    return chatState.conversations.find(conv => conv.id === targetId);
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setChatState(prev => ({
      ...prev,
      conversations: prev.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, ...updates, updatedAt: new Date() }
          : conv
      ),
    }));
  };

  const handleSendMessage = async (content: string, files: File[]) => {
    console.log('🚀 === DÉBUT ENVOI MESSAGE ===');
    console.log('📝 Message:', content);
    console.log('📎 Fichiers:', files.length);
    
    let conversationId = chatState.currentConversationId;
    
    // Create new conversation if none exists
    if (!conversationId) {
      conversationId = createNewConversation();
    }

    // Create user message
    const uploadedFiles: UploadedFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      files: uploadedFiles,
    };

    // Create loading assistant message
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingMessageId,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };

    // Add both messages at once to avoid state conflicts
    setChatState(prev => {
      const conversations = prev.conversations.map(conv => {
        if (conv.id === conversationId) {
          const newMessages = [...conv.messages, userMessage, loadingMessage];
          return {
            ...conv,
            messages: newMessages,
            title: conv.messages.length === 0 
              ? generateConversationTitle(content)
              : conv.title,
            updatedAt: new Date(),
          };
        }
        return conv;
      });
      
      return {
        ...prev,
        conversations,
        isLoading: true,
      };
    });

    console.log('✅ Messages utilisateur et loading ajoutés');

    try {
      console.log('📡 Appel webhook N8N...');
      
      // Send to N8N
      const response = await sendMessageToN8N({
        chatInput: content,
        files,
        conversationId,
        timestamp: new Date().toISOString(),
        language: chatState.language,
        user: 'Gael', // Valeur par défaut, sera remplacée par un système d'utilisateurs plus tard
      });

      console.log('✅ Réponse reçue:', response);

      // Validate response
      if (!response || response.trim() === '') {
        throw new Error('Réponse vide du webhook');
      }

      // Update loading message with actual response
      setChatState(prev => {
        const conversations = prev.conversations.map(conv => {
          if (conv.id === conversationId) {
            const updatedMessages = conv.messages.map(msg => {
              if (msg.id === loadingMessageId) {
                return { ...msg, content: response, isLoading: false };
              }
              return msg;
            });
            return {
              ...conv,
              messages: updatedMessages,
              updatedAt: new Date(),
            };
          }
          return conv;
        });
        
        return {
          ...prev,
          conversations,
          isLoading: false,
        }
      });

      console.log('✅ Message assistant mis à jour');

    } catch (error) {
      console.error('❌ Erreur webhook:', error);
      
      // Handle error
      const errorMessage = error instanceof Error 
        ? `Erreur: ${error.message}` 
        : 'Une erreur inconnue est survenue';
      
      // Update loading message with error
      setChatState(prev => {
        const conversations = prev.conversations.map(conv => {
          if (conv.id === conversationId) {
            const updatedMessages = conv.messages.map(msg => {
              if (msg.id === loadingMessageId) {
                return { 
                  ...msg, 
                  content: `❌ ${errorMessage}`, 
                  isLoading: false 
                };
              }
              return msg;
            });
            return {
              ...conv,
              messages: updatedMessages,
              updatedAt: new Date(),
            };
          }
          return conv;
        });
        
        return {
          ...prev,
          conversations,
          isLoading: false,
        };
        });
    }
    
    console.log('🏁 Fin traitement message');
  };

  const handleSelectPrompt = (prompt: string) => {
    handleSendMessage(prompt, []);
  };

  const handleSelectConversation = (id: string) => {
    setChatState(prev => ({
      ...prev,
      currentConversationId: id,
    }));
  };

  const handleNewConversation = () => {
    createNewConversation();
  };

  const handleToggleTheme = () => {
    setChatState(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  const handleLanguageChange = (language: Language) => {
    // Language is now managed by parent component
  };

  const currentConversation = getCurrentConversation();

  return (
    <div className={`h-full flex ${
      chatState.theme === 'dark' ? 'dark bg-gray-900' : 'bg-white'
    }`}>
      {/* Sidebar */}
      <Sidebar
        conversations={chatState.conversations}
        currentConversationId={chatState.currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        theme={chatState.theme}
        onToggleTheme={handleToggleTheme}
        language={language}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <MessageList
          messages={currentConversation?.messages || []}
          theme={chatState.theme}
          language={language}
          onSelectPrompt={handleSelectPrompt}
        />
        <MessageInput
          onSendMessage={handleSendMessage}
          isLoading={chatState.isLoading}
          theme={chatState.theme}
          language={language}
        />
      </div>
    </div>
  );
};