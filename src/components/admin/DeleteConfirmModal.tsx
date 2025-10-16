import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { AdminUserView } from '../../lib/supabase';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

interface DeleteConfirmModalProps {
  user: AdminUserView;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  user,
  onConfirm,
  onCancel,
  loading
}) => {
  const [language] = useState<Language>('en'); // Default to English

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {getTranslation(language, 'confirmDeletion')}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-700 mb-4">
              {getTranslation(language, 'deleteUserConfirmation')}
            </p>
            
            <div className="bg-gray-50 rounded-xl p-4 border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.full_name || user.username}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                  <div className="text-xs text-blue-600">{user.role_name}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">
                  {getTranslation(language, 'warning')}
                </h4>
                <p className="text-sm text-red-700">
                  {getTranslation(language, 'deleteUserWarning')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  {getTranslation(language, 'deleteDefinitively')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};