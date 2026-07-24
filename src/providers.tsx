"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./context/AuthContext";
import SignInModal from "./components/SignInModal";
import QueryProvider from "./providers/QueryProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <SignInModal />
      </AuthProvider>
    </QueryProvider>
  );
}
