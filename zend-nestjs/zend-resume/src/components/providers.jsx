"use client";

import { AuthProvider } from "@/contexts/auth-context";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}

