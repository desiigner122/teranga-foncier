// src/contexts/SupabaseAuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const SupabaseAuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

export const SupabaseAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  // Loading géré par le hook temps réel

  useEffect(() => {
    // Récupérer la session initiale
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Erreur lors de la récupération de la session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'auth:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Inscription
  const signUp = async (email, password, metadata = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Connexion
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Réinitialisation du mot de passe
  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation:', error);
      return { data: null, error };
    }
  };

  // Mise à jour du profil
  const updateProfile = async (updates) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.updateUser({
        data: updates,
      });

      if (error) {
        throw error;
      }

      // Mettre à jour aussi dans la table users si elle existe
      if (user && user.id) {
        const { error: profileError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', user.id);

        if (profileError) {
          console.warn('Erreur lors de la mise à jour du profil dans la table users:', profileError);
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Connexion avec Google (optionnel)
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      return { data: null, error };
    }
  };

  // Vérifier si l'utilisateur est un admin
  const isAdmin = () => {
    return user?.user_metadata?.role === 'admin' || user?.app_metadata?.role === 'admin';
  };

  // Vérifier si l'utilisateur a un rôle spécifique
  const hasRole = (role) => {
    return user?.user_metadata?.role === role || user?.app_metadata?.role === role;
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updateProfile,
    signInWithGoogle,
    isAdmin,
    hasRole,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
};

export default SupabaseAuthContext;
