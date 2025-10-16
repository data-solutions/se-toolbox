import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types pour le système d'utilisateurs personnalisé
export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  permissions: Record<string, boolean>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name: string | null;
  role_id: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  role?: UserRole;
}

interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  is_active: boolean;
  created_at: string;
  expires_at: string;
  last_activity: string | null;
}

export interface AdminUserView {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  connection_count: number;
  role_name: string | null;
  role_description: string | null;
  role_permissions: Record<string, boolean> | null;
  created_by_username: string | null;
  created_by_email: string | null;
}

// Interface pour l'authentification
export interface AuthResponse {
  user_id: string;
  username: string;
  email: string;
  full_name: string | null;
  role_name: string;
  role_permissions: Record<string, boolean>;
  session_token: string;
}

// Interface pour la validation de session
interface SessionValidation {
  user_id: string;
  username: string;
  email: string;
  full_name: string | null;
  role_name: string;
  role_permissions: Record<string, boolean>;
}

// Fonctions d'authentification
export const authenticateUser = async (email: string, password: string): Promise<AuthResponse> => {
  const { data, error } = await supabase.rpc('authenticate_user', {
    p_email: email,
    p_password: password
  });

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Authentification échouée');

  return data[0];
};

export const validateSession = async (sessionToken: string): Promise<SessionValidation> => {
  const { data, error } = await supabase.rpc('validate_session', {
    p_session_token: sessionToken
  });

  if (error) throw error;
  if (!data || data.length === 0) throw new Error('Session invalide');

  return data[0];
};

export const logoutUser = async (sessionToken: string): Promise<boolean> => {
  const { data, error } = await supabase.rpc('logout_user', {
    p_session_token: sessionToken
  });

  if (error) throw error;
  return data;
};

const createUser = async (
  email: string,
  username: string,
  password: string,
  fullName?: string,
  roleName?: string
): Promise<string> => {
  const { data, error } = await supabase.rpc('create_user', {
    p_email: email,
    p_username: username,
    p_password: password,
    p_full_name: fullName,
    p_role_name: roleName
  });

  if (error) throw error;
  return data;
};

// Alias pour compatibilité
type UserProfile = AppUser;