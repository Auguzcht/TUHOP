import type { PropsWithChildren } from "react";

import { useAuth } from "@/hooks/use-auth";

export function AppProviders({ children }: PropsWithChildren) {
	useAuth();

	return children;
}
