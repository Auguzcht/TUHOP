import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

/**
 * Custom storage adapter that respects "remember me" preference.
 *
 * - remember me = true:  session stored in localStorage (survives browser close)
 * - remember me = false: session stored in sessionStorage (lost on browser close)
 *
 * Preference is checked via the `auth-remember-me` key in either storage.
 */
const rememberMeStorage = {
  getItem: (key: string) => {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    const rememberMe =
      sessionStorage.getItem("auth-remember-me") === "true" ||
      localStorage.getItem("auth-remember-me") === "true";

    if (rememberMe) {
      localStorage.setItem(key, value);
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
      localStorage.removeItem(key);
    }
  },
  removeItem: (key: string) => {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  },
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: rememberMeStorage,
  },
});
