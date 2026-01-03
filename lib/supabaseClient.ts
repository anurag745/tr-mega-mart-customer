import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';


let supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Fallback for web (where Constants.expoConfig is undefined)
if (typeof window !== 'undefined') {
  const w = window as any;
  supabaseUrl = supabaseUrl || (w.env && w.env.EXPO_PUBLIC_SUPABASE_URL) || w.EXPO_PUBLIC_SUPABASE_URL;
  supabaseAnonKey = supabaseAnonKey || (w.env && w.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || w.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);