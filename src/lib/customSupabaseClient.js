import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xekvwtqnbwskfygrffjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhla3Z3dHFuYndza2Z5Z3JmZmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjc2MjYsImV4cCI6MjA2MTk0MzYyNn0.0vnxZHb3EPAkgJLyeoIwAX0GdBg70ULVsbi1rqwQjuE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
