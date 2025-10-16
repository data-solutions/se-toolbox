import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { FileUpload } from './FileUpload';
import { Language } from '../types';
import { getTranslation } from '../utils/translations';

interface MessageInputProps {
  onSendMessage: (message: string, files: File[]) => void;
  isLoading: boolean;
  theme: 'light' | 'dark';
  language: Language;
}

export const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading, 
  theme,
  language
}) => {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;
    
    onSendMessage(message.trim(), files);
    setMessage('');
    setFiles([]);
    setShowFileUpload(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  return (
    <div className={`border-t ${
      theme === 'dark' ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
    }`}>
      <div className="max-w-4xl mx-auto p-4">
        {/* File Upload */}
        {showFileUpload && (
          <div className="mb-4">
            <FileUpload 
              files={files} 
              onFilesChange={setFiles} 
              theme={theme}
              language={language}
            />
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <button
            type="button"
            onClick={() => setShowFileUpload(!showFileUpload)}
            className={`p-3 rounded-lg transition-colors ${
              showFileUpload
                ? theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                : theme === 'dark' ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={getTranslation(language, 'addFiles')}
          >
            <Paperclip size={20} />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getTranslation(language, 'askQuestion')}
              rows={1}
              disabled={isLoading}
              className={`w-full px-4 py-3 rounded-xl border-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                theme === 'dark'
                  ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
              }`}
              style={{ minHeight: '52px', maxHeight: '200px' }}
            />
            
            {/* Character count */}
            <div className={`absolute bottom-2 right-12 text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
            }`}>
              {message.length}/2000
            </div>
          </div>

          <button
            type="submit"
            disabled={(!message.trim() && files.length === 0) || isLoading}
            className={`p-3 rounded-xl transition-all ${
              (!message.trim() && files.length === 0) || isLoading
                ? theme === 'dark' ? 'bg-gray-700 text-gray-500' : 'bg-gray-200 text-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            <Send size={20} />
          </button>
        </form>

        {/* Tips */}
        <div className={`mt-2 text-xs text-center ${
          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {getTranslation(language, 'sendInstructions')}
        </div>
      </div>
    </div>
  );
};