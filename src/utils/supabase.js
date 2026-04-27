import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// If env vars not set, return a mock client (for local dev without Supabase)
const isMock = !supabaseUrl || !supabaseAnonKey;

export const supabase = isMock ? null : createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseReady = !isMock;
