import { useEffect, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";

import { AuthProvider } from "@/contexts/auth-context";
import { TuhopLoader } from "@/components/shared/TuhopLoader";
import { useAuthStore } from "@/stores/auth-store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

const HOLD_MS = 2000;

export function AppProviders({ children }: PropsWithChildren) {
  const isInitialized = useAuthStore((s) => s.isInitialized);
  const transitioning = useAuthStore((s) => s.transitioning);
  const [held, setHeld] = useState(false);
  const prevLoading = useRef(true);

  const loading = !isInitialized || transitioning;

  // Detect when loading transitions false→true or true→false
  useEffect(() => {
    if (loading) {
      // Loading started — cancel any pending hold
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeld(false);
    } else if (prevLoading.current) {
      // Loading just finished — hold full loader for HOLD_MS
      setHeld(true);
      const t = setTimeout(() => setHeld(false), HOLD_MS);
      return () => clearTimeout(t);
    }
    prevLoading.current = loading;
  }, [loading]);

  const showLoader = loading || held;
  const variant = transitioning || held ? "full" : "minimal";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AnimatePresence mode="wait">
          {showLoader ? (
            <motion.div
              key={variant}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <TuhopLoader variant={variant} />
            </motion.div>
          ) : (
            <motion.div
              key="app"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </AuthProvider>
    </QueryClientProvider>
  );
}
