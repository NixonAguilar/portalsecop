import { Loader2, ShieldCheck, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogDescription,
  DialogModalContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/format";
import { authService } from "@/services/authService";
import type { Profile } from "@/types/auth";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Panel de administración. Se renderiza solo cuando el usuario autenticado es
 * admin (el control de acceso vive en el Navbar + RLS en la base de datos).
 */
export function AdminPanel({ open, onOpenChange }: AdminPanelProps) {
  const { user, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !isAdmin) return;
    let active = true;
    setLoading(true);
    authService.listProfiles().then((rows) => {
      if (active) {
        setProfiles(rows);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [open, isAdmin]);

  if (!isAdmin) return null;

  const admins = profiles.filter((p) => p.role === "admin").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogModalContent className="max-w-2xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-accent" />
          <DialogTitle>Panel de administración</DialogTitle>
        </div>
        <DialogDescription>
          Sesión de administrador: <strong>{user?.email}</strong>
        </DialogDescription>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" /> Usuarios
            </div>
            <div className="mt-1 text-2xl font-extrabold text-primary">{profiles.length}</div>
          </div>
          <div className="rounded-lg border border-border bg-secondary/40 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4" /> Administradores
            </div>
            <div className="mt-1 text-2xl font-extrabold text-primary">{admins}</div>
          </div>
        </div>

        <div className="max-h-72 overflow-y-auto rounded-lg border border-border thin-scrollbar">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-secondary text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-semibold">Usuario</th>
                <th className="px-3 py-2 font-semibold">Rol</th>
                <th className="px-3 py-2 font-semibold">Registro</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-muted-foreground">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-3 py-2">
                      <div className="font-medium text-foreground">{p.full_name || "—"}</div>
                      <div className="text-xs text-muted-foreground">{p.email}</div>
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={p.role === "admin" ? "accent" : "secondary"}>{p.role}</Badge>
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{formatDate(p.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted-foreground">
          Lectura protegida por RLS: solo los administradores obtienen la lista completa de perfiles.
        </p>
      </DialogModalContent>
    </Dialog>
  );
}
