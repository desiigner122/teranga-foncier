// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from "@/components/ui/use-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = useCallback(async (authUser) => {
    if (!authUser) return null;
    try {
      // Première tentative par ID dans la table profiles
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      // Si pas trouvé par ID, essayer par email
      if (!data && !error) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        // Créer un profil de base à partir des métadonnées user
        return {
          id: authUser.id,
          email: authUser.email,
          first_name: authUser.user_metadata?.first_name || authUser.email.split('@')[0],
          last_name: authUser.user_metadata?.last_name || '',
          user_type: authUser.user_metadata?.user_type || 'particulier',
          status: 'active',
          email_verified: !!authUser.email_confirmed_at,
          phone_verified: false,
          identity_verified: false,
          created_at: authUser.created_at,
          updated_at: new Date().toISOString()
        };
      }
      
      if (data) {
        console.log("Profil récupéré:", { 
          email: data.email, 
          user_type: data.user_type, 
          status: data.status, 
          email_verified: data.email_verified 
        });
        return data;
      }
  return null;

    } catch (err) {
      // En cas d'erreur complète, créer un profil de base
      return {
        id: authUser.id,
        email: authUser.email,
        first_name: authUser.email.split('@')[0],
        last_name: '',
        user_type: 'particulier',
        status: 'active',
        email_verified: !!authUser.email_confirmed_at,
        phone_verified: false,
        identity_verified: false,
        created_at: authUser.created_at,
        updated_at: new Date().toISOString()
      };
    }
  }, []);

  useEffect(() => {
    const getActiveSession = async () => {
      const { data: { session: activeSession } } = await supabase.auth.getSession();
      setSession(activeSession);
      if (activeSession) {
        const userProfile = await fetchUserProfile(activeSession.user);
        setUser(activeSession.user);
        setProfile(userProfile);
      }
      setLoading(false);
    };

    getActiveSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      if (session) {
        const userProfile = await fetchUserProfile(session.user);
        setUser(session.user);
        setProfile(userProfile);
      } else {
        setUser(null);
        setProfile(null);
      }
      if (loading) setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [fetchUserProfile, loading]);

  const value = {
    session,
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isAdmin: profile?.user_type === 'admin' || profile?.first_name === 'Admin',
    isVerified: (profile?.user_type === 'admin') ? true : profile?.email_verified === true,
    needsVerification: (profile?.user_type === 'admin') ? false : !!profile && !profile?.email_verified,
    isPendingVerification: (profile?.user_type === 'admin') ? false : profile?.status === 'pending',
    signOut: async () => {
      try {
        setLoading(true);
        
        // Nettoyage local d'abord
        setUser(null);
        setProfile(null);
        setSession(null);
        
        // Suppression du stockage local
        localStorage.clear();
        sessionStorage.clear();
        
        // Déconnexion Supabase
        const { error } = await supabase.auth.signOut({ scope: 'global' });
        
        if (error) {
          // Même avec une erreur, on force la déconnexion côté client
        }
        
        toast({ 
          title: "Déconnexion réussie", 
          description: "À bientôt !",
          duration: 2000
        });
        
        // Redirection forcée vers la page d'accueil
        window.location.href = '/';
        
      } catch (err) {
        toast({ 
          variant: "destructive", 
          title: "Erreur de déconnexion", 
          description: "Déconnexion forcée effectuée",
          duration: 3000
        });
        
        // Forcer la déconnexion même en cas d'erreur
        setUser(null);
        setProfile(null);
        setSession(null);
        localStorage.clear();
        window.location.href = '/';
        
      } finally {
        setLoading(false);
      }
    },
    refreshUser: async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
            const userProfile = await fetchUserProfile(authUser);
            setUser(authUser);
            setProfile(userProfile);
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
