import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import type { ReactNode } from "react";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import type { Database } from "@/types/supabase";

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
  resetAuthState: () => void;
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
      } else {
        console.error("[auth] profile fetch error:", error);
      }
      return false;
    }

    // Block deactivated/rejected users — sign them out immediately
    if (data?.status && data.status !== "active" && data.status !== "pending_review") {
      logAuth("blocked", { userId, status: data.status });
      useAuthStore.getState().setProfile(null);
      await supabase.auth.signOut();
      return false;
    }

    useAuthStore.getState().setProfile(data);
    logAuth("profile loaded", {
      userId,
      role: data?.role ?? null,
      status: data?.status ?? null,
    });
    return true;
  } catch (err) {
    console.error("[auth] profile fetch exception:", err);
    return false;
  }
}

async function fetchProfileWithTimeout(userId: string, timeoutMs = 1500) {
  const timeoutPromise = new Promise<boolean>((resolve) => {
    const id = window.setTimeout(() => resolve(false), timeoutMs);
    void id;
  });

  return Promise.race([fetchProfile(userId), timeoutPromise]);
}

type UserProfileRow = Database["public"]["Tables"]["users_profile"]["Row"];

function buildFallbackProfile(user: User): UserProfileRow {
  const now = new Date().toISOString();
  const role =
    (user.user_metadata?.role as UserProfileRow["role"]) ||
    "barangay_official";

  return {
    id: user.id,
    barangay_id: null,
    full_name:
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email ||
      "Unknown",
    email: user.email ?? "",
    phone_number: null,
    avatar_url: null,
    role,
    status: "active",
    approved_by: null,
    approved_at: null,
    created_at: now,
    updated_at: now,
  };
}

// ─── Provider ───────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const subRef = useRef<{ unsubscribe: () => void } | null>(null);

  // Single subscription — handles EVERYTHING (NextGen pattern)
  // Uses subRef + bootstrappedRef to survive StrictMode double-mount.
  // Keep isMounted for React state updates (setSession), but let zustand
  // store updates (setProfile, setInitialized) through even after cleanup
  // — otherwise StrictMode races leave isInitialized=false forever.
  useEffect(() => {
    if (subRef.current) return;

    let isMounted = true;
    const bootstrapped = { current: false };
    const initFallback = window.setTimeout(() => {
      if (!useAuthStore.getState().isInitialized) {
        console.warn("[auth] init fallback fired");
        useAuthStore.getState().setInitialized();
        setLoading(false);
      }
    }, 2500);

    const bootstrap = async () => {
      if (bootstrapped.current) return;
      bootstrapped.current = true;

      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("[auth] getSession error:", error.message);
      }

      if (isMounted) {
        setSession(data.session ?? null);
      }

      if (data.session?.user?.id) {
        const loaded = await fetchProfileWithTimeout(data.session.user.id);
        if (!loaded) {
          useAuthStore.getState().setProfile(
            buildFallbackProfile(data.session.user)
          );
        }
      } else {
        useAuthStore.getState().setProfile(null);
      }

      setLoading(false);
      useAuthStore.getState().setInitialized();
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      logAuth("event", { event, userId: currentSession?.user?.id ?? null });

      if (isMounted) {
        setSession(currentSession);
      }

      switch (event) {
        case "INITIAL_SESSION":
          if (bootstrapped.current) return;
          bootstrapped.current = true;

          if (currentSession?.user?.id) {
            const loaded = await fetchProfileWithTimeout(currentSession.user.id);
            if (!loaded) {
              useAuthStore.getState().setProfile(
                buildFallbackProfile(currentSession.user)
              );
            }
          } else {
            useAuthStore.getState().setProfile(null);
          }

          // These go through zustand — safe even if React unmounted
          setLoading(false);
          useAuthStore.getState().setInitialized();
          break;

        case "SIGNED_IN":
          useAuthStore.getState().setTransitioning(false);
          if (currentSession?.user?.id && !useAuthStore.getState().profile) {
            void fetchProfile(currentSession.user.id);
          }
          if (!useAuthStore.getState().isInitialized) {
            setLoading(false);
            useAuthStore.getState().setInitialized();
          }
          break;

        case "SIGNED_OUT":
          useAuthStore.getState().clear();
          if (!useAuthStore.getState().isInitialized) {
            setLoading(false);
            useAuthStore.getState().setInitialized();
          }
          break;

        case "TOKEN_REFRESHED":
          if (currentSession?.user?.id && !useAuthStore.getState().profile) {
            await fetchProfile(currentSession.user.id);
          }
          break;

        case "USER_UPDATED":
          if (currentSession?.user?.id) {
            await fetchProfile(currentSession.user.id);
          }
          break;
      }
    });

    subRef.current = subscription;

    return () => {
      window.clearTimeout(initFallback);
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

        useAuthStore.getState().setTransitioning(true);
        const result = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (result.error) {
          useAuthStore.getState().setTransitioning(false);
          return { error: result.error.message, data: null };
        }

        // Immediately check if user is deactivated/rejected — sign out if so
        if (result.data?.user) {
          const { data: profile } = await supabase
            .from("users_profile")
            .select("status")
            .eq("id", result.data.user.id)
            .single();

          if (profile?.status && profile.status !== "active" && profile.status !== "pending_review") {
            await supabase.auth.signOut();
            useAuthStore.getState().setTransitioning(false);
            return { error: "Your account has been deactivated. Contact an administrator.", data: null };
          }
        }

        return {
          error: null,
          data: result.data?.session ?? null,
        };
      } catch (err) {
        useAuthStore.getState().setTransitioning(false);
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
    useAuthStore.getState().setTransitioning(true);
    try {
      const result = await supabase.auth.signOut();
      if (result.error) {
        console.warn("[auth] signOut API error:", result.error.message);
      }
      localStorage.removeItem("auth-remember-me");
      sessionStorage.removeItem("auth-remember-me");
      useAuthStore.getState().clear();
      setSession(null);
      setLoading(false);
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
      setSession(null);
      setLoading(false);
      useAuthStore.getState().setTransitioning(false);
      return { error: msg, data: null };
    }
  }, []);

  const resetAuthState = useCallback(() => {
    useAuthStore.getState().clear();
    useAuthStore.getState().setInitialized();
    setSession(null);
    setLoading(false);
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
        resetAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return ctx;
}
