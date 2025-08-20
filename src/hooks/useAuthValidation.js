// src/hooks/useAuthValidation.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook personnalisé pour valider en continu l'authentification et la session
 */
export const useAuthValidation = () => {
  const { user, profile, signOut } = useAuth();
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Valider l'utilisateur toutes les 30 secondes
  useEffect(() => {
    if (!user) return;

    const validateUserSession = async () => {
      try {
        setIsValidating(true);

        // 1. Vérifier que la session Supabase est valide
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn('Session invalide détectée');
          await handleInvalidSession('Session expirée');
          return;
        }

        // 2. Vérifier que l'utilisateur existe encore en base
        const { data: userExists, error: userError } = await supabase
          .from('users')
          .select('id, status, active, blocked_at')
          .eq('id', user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // Utilisateur supprimé de la base
          console.warn('Utilisateur supprimé de la base de données');
          await handleInvalidSession('Compte supprimé');
          return;
        }

        if (userError) {
          console.error('Erreur lors de la validation utilisateur:', userError);
          return;
        }

        // 3. Vérifier le statut de l'utilisateur
        if (!userExists || userExists.status === 'deleted' || userExists.status === 'blocked' || !userExists.active) {
          const reason = userExists?.status === 'blocked' ? 'Compte bloqué' : 'Compte désactivé';
          console.warn(`Utilisateur ${reason}:`, userExists);
          await handleInvalidSession(reason);
          return;
        }

        // 4. Vérifier que l'utilisateur existe encore dans Supabase Auth
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
          
          if (authError && authError.status === 404) {
            console.warn('Utilisateur supprimé de Supabase Auth');
            await handleInvalidSession('Compte supprimé du système d\'authentification');
            return;
          }
        } catch (authValidationError) {
          // Si on n'a pas les permissions admin, on ignore cette vérification
          console.log('Impossible de valider Auth (permissions admin requises)');
        }

        setLastValidation(new Date());

      } catch (error) {
        console.error('Erreur lors de la validation de session:', error);
      } finally {
        setIsValidating(false);
      }
    };

    const handleInvalidSession = async (reason) => {
      toast({
        variant: 'destructive',
        title: 'Session invalide',
        description: `${reason}. Vous allez être déconnecté.`,
        duration: 5000
      });

      // Déconnexion forcée
      setTimeout(async () => {
        await signOut();
        navigate('/login', { replace: true });
      }, 2000);
    };

    // Validation initiale
    validateUserSession();

    // Validation périodique toutes les 30 secondes
    const interval = setInterval(validateUserSession, 30000);

    return () => {
      clearInterval(interval);
    };

  }, [user, signOut, navigate, toast]);

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log('Utilisateur déconnecté:', event);
        navigate('/login', { replace: true });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate]);

  return {
    isValidating,
    lastValidation
  };
};

