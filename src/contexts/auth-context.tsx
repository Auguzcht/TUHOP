import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";

// ─── Types ─────────────────────────────────────────────────

const isDev = import.meta.env.DEV;

const logAuth = (...args: unknown[]) => {
  if (isDev) {
    console.info("[auth]", ...args);
  }
};

type AuthResult = {
  error: string | null;
  data: Session | null;
};

type AuthContextValue = {
  session: Session | null;
  profile: ReturnType<typeof useAuthStore.getState>["profile"];
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string,
    metadata?: Record<string, string>
  ) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Profile fetch helper ──────────────────────────────────

async function fetchProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from("users_profile")
      .select("*, barangays(name, districts(name))")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Row not found (trigger hasn't created it yet)
        useAuthStore.getState().setProfile(null);
      } else {
        console.error("[auth] profile fetch error:", error);
        useAuthStore.getState().setProfile(null);
      }
      return;
    }

    useAuthStore.getState().setProfile(data);
    logAuth("profile loaded", {
      userId,
      role: data?.role ?? null,
      status: data?.status ?? null,
    });
  } catch (err) {
    console.error("[auth] profile fetch exception:", err);
    useAuthStore.getState().setProfile(null);
  }
}

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Single subscription — mirrors NextGen pattern exactly
  useEffect(() => {
    // Prevent double subscription in StrictMode
    if (subRef.current) return;

    let isMounted = true;

    const initializeSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error("[auth] getSession error:", error);
        }

        const currentSession = data.session ?? null;
        setSession(currentSession);
        logAuth("getSession", {
          hasSession: Boolean(currentSession),
          userId: currentSession?.user?.id ?? null,
        });

        if (currentSession?.user?.id) {
          // Load profile in the background so init does not block the UI.
          void fetchProfile(currentSession.user.id);
        } else {
          useAuthStore.getState().setProfile(null);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("[auth] getSession exception:", err);
        useAuthStore.getState().setProfile(null);
      } finally {
        if (!isMounted) return;
        setLoading(false);
        useAuthStore.getState().setInitialized();
      }
    };

    initializeSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      logAuth("auth event", {
        event,
        userId: currentSession?.user?.id ?? null,
      });

      switch (event) {
        case "INITIAL_SESSION":
          // Page load, tab refocus, token refresh
          if (currentSession?.user?.id) {
            void fetchProfile(currentSession.user.id);
          } else {
            useAuthStore.getState().setProfile(null);
          }
          setLoading(false);
          useAuthStore.getState().setInitialized();
          break;

        case "SIGNED_IN":
          if (currentSession?.user?.id) {
            void fetchProfile(currentSession.user.id);
          }
          break;

        case "SIGNED_OUT":
          useAuthStore.getState().clear();
          break;

        case "TOKEN_REFRESHED":
          // Supabase auto-refreshed — session is already updated
          if (currentSession?.user?.id && !useAuthStore.getState().profile) {
            void fetchProfile(currentSession.user.id);
          }
          break;

        case "USER_UPDATED":
          // User data changed (email, metadata)
          if (currentSession?.user?.id) {
            void fetchProfile(currentSession.user.id);
          }
          break;
      }
    });

    subRef.current = subscription;

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      subRef.current = null;
    };
  }, []);

  // ─── Actions ───────────────────────────────────────────────

  const signIn = useCallback(
    async (email: string, password: string, rememberMe?: boolean): Promise<AuthResult> => {
      try {
        // Set preference BEFORE sign-in so custom storage adapter routes session correctly
        if (rememberMe) {
          localStorage.setItem("auth-remember-me", "true");
          sessionStorage.setItem("auth-remember-me", "true");
        } else {
          localStorage.removeItem("auth-remember-me");
          sessionStorage.setItem("auth-remember-me", "false");
        }

        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return {
          error: result.error?.message ?? null,
          data: result.data?.session ?? null,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign in failed";
        return { error: msg, data: null };
      }
    },
    []
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, string>
    ): Promise<AuthResult> => {
      try {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: { data: metadata ?? {} },
        });
        return {
          error: result.error?.message ?? null,
          data: result.data?.session ?? null,
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign up failed";
        return { error: msg, data: null };
      }
    },
    []
  );

  const signOut = useCallback(async (): Promise<AuthResult> => {
    try {
      const result = await supabase.auth.signOut();
      if (result.error) {
        console.warn("[auth] signOut API error:", result.error.message);
      }
      // Clear remember me preference
      localStorage.removeItem("auth-remember-me");
      sessionStorage.removeItem("auth-remember-me");

      // Store is cleared by SIGNED_OUT event handler, but clear
      // immediately too so the UI updates before the event fires.
      useAuthStore.getState().clear();
      return {
        error: result.error?.message ?? null,
        data: null,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign out failed";
      console.error("[auth] signOut threw:", err);
      localStorage.removeItem("auth-remember-me");
      sessionStorage.removeItem("auth-remember-me");
      useAuthStore.getState().clear();
      return { error: msg, data: null };
    }
  }, []);

  const profile = useAuthStore((s) => s.profile);

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
