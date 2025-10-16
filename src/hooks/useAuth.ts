import { useState, useEffect, useCallback } from 'react';
import { 
  supabase, 
  AppUser, 
  authenticateUser, 
  validateSession, 
  logoutUser,
  AuthResponse
} from '../lib/supabase';

interface AuthState {
  user: AppUser | null;
  profile: AppUser | null;
  sessionToken: string | null;
  loading: boolean;
  isAdmin: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    sessionToken: null,
    loading: true,
    isAdmin: false,
  });

  const [sessionChecked, setSessionChecked] = useState(false);

  const fetchUserProfile = useCallback(async (userId: string): Promise<AppUser | null> => {
    try {
      const { data, error } = await supabase
        .from('admin_users_view')
        .select(`
          *,
          role_name,
          role_description,
          role_permissions
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      
      // Transformer les données de la vue en format AppUser
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        password_hash: '', // Ne pas exposer le hash
        full_name: data.full_name,
        role_id: null, // Pas nécessaire avec la vue
        is_active: data.is_active,
        last_login: data.last_login,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: null,
        role: data.role_name ? {
          id: '',
          name: data.role_name,
          description: data.role_description,
          permissions: data.role_permissions || {},
          is_active: true,
          created_at: '',
          updated_at: ''
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, []);

  // Vérifier la session stockée UNE SEULE FOIS
  useEffect(() => {
    if (sessionChecked) return;

    const checkStoredSession = async () => {
      console.log('🔍 Vérification session stockée...');
      const storedToken = localStorage.getItem('session_token');
      
      if (storedToken) {
        console.log('🎫 Token trouvé, validation...');
        try {
          const sessionData = await validateSession(storedToken);
          const userProfile = await fetchUserProfile(sessionData.user_id);
          
          console.log('✅ Session valide, utilisateur connecté');
          setAuthState({
            user: userProfile,
            profile: userProfile,
            sessionToken: storedToken,
            loading: false,
            isAdmin: sessionData.role_name === 'Administrator',
          });
        } catch (error) {
          console.error('❌ Session invalide:', error);
          localStorage.removeItem('session_token');
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } else {
        console.log('🚫 Aucun token trouvé');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
      
      setSessionChecked(true);
    };

    checkStoredSession();
  }, [sessionChecked, fetchUserProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion pour:', email);
      const authResponse = await authenticateUser(email, password);
      console.log('✅ Authentification réussie');
      
      const userProfile = await fetchUserProfile(authResponse.user_id);
      console.log('👤 Profil utilisateur récupéré');
      
      // Stocker le token de session
      localStorage.setItem('session_token', authResponse.session_token);
      
      // Mettre à jour l'état
      setAuthState({
        user: userProfile,
        profile: userProfile,
        sessionToken: authResponse.session_token,
        loading: false,
        isAdmin: authResponse.role_name === 'Administrator',
      });
      
      console.log('🎯 Connexion terminée avec succès');
      console.log('🔄 État mis à jour:', { 
        hasUser: !!userProfile, 
        isAdmin: authResponse.role_name === 'Administrator',
        loading: false 
      });
      
      // Force immediate re-render to trigger App component update
      setAuthState(prev => ({ ...prev, loading: false }));
      
      return { data: authResponse, error: null };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
      return { data: null, error };
    }
  }, [fetchUserProfile]);

  const signUp = useCallback(async (email: string, password: string, metadata?: any) => {
    // Pour l'instant, la création d'utilisateurs se fait via l'admin
    return { data: null, error: new Error('La création de compte doit être faite par un administrateur') };
  }, []);

  const signOut = useCallback(async () => {
    try {
      if (authState.sessionToken) {
        await logoutUser(authState.sessionToken);
      }
      
      localStorage.removeItem('session_token');
      
      setAuthState({
        user: null,
        profile: null,
        sessionToken: null,
        loading: false,
        isAdmin: false,
      });
      
      console.log('👋 Déconnexion réussie');
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  }, [authState.sessionToken]);

  const hasPermission = useCallback((permission: string): boolean => {
    return authState.profile?.role?.permissions?.[permission] === true;
  }, [authState.profile?.role?.permissions]);

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    hasPermission,
    refetchProfile: useCallback(() => 
      authState.user && fetchUserProfile(authState.user.id), 
      [authState.user, fetchUserProfile]
    ),
  };
};