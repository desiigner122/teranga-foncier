// src/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock client for development when environment variables are not configured
const createMockClient = () => ({
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ data: null, error: null })
  }),
  auth: {
    signUp: () => Promise.resolve({ data: null, error: null }),
    signIn: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
  }
});

// Initialize Supabase client
let supabaseClient;

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.DEV) {
  }
  supabaseClient = createMockClient();
} else {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Profile': 'public',
        'Prefer': 'return=representation'
      }
    },
    db: {
      schema: 'public'
    },
    // Ajouter une gestion des erreurs plus robuste
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  });
}

export const supabase = supabaseClient;
    
