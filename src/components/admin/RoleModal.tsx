import React, { useState } from 'react';
import { X, Shield, Check, AlertCircle, Info } from 'lucide-react';
import { UserRole } from '../../lib/supabase';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

interface RoleModalProps {
  roles: UserRole[];
  onClose: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ roles, onClose }) => {
  const [language] = useState<Language>('en'); // Default to English
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(roles[0] || null);

  const permissionLabels: Record<string, string> = {
    manage_users: 'Gérer les utilisateurs',
    manage_roles: 'Gérer les rôles',
    view_all_data: 'Voir toutes les données',
    system_admin: 'Administration système',
    view_own_data: 'Voir ses propres données',
    create_conversations: 'Créer des conversations',
    upload_files: 'Télécharger des fichiers',
    view_team_data: 'Voir les données de l\'équipe',
    manage_accounts: 'Gérer les comptes',
    view_reports: 'Voir les rapports',
    manage_operations: 'Gérer les opérations',
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'Administrator':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'AE / CSM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Ops Team':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Sales Engineer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">{getTranslation(language, 'roleManagement')}</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex h-[500px]">
          {/* Roles List */}
          <div className="w-1/3 border-r border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">{getTranslation(language, 'availableRoles2')}</h3>
            <div className="space-y-3">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    selectedRole?.id === role.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getRoleColor(role.name)}`}>
                        {role.name}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{role.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role Details */}
          <div className="flex-1 p-6">
            {selectedRole ? (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border ${getRoleColor(selectedRole.name)}`}>
                    {selectedRole.name}
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${
                    selectedRole.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedRole.is_active ? 'Actif' : 'Inactif'}
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="font-semibold text-gray-900 mb-3">{getTranslation(language, 'description')}</h4>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-xl">{selectedRole.description}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">{getTranslation(language, 'permissions')}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(selectedRole.permissions).map(([permission, hasPermission]) => (
                      <div
                        key={permission}
                        className={`flex items-center gap-3 p-4 rounded-xl border ${
                          hasPermission ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className={`p-1 rounded-full ${hasPermission ? 'bg-green-100' : 'bg-gray-100'}`}>
                          {hasPermission ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                        <span className={`text-sm font-medium ${hasPermission ? 'text-green-900' : 'text-gray-600'}`}>
                          {permissionLabels[permission] || permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-1">{getTranslation(language, 'information')}</h5>
                      <p className="text-sm text-blue-700">
                        {getTranslation(language, 'permissionsInfo')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p>{getTranslation(language, 'selectRoleToView')}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            {getTranslation(language, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};