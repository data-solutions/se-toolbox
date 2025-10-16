import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, Save, AlertCircle, Lock } from 'lucide-react';
import { AdminUserView, UserRole } from '../../lib/supabase';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

interface UserModalProps {
  user: AdminUserView | null;
  roles: UserRole[];
  onClose: () => void;
  onSave: (userIdOrData: string | any, updates?: any) => Promise<{ success: boolean; error?: string }>;
}

export const UserModal: React.FC<UserModalProps> = ({ user, roles, onClose, onSave }) => {
  const [language] = useState<Language>('en'); // Default to English
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    role_name: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        full_name: user.full_name || '',
        role_name: user.role_name || '',
        password: '',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        full_name: '',
        role_name: 'Sales Engineer',
        password: '',
      });
    }
  }, [user, roles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (user) {
        // Update existing user
        const { password, ...updateData } = formData;
        const result = await onSave(user.id, updateData);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Erreur lors de la mise à jour');
        }
      } else {
        // Create new user
        if (!formData.password) {
          setError('Le mot de passe est requis pour créer un utilisateur');
          return;
        }
        const result = await onSave(formData);
        if (result.success) {
          onClose();
        } else {
          setError(result.error || 'Erreur lors de la création');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {user ? getTranslation(language, 'editUser') : getTranslation(language, 'newUser')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 mb-1">{getTranslation(language, 'error')}</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {getTranslation(language, 'username')}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="nom.utilisateur"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {getTranslation(language, 'email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="utilisateur@exemple.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {getTranslation(language, 'fullName')}
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Prénom Nom"
            />
          </div>

          {!user && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {getTranslation(language, 'password')} *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!user}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {getTranslation(language, 'role')}
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={formData.role_name}
                onChange={(e) => setFormData({ ...formData, role_name: e.target.value })}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">{getTranslation(language, 'selectRole')}</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>
                    {role.name} - {role.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              {getTranslation(language, 'cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {user ? getTranslation(language, 'update') : getTranslation(language, 'create')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};