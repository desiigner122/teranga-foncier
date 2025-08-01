    // src/lib/supabaseClient.js
    import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Erreur: Les variables d'environnement SUPABASE_URL ou SUPABASE_ANON_KEY ne sont pas définies.");
      // En production, vous pourriez vouloir lancer une erreur pour éviter un comportement inattendu
      // throw new Error("Supabase environment variables are missing.");
    }

    // Crée et exporte une seule instance du client Supabase.
    // Cela garantit qu'il n'y a pas de multiples instances de GoTrueClient.
    export const supabase = createClient(supabaseUrl, supabaseAnonKey);
    