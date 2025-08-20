// src/hooks/useAuthValidation.js
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

/**
 * Hook personnalis� pour valider en continu l'authentification et la session
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

        // 1. V�rifier que la session Supabase est valide
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          console.warn('Session invalide d�tect�e');
          await handleInvalidSession('Session expir�e');
          return;
        }

        // 2. V�rifier que l'utilisateur existe encore en base
        const { data: userExists, error: userError } = await supabase
          .from('users')
          .select('id, status, active, blocked_at')
          .eq('id', user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // Utilisateur supprim� de la base
          console.warn('Utilisateur supprim� de la base de donn�es');
          await handleInvalidSession('Compte supprim�');
          return;
        }

        if (userError) {
          console.error('Erreur lors de la validation utilisateur:', userError);
          return;
        }

        // 3. V�rifier le statut de l'utilisateur
        if (!userExists || userExists.status === 'deleted' || userExists.status === 'blocked' || !userExists.active) {
          const reason = userExists?.status === 'blocked' ? 'Compte bloqu�' : 'Compte d�sactiv�';
          console.warn(`Utilisateur ${reason}:`, userExists);
          await handleInvalidSession(reason);
          return;
        }

        // 4. V�rifier que l'utilisateur existe encore dans Supabase Auth
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id);
          
          if (authError && authError.status === 404) {
            console.warn('Utilisateur supprim� de Supabase Auth');
            await handleInvalidSession('Compte supprim� du syst�me d\'authentification');
            return;
          }
        } catch (authValidationError) {
          // Si on n'a pas les permissions admin, on ignore cette v�rification
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
        description: `${reason}. Vous allez �tre d�connect�.`,
        duration: 5000
      });

      // D�connexion forc�e
      setTimeout(async () => {
        await signOut();
        navigate('/login', { replace: true });
      }, 2000);
    };

    // Validation initiale
    validateUserSession();

    // Validation p�riodique toutes les 30 secondes
    const interval = setInterval(validateUserSession, 30000);

    return () => {
      clearInterval(interval);
    };

  }, [user, signOut, navigate, toast]);

  // �couter les changements d'�tat d'authentification
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log('Utilisateur d�connect�:', event);
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

