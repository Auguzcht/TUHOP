import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthProvider } from "@/contexts/auth-context";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Stable QueryClient instance — created once at module scope.
 * Does not use useMemo to avoid potential hook resolution conflicts
 * with QueryClientProvider's own hooks in the render tree.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * App root providers.
 *
 * AuthProvider renders ONCE at the top level (never remounts).
 * Loading screen shows while isInitialized=false.
 * Once initialized, children render.
 */
export function AppProviders({ children }: PropsWithChildren) {
  const isInitialized = useAuthStore((s) => s.isInitialized);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {!isInitialized ? (
          <div className="flex min-h-svh items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-accent" />
              <span className="text-xs text-muted-foreground">
                Loading TUHOP...
              </span>
            </div>
          </div>
        ) : (
          children
        )}
      </AuthProvider>
    </QueryClientProvider>
  );
}
