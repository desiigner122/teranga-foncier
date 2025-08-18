// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
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
      console.log("Récupération du profil pour:", authUser.email, "ID:", authUser.id);
      
      // Première tentative par ID
      let { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      
      // Si pas trouvé par ID, essayer par email
      if (!data && !error) {
        console.log("Profil non trouvé par ID, tentative par email...");
        const result = await supabase
          .from('users')
          .select('*')
          .eq('email', authUser.email)
          .maybeSingle();
        
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error("Erreur lors de la récupération du profil:", error.message);
        
        // Si l'erreur est 406, on crée un profil de base à partir des métadonnées user
        if (error.code === 'PGRST301' || error.message.includes('406')) {
          console.log("Création d'un profil de base à partir des métadonnées utilisateur");
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: authUser.user_metadata?.full_name || authUser.email,
            type: authUser.user_metadata?.type || 'Particulier',
            role: authUser.user_metadata?.role || 'user',
            verification_status: 'verified',
            created_at: authUser.created_at,
            updated_at: new Date().toISOString()
          };
        }
        return null;
      }
      
      if (data) {
        console.log("Profil récupéré:", { email: data.email, type: data.type, role: data.role });
        return data;
      }
      
      // Si aucun profil trouvé, créer un profil de base
      console.log("Aucun profil trouvé en base, création d'un profil par défaut");
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        type: authUser.user_metadata?.type || 'Particulier',
        role: authUser.user_metadata?.role || 'user',
        verification_status: 'verified',
        created_at: authUser.created_at,
        updated_at: new Date().toISOString()
      };

    } catch (err) {
      console.error("Erreur inattendue lors de la récupération du profil:", err);
      // En cas d'erreur complète, créer un profil de base
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email,
        type: authUser.user_metadata?.type || 'Particulier',
        role: authUser.user_metadata?.role || 'user',
        verification_status: 'verified',
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
    isAuthenticated: !!user, // Simplifié : on ne requiert que l'utilisateur authentifié
    isAdmin: profile?.role === 'admin' || profile?.type === 'Administrateur',
    // Administrateurs exempts de vérification
    isVerified: (profile?.role === 'admin' || profile?.type === 'Administrateur') ? true : profile?.verification_status === 'verified',
    needsVerification: (profile?.role === 'admin' || profile?.type === 'Administrateur') ? false : profile && !['verified', 'pending'].includes(profile.verification_status),
    isPendingVerification: (profile?.role === 'admin' || profile?.type === 'Administrateur') ? false : profile?.verification_status === 'pending',
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
          console.error('Erreur lors de la déconnexion:', error);
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
        console.error('Erreur signOut:', err);
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
