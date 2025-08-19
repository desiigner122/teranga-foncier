// src/services/supabaseDataServiceExtended.js
import SupabaseDataService from './supabaseDataService';
import { extendSupabaseDataService, createUserWithPassword } from './supabaseUserExtension';

// Étendre le service avec les nouvelles méthodes
const ExtendedSupabaseDataService = extendSupabaseDataService(SupabaseDataService);

// Exporter le service étendu
export default ExtendedSupabaseDataService;
