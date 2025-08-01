// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement pour Supabase
// Assurez-vous que ces variables sont définies dans votre projet Vercel
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL ou Anon Key non définies. Vérifiez vos variables d'environnement VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
