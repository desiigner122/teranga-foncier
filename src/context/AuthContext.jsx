// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (error) {
        console.warn("Profil utilisateur non trouvé. C'est normal si l'utilisateur vient de s'inscrire et que le trigger n'a pas encore tourné.", error.message);
        return { ...authUser, email: authUser.email, id: authUser.id, verification_status: 'not_verified' };
      }
      return { ...authUser, ...data };
    } catch (err) {
      console.error("Erreur lors de la récupération du profil:", err);
      return authUser;
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    const getActiveSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      const userProfile = await fetchUserProfile(activeSession?.user);
      setUser(userProfile);
      setLoading(false);
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const userProfile = await fetchUserProfile(session?.user);
      setUser(userProfile);
      // Ne mettez setLoading(false) qu'après le premier chargement pour éviter les flashs
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile]);

  const value = {
    session,
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isAgent: user?.role === 'agent',
    loading,
    signOut: () => supabase.auth.signOut(),
    // Fonction essentielle pour forcer la mise à jour de l'état de l'utilisateur
    refreshUser: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const userProfile = await fetchUserProfile(authUser);
            setUser(userProfile);
        }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="flex h-screen w-full items-center justify-center">
          <LoadingSpinner size="large" />
        </div>
      ) : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
