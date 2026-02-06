import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if we're running on the server (SSR) or client
const isServer = typeof window === 'undefined';

// Web storage adapter using localStorage
const webStorage = {
  getItem: async (key: string) => {
    if (isServer) return null;
    return localStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (isServer) return;
    localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isServer) return;
    localStorage.removeItem(key);
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: webStorage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
