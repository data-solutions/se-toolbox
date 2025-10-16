import React, { useRef } from 'react';
import { Upload, X, FileText } from 'lucide-react';
import { UploadedFile, Language } from '../types';
import { getTranslation } from '../utils/translations';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  theme: 'light' | 'dark';
  language: Language;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  files, 
  onFilesChange, 
  theme,
  language
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(file => 
      file.type.includes('excel') || 
      file.type.includes('csv') || 
      file.name.endsWith('.xlsx') || 
      file.name.endsWith('.xls') || 
      file.name.endsWith('.csv')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      alert(getTranslation(language, 'onlyExcelCsv'));
    }
    
    onFilesChange([...files, ...validFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="space-y-2">
      {/* Upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border-2 border-dashed transition-colors ${
          theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500 text-gray-400 hover:text-gray-300'
            : 'border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-700'
        }`}
      >
        <Upload size={16} />
        <span>{getTranslation(language, 'addExcelCsv')}</span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, index) => (
            <div
              key={index}
              className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2 flex-1">
                <FileText size={14} className="text-blue-500" />
                <span className={`text-sm truncate ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {file.name}
                </span>
                <span className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className={`p-1 rounded hover:bg-opacity-80 transition-colors ${
                  theme === 'dark' ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                }`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};