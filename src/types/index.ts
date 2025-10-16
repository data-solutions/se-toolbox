export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  files?: UploadedFile[];
  isLoading?: boolean;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

interface DomainCheckResult {
  domain: string;
  status: 'pending' | 'checking' | 'completed' | 'error';
  taskId?: string;
  checks: {
    [key: string]: {
      status: 'pending' | 'completed' | 'error';
      [key: string]: any;
    };
  };
  error?: string;
  startTime?: Date;
  endTime?: Date;
  id?: string;
  fromCache?: boolean;
  lastChecked?: Date;
}

export interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  theme: 'light' | 'dark';
  language: 'en' | 'fr' | 'es';
}

interface SuggestedPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  icon: string;
  category: 'analysis' | 'strategy' | 'prospecting' | 'reporting';
}

export type Language = 'en' | 'fr' | 'es';

interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
}