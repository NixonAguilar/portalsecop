import { createContext, useCallback, useMemo, useState, type ReactNode } from "react";

import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/hooks/useAuth";

type AuthMode = "login" | "register";

export interface AuthUIContextValue {
  /** Abre el modal de autenticación (opcionalmente en modo registro). */
  openAuth: (mode?: AuthMode) => void;
}

export const AuthUIContext = createContext<AuthUIContextValue | null>(null);

/**
 * Centraliza la apertura del modal de login/registro para que cualquier
 * componente (Navbar, CTA de filtros, métricas) pueda invocarlo sin
 * prop-drilling. Renderiza un único AuthModal.
 */
export function AuthUIProvider({ children }: { children: ReactNode }) {
  const { isConfigured } = useAuth();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [instance, setInstance] = useState(0); // fuerza remount para resetear el modal

  const openAuth = useCallback(
    (nextMode: AuthMode = "login") => {
      if (!isConfigured) return;
      setMode(nextMode);
      setInstance((n) => n + 1);
      setOpen(true);
    },
    [isConfigured],
  );

  const value = useMemo<AuthUIContextValue>(() => ({ openAuth }), [openAuth]);

  return (
    <AuthUIContext.Provider value={value}>
      {children}
      {isConfigured && (
        <AuthModal key={instance} open={open} onOpenChange={setOpen} initialMode={mode} />
      )}
    </AuthUIContext.Provider>
  );
}
