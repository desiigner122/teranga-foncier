import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

;
/**
 * Store global pour la gestion des feature flags
 * Simplifie l'accès aux fonctionnalités activées/désactivées
 */
export const useFeatureFlagsStore = create((set, get) => ({
  // État initial
  flags: {},
  isLoading: true,
  error: null,
  
  // Actions
  loadFlags: async () => {
    set({ isLoading: true, error: null });
    
    try {
      // Vérifier si la table existe d'abord
      const { error: tableCheckError } = await supabase
        .from('feature_flags')
        .select('name')
        .limit(1);
      
      // Si la table n'existe pas, créer des flags par défaut en mémoire
      if (tableCheckError && tableCheckError.code === '42P01') {        set({
          flags: {
            'show_chatbot': true,
            'show_dashboard_assistant': true,
            'enable_notifications': true,
            'enable_realtime': true
          },
          isLoading: false
        });
        return;
      }
      
      // Charger les drapeaux depuis la base de données
      const { data, error } = await supabase
        .from('feature_flags')
        .select('name, enabled, description');
      
      if (error) throw error;
      
      // Transformer en objet pour accès facile
      const flagsMap = {};
      (data || []).forEach(flag => {
        flagsMap[flag.name] = flag.enabled;
      });
      
      set({ flags: flagsMap, isLoading: false });
    } catch (err) {      set({ 
        error: err.message, 
        isLoading: false,
        // Valeurs par défaut en cas d'erreur
        flags: {
          'show_chatbot': true,
          'show_dashboard_assistant': true,
          'enable_notifications': true,
          'enable_realtime': true
        }
      });
    }
  },
  
  // Utilitaire pour vérifier un flag spécifique
  isEnabled: (flagName, defaultValue = false) => {
    const { flags, isLoading } = get();
    
    // Si en cours de chargement, utiliser la valeur par défaut
    if (isLoading) return defaultValue;
    
    // Renvoyer la valeur du flag ou la valeur par défaut
    return flags[flagName] !== undefined ? flags[flagName] : defaultValue;
  },
  
  // Modifier un flag localement (utile pour tester)
  setFlag: (flagName, value) => {
    set(state => ({
      flags: {
        ...state.flags,
        [flagName]: value
      }
    }));
  }
}));

// Hook d'accès rapide à un flag spécifique
export const useFeatureFlag = (flagName, defaultValue = false) => {
  const { flags, isLoading, error, isEnabled } = useFeatureFlagsStore();
  
  // Fonction spécialisée pour ce flag
  return {
    isEnabled: isEnabled(flagName, defaultValue),
    isLoading,
    error
  };
};

// Export par défaut pour compatibilité
export default useFeatureFlagsStore;
