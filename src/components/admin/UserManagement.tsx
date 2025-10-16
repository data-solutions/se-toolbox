import React, { useState } from 'react';
import { Users, Plus, Search, Filter, MoreVertical, Shield, UserCheck, UserX, Edit3, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import { AdminUserView } from '../../lib/supabase';
import { UserModal } from './UserModal';
import { RoleModal } from './RoleModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { getTranslation } from '../../utils/translations';
import { Language } from '../../types';

export const UserManagement: React.FC = () => {
  const { users, roles, loading, error, assignRole, deactivateUser, activateUser, updateUserProfile, deleteUser, createNewUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserView | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUserView | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [language] = useState<Language>('en'); // Default to English

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesRole = selectedRole === 'all' || user.role_name === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  const handleUserAction = async (action: string, userId: string) => {
    setActionLoading(userId);
    
    try {
      switch (action) {
        case 'deactivate':
          await deactivateUser(userId);
          break;
        case 'activate':
          await activateUser(userId);
          break;
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    setActionLoading(userToDelete.id);
    try {
      const result = await deleteUser(userToDelete.id);
      if (result.success) {
        setShowDeleteModal(false);
        setUserToDelete(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateUser = async (userData: any) => {
    const result = await createNewUser(userData);
    return result;
  };
  const handleRoleChange = async (userId: string, roleName: string) => {
    setActionLoading(userId);
    try {
      await assignRole(userId, roleName);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleColor = (roleName: string | null) => {
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

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getTranslation(language, 'userManagement')}</h2>
              <p className="text-gray-600">{users.length} {getTranslation(language, 'usersTotal')}</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowRoleModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Shield className="h-4 w-4" />
              {getTranslation(language, 'manageRoles')}
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              {getTranslation(language, 'export')}
            </button>
            <button
              onClick={() => setShowUserModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {getTranslation(language, 'newUser')}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={getTranslation(language, 'searchByName')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="lg:w-64">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="all">{getTranslation(language, 'allRoles')}</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'user')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'role')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'status')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'connectionCount')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'lastLogin')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{getTranslation(language, 'createdOn')}</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">{getTranslation(language, 'actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.full_name || user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    <select
                      value={user.role_name || ''}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={actionLoading === user.id}
                      className={`text-xs px-3 py-2 rounded-lg border font-medium ${getRoleColor(user.role_name)} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                      ))}
                    </select>
                  </td>
                  
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(user.is_active)}`}>
                      {user.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">
                        {user.connection_count || 0}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        (user.connection_count || 0) > 10 
                          ? 'bg-green-100 text-green-800' 
                          : (user.connection_count || 0) > 5 
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {(user.connection_count || 0) > 10 
                          ? getTranslation(language, 'activeUser')
                          : (user.connection_count || 0) > 5 
                            ? getTranslation(language, 'regularUser')
                            : getTranslation(language, 'newUser')
                        }
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Jamais'
                    }
                  </td>
                  
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowUserModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title={getTranslation(language, 'edit')}
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleUserAction(user.is_active ? 'deactivate' : 'activate', user.id)}
                        disabled={actionLoading === user.id}
                        className={`p-2 rounded-lg transition-colors ${
                          user.is_active
                            ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-green-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                        title={user.is_active ? getTranslation(language, 'deactivate') : getTranslation(language, 'activate')}
                      >
                        {actionLoading === user.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                        ) : user.is_active ? (
                          <UserX className="h-4 w-4" />
                        ) : (
                          <UserCheck className="h-4 w-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={getTranslation(language, 'deleteUser')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">{getTranslation(language, 'noUsersFound')}</h3>
            <p className="text-gray-500">{getTranslation(language, 'tryModifyingSearch')}</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showUserModal && (
        <UserModal
          user={selectedUser}
          roles={roles}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          onSave={selectedUser ? updateUserProfile : handleCreateUser}
        />
      )}

      {showRoleModal && (
        <RoleModal
          roles={roles}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {showDeleteModal && userToDelete && (
        <DeleteConfirmModal
          user={userToDelete}
          onConfirm={handleDeleteUser}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          loading={actionLoading === userToDelete.id}
        />
      )}
    </div>
  );
};