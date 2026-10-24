import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/providers/AuthProvider";

/** Accede al contexto de autenticación. Debe usarse dentro de <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return ctx;
}
