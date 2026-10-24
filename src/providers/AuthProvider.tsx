import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { authService } from "@/services/authService";
import type { AuthResult, AuthUser, Credentials, Profile } from "@/types/auth";

export interface AuthContextValue {
  /** ¿Supabase está configurado? Si no, las acciones de auth no están disponibles. */
  isConfigured: boolean;
  /** Cargando sesión/perfil inicial. */
  loading: boolean;
  session: Session | null;
  user: AuthUser | null;
  profile: Profile | null;
  isAdmin: boolean;
  signIn: (credentials: Credentials) => Promise<AuthResult>;
  signUp: (credentials: Credentials) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const isConfigured = authService.isConfigured;
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(isConfigured);

  // Evita setState tras unmount.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const loadProfile = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      if (mounted.current) setProfile(null);
      return;
    }
    const p = await authService.getProfile(userId);
    if (mounted.current) setProfile(p);
  }, []);

  // Inicialización + suscripción a cambios de sesión.
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    let active = true;

    authService.getSession().then(async (s) => {
      if (!active) return;
      setSession(s);
      await loadProfile(s?.user?.id);
      if (active) setLoading(false);
    });

    const subscription = authService.onAuthStateChange((_event, s) => {
      setSession(s);
      void loadProfile(s?.user?.id);
    });

    return () => {
      active = false;
      subscription?.unsubscribe();
    };
  }, [isConfigured, loadProfile]);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user?.id);
  }, [loadProfile, session?.user?.id]);

  const value = useMemo<AuthContextValue>(() => {
    const user: AuthUser | null = session?.user
      ? { id: session.user.id, email: session.user.email ?? null }
      : null;
    return {
      isConfigured,
      loading,
      session,
      user,
      profile,
      isAdmin: authService.isAdmin(profile),
      signIn: authService.signIn,
      signUp: authService.signUp,
      signOut: authService.signOut,
      refreshProfile,
    };
  }, [isConfigured, loading, session, profile, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
