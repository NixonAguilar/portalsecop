import { useContext } from "react";

import { AuthUIContext, type AuthUIContextValue } from "@/providers/AuthUIProvider";

/** Acceso al control del modal de autenticación. Requiere <AuthUIProvider>. */
export function useAuthUI(): AuthUIContextValue {
  const ctx = useContext(AuthUIContext);
  if (!ctx) throw new Error("useAuthUI debe usarse dentro de <AuthUIProvider>.");
  return ctx;
}
