// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import LoadingSpinner from '@/components/ui/spinner';
import { useToast } from "@/components/ui/use-toast";
import { useDemo } from './DemoContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { toast } = useToast();
  const { demoMode, demoUser } = useDemo();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
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
      
      if (error && error.code !== 'PGRST116') {
        console.error("Erreur lors de la récupération du profil:", error.message);
        return null;
      }
      
      return data;

    } catch (err) {
      console.error("Erreur inattendue lors de la récupération du profil:", err);
      return null;
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
    user: demoMode ? demoUser : user, // Use demo user if in demo mode
    profile: demoMode ? demoUser?.profile : profile, // Use demo profile if in demo mode
    loading: demoMode ? false : loading, // No loading in demo mode
    isAuthenticated: demoMode ? true : (!!user && !!profile), // Always authenticated in demo mode
    isAdmin: demoMode ? (demoUser?.profile?.role === 'admin' || demoUser?.profile?.type === 'Administrateur') : (profile?.role === 'admin' || profile?.type === 'Administrateur'),
    // Administrateurs exempts de vérification
    isVerified: demoMode ? true : ((profile?.role === 'admin' || profile?.type === 'Administrateur') ? true : profile?.verification_status === 'verified'),
    needsVerification: demoMode ? false : ((profile?.role === 'admin' || profile?.type === 'Administrateur') ? false : profile && !['verified', 'pending'].includes(profile.verification_status)),
    isPendingVerification: demoMode ? false : ((profile?.role === 'admin' || profile?.type === 'Administrateur') ? false : profile?.verification_status === 'pending'),
    signOut: async () => {
      if (demoMode) {
        // In demo mode, don't actually sign out from Supabase
        toast({ title: "Mode Démonstration", description: "Déconnexion simulée" });
        return;
      }
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        toast({ title: "Déconnexion réussie", description: "À bientôt !" });
        setUser(null);
        setProfile(null);
      } catch (err) {
        toast({ variant: "destructive", title: "Erreur de déconnexion", description: err.message });
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
