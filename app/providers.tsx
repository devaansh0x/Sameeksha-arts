"use client";

import { SessionProvider } from "next-auth/react";

/**
 * Client-side SessionProvider wrapper
 * This component wraps the app to provide session context to all client components
 */
export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
