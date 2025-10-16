import { useState, useEffect } from 'react';
import { supabase, AppUser, UserRole, AdminUserView } from '../lib/supabase';

export const useUsers = () => {
  const [users, setUsers] = useState<AdminUserView[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admin_users_view')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching roles');
    }
  };

  const assignRole = async (userId: string, roleName: string) => {
    try {
      const { error } = await supabase.rpc('admin_assign_role', {
        p_user_id: userId,
        p_role_name: roleName,
      });

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error assigning role';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deactivateUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_deactivate_user', {
        p_user_id: userId,
      });

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deactivating user';
      setError(message);
      return { success: false, error: message };
    }
  };

  const activateUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_activate_user', {
        p_user_id: userId,
      });

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error activating user';
      setError(message);
      return { success: false, error: message };
    }
  };

  const updateUserProfile = async (userId: string, updates: Partial<AppUser>) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating user';
      setError(message);
      return { success: false, error: message };
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('admin_delete_user', {
        p_user_id: userId,
      });

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting user';
      setError(message);
      return { success: false, error: message };
    }
  };

  const createNewUser = async (userData: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    role_name?: string;
  }) => {
    try {
      const { error } = await supabase.rpc('admin_create_user', {
        p_email: userData.email,
        p_username: userData.username,
        p_password: userData.password,
        p_full_name: userData.full_name,
        p_role_name: userData.role_name || 'Sales Engineer',
      });

      if (error) throw error;
      await fetchUsers(); // Refresh users list
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating user';
      setError(message);
      return { success: false, error: message };
    }
  };
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    assignRole,
    deactivateUser,
    activateUser,
    updateUserProfile,
    deleteUser,
    createNewUser,
    clearError: () => setError(null),
  };
};