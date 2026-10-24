import { LogOut, Menu, Radar, ShieldCheck, UserCircle2 } from "lucide-react";
import { useState } from "react";

import { AdminPanel } from "@/components/admin/AdminPanel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthUI } from "@/hooks/useAuthUI";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "SECOP II", href: "#resultados" },
  { label: "SECOP I", href: "#resultados" },
  { label: "Documentación", href: "#documentacion" },
  { label: "Alertas", href: "#alertas" },
];

export function Navbar() {
  const { isConfigured, loading, user, profile, isAdmin, signOut } = useAuth();
  const { openAuth } = useAuthUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);

  const displayName = profile?.full_name || user?.email || "";

  /** Controles de autenticación reutilizados en desktop y móvil. */
  const AuthControls = ({ stacked = false }: { stacked?: boolean }) => {
    if (loading) {
      return <div className="h-9 w-24 animate-pulse rounded-md bg-secondary" />;
    }
    if (!isConfigured) {
      return (
        <Button
          size="sm"
          variant="outline"
          disabled
          title="Autenticación no configurada (faltan credenciales de Supabase)"
        >
          Ingresar
        </Button>
      );
    }
    if (!user) {
      return (
        <Button size="sm" variant="accent" onClick={() => openAuth("login")}>
          Ingresar
        </Button>
      );
    }
    return (
      <div className={cn("flex items-center gap-2", stacked && "flex-col items-stretch")}>
        {isAdmin && (
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAdminOpen(true)}>
            <ShieldCheck className="h-4 w-4 text-accent" />
            Administración
          </Button>
        )}
        <div className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5">
          <UserCircle2 className="h-4 w-4 text-accent" />
          <span className="max-w-[140px] truncate text-sm font-medium text-foreground" title={displayName}>
            {displayName}
          </span>
        </div>
        <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => void signOut()}>
          <LogOut className="h-4 w-4" />
          Salir
        </Button>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <nav className="container flex h-16 items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground ring-1 ring-accent/30">
            <Radar className="h-5 w-5 text-accent" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-base font-extrabold tracking-tight text-foreground">
              Radar<span className="text-accent"> Público</span>
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Inteligencia de Contratación · SECOP I & II
            </span>
          </span>
        </a>

        <div className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="ml-2">
            <AuthControls />
          </div>
        </div>

        <button
          className="rounded-md p-2 text-foreground lg:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <Menu className="h-5 w-5" />
        </button>
      </nav>

      <div className={cn("border-t border-border lg:hidden", menuOpen ? "block" : "hidden")}>
        <div className="container flex flex-col gap-1 py-3">
          {LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
          <div className="mt-2">
            <AuthControls stacked />
          </div>
        </div>
      </div>

      {isAdmin && <AdminPanel open={adminOpen} onOpenChange={setAdminOpen} />}
    </header>
  );
}
